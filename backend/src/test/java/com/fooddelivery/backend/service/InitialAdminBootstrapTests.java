package com.fooddelivery.backend.service;

import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class InitialAdminBootstrapTests {

    private final DataSource dataSource = mock(DataSource.class);
    private final UserRepository users = mock(UserRepository.class);
    private final PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
    private final AtomicBoolean adminExists = new AtomicBoolean();
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final String password = "correct-password-123";
    private String hash;

    @BeforeEach
    void setUp() throws Exception {
        hash = encoder.encode(password);
        when(transactionManager.getTransaction(any())).thenAnswer(invocation -> new SimpleTransactionStatus());
        Connection connection = mock(Connection.class);
        PreparedStatement acquire = mock(PreparedStatement.class);
        PreparedStatement release = mock(PreparedStatement.class);
        ResultSet result = mock(ResultSet.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.prepareStatement(startsWith("SELECT GET_LOCK"))).thenReturn(acquire);
        when(connection.prepareStatement(startsWith("SELECT RELEASE_LOCK"))).thenReturn(release);
        when(acquire.executeQuery()).thenReturn(result);
        when(release.executeQuery()).thenReturn(mock(ResultSet.class));
        when(result.next()).thenReturn(true);
        when(result.getInt(1)).thenReturn(1);
        when(users.existsByRole(Role.ADMIN)).thenAnswer(invocation -> adminExists.get());
        when(users.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            adminExists.set(true);
            return invocation.getArgument(0);
        });
    }

    private InitialAdminBootstrap bootstrap(String email, String passwordHash) {
        return new InitialAdminBootstrap(email, passwordHash, dataSource, users, transactionManager);
    }

    @Test
    void absentConfigurationDoesNothing() throws Exception {
        bootstrap("", "").run(null);
        verifyNoInteractions(dataSource, users);
    }

    @Test
    void createsOneAdminAndRestartDoesNotModifyIt() throws Exception {
        InitialAdminBootstrap runner = bootstrap("owner@example.com", hash);
        runner.run(null);
        runner.run(null);

        var captured = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users, times(1)).saveAndFlush(captured.capture());
        User admin = captured.getValue();
        assertEquals(Role.ADMIN, admin.getRole());
        assertEquals("owner@example.com", admin.getEmail());
        assertEquals("QuickBite Administrator", admin.getFullName());
        assertTrue(admin.getAvailable());
        assertTrue(encoder.matches(password, admin.getPassword()));
        assertFalse(encoder.matches("incorrect-password", admin.getPassword()));
    }

    @Test
    void existingAdminIsNeverChanged() throws Exception {
        adminExists.set(true);
        bootstrap("owner@example.com", hash).run(null);
        verify(users, never()).saveAndFlush(any(User.class));
        verify(users, never()).existsByEmailIgnoreCase(anyString());
    }

    @Test
    void existingCustomerEmailCannotBePromoted() throws Exception {
        when(users.existsByEmailIgnoreCase("owner@example.com")).thenReturn(true);
        assertThrows(IllegalStateException.class, () -> bootstrap("owner@example.com", hash).run(null));
        verify(users, never()).saveAndFlush(any(User.class));
    }

    @Test
    void incompleteOrInvalidConfigurationFailsBeforeDatabaseAccess() {
        assertThrows(IllegalStateException.class, () -> bootstrap("owner@example.com", "").run(null));
        assertThrows(IllegalStateException.class, () -> bootstrap("", hash).run(null));
        assertThrows(IllegalStateException.class, () -> bootstrap("invalid-email", hash).run(null));
        assertThrows(IllegalStateException.class, () -> bootstrap("owner@example.com", "not-bcrypt").run(null));
        verifyNoInteractions(dataSource, users);
    }

    @Test
    void lockFailureCannotCreateAdmin() throws Exception {
        Connection connection = dataSource.getConnection();
        PreparedStatement statement = connection.prepareStatement("SELECT GET_LOCK(?, 30)");
        ResultSet result = statement.executeQuery();
        when(result.getInt(1)).thenReturn(0);
        assertThrows(IllegalStateException.class, () -> bootstrap("owner@example.com", hash).run(null));
        verify(users, never()).saveAndFlush(any(User.class));
    }
}
