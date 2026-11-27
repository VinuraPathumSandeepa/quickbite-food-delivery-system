package com.fooddelivery.backend;

import com.fooddelivery.backend.config.GlobalExceptionHandler;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.OrderStatus;
import com.fooddelivery.backend.entity.PaymentStatus;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.CustomerOrderRepository;
import com.fooddelivery.backend.repository.UserRepository;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:order_lock_compat;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=3000",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.session_factory.statement_inspector=com.fooddelivery.backend.OrderLockCompatibilityTests$CapturedSql"
})
class OrderLockCompatibilityTests {
    private static final byte[] TEST_KEY = new byte[32];
    static { new SecureRandom().nextBytes(TEST_KEY); }

    @DynamicPropertySource
    static void jwt(DynamicPropertyRegistry registry) {
        registry.add("QUICKBITE_JWT_SECRET_BASE64",
                () -> Base64.getEncoder().encodeToString(TEST_KEY));
    }

    @Autowired CustomerOrderRepository orders;
    @Autowired UserRepository users;
    @Autowired PlatformTransactionManager transactionManager;

    public static class CapturedSql implements StatementInspector {
        static final ConcurrentLinkedQueue<String> statements = new ConcurrentLinkedQueue<>();

        @Override
        public String inspect(String sql) {
            statements.add(sql);
            return sql;
        }
    }

    @Test
    void nativeLockSqlTargetsOrderRowWithoutAliasClause() {
        long id = newOrder();
        CapturedSql.statements.clear();
        new TransactionTemplate(transactionManager).execute(status ->
                orders.findByIdForUpdate(id).orElseThrow());
        assertTrue(CapturedSql.statements.stream().map(String::toLowerCase)
                .anyMatch(sql -> sql.contains("from customer_orders")
                        && sql.contains("where id = ? for update")
                        && !sql.contains("for update of")));
    }

    @Test
    void concurrentStatusUpdatesWaitForTheSameRowLock() throws Exception {
        long id = newOrder();
        var transaction = new TransactionTemplate(transactionManager);
        var locked = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        var attempting = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var first = pool.submit(() -> transaction.executeWithoutResult(status -> {
                var order = orders.findByIdForUpdate(id).orElseThrow();
                locked.countDown();
                try {
                    if (!release.await(8, TimeUnit.SECONDS)) throw new AssertionError("Lock hold timed out");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new AssertionError(e);
                }
                order.setStatus(OrderStatus.CONFIRMED);
                orders.saveAndFlush(order);
            }));
            assertTrue(locked.await(5, TimeUnit.SECONDS));
            var second = pool.submit(() -> transaction.execute(status -> {
                attempting.countDown();
                var order = orders.findByIdForUpdate(id).orElseThrow();
                var seen = order.getStatus();
                order.setStatus(OrderStatus.PREPARING);
                orders.saveAndFlush(order);
                return seen;
            }));
            try {
                assertTrue(attempting.await(5, TimeUnit.SECONDS));
                assertThrows(TimeoutException.class, () -> second.get(200, TimeUnit.MILLISECONDS));
            } finally {
                release.countDown();
            }
            first.get(5, TimeUnit.SECONDS);
            assertEquals(OrderStatus.CONFIRMED, second.get(5, TimeUnit.SECONDS));
        }
        assertEquals(OrderStatus.PREPARING, orders.findById(id).orElseThrow().getStatus());
    }

    @Test
    void databaseErrorsDoNotExposeSqlToClients() {
        var response = new GlobalExceptionHandler().handleDatabaseException(
                new DataAccessResourceFailureException("SELECT ... FOR UPDATE OF co1_0"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertFalse(response.getBody().get("message").toString().contains("co1_0"));
    }

    private long newOrder() {
        var customer = new User();
        customer.setFullName("Lock Test");
        customer.setEmail("lock-" + UUID.randomUUID() + "@example.test");
        customer.setPassword("isolated-test-only");
        customer.setRole(Role.CUSTOMER);
        customer = users.saveAndFlush(customer);
        var order = new CustomerOrder();
        order.setCustomer(customer);
        order.setDeliveryAddress("Isolated H2");
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        return orders.saveAndFlush(order).getId();
    }
}
