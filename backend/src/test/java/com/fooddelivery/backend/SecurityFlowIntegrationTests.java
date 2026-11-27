package com.fooddelivery.backend;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.fooddelivery.backend.entity.FoodItem;
import com.fooddelivery.backend.config.JwtService;
import com.fooddelivery.backend.entity.NotificationType;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.FoodItemRepository;
import com.fooddelivery.backend.repository.NotificationRepository;
import com.fooddelivery.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:quickbite_security_flow;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class SecurityFlowIntegrationTests {
    private static final byte[] SIGNING_KEY = new byte[32];
    static { new SecureRandom().nextBytes(SIGNING_KEY); }

    @DynamicPropertySource
    static void signingKey(DynamicPropertyRegistry registry) {
        registry.add("QUICKBITE_JWT_SECRET_BASE64", () -> Base64.getEncoder().encodeToString(SIGNING_KEY));
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired FoodItemRepository foods;
    @Autowired NotificationRepository notifications;
    @Autowired PasswordEncoder encoder;

    private JsonNode call(MockHttpServletRequestBuilder request) throws Exception {
        return json.readTree(mvc.perform(request).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
    }

    private MockHttpServletRequestBuilder as(MockHttpServletRequestBuilder request, String token) {
        return request.header("Authorization", "Bearer " + token);
    }

    private MockHttpServletRequestBuilder body(MockHttpServletRequestBuilder request, Object value) throws Exception {
        return request.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(value));
    }

    private JsonNode register(String email, String role) throws Exception {
        return call(body(post("/api/auth/register"), Map.of(
                "fullName", "Flow User", "email", email, "password", "integration-pass-123",
                "phone", "0771234567", "address", "Test Street", "role", role,
                "vehicleType", "Bike", "vehicleNumber", "TEST-123")));
    }

    private String login(String email) throws Exception {
        return call(body(post("/api/auth/login"), Map.of(
                "email", email, "password", "integration-pass-123"))).get("accessToken").asText();
    }

    @Test
    void realH2CheckoutDeliveryNotificationsAndOwnershipFlow() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String customerEmail = "customer-" + suffix + "@example.test";
        String otherEmail = "other-" + suffix + "@example.test";
        String driverEmail = "driver-" + suffix + "@example.test";
        String adminEmail = "admin-" + suffix + "@example.test";

        long customerId = register(customerEmail, "CUSTOMER").get("id").asLong();
        long otherId = register(otherEmail, "CUSTOMER").get("id").asLong();
        long driverId = register(driverEmail, "DELIVERY").get("id").asLong();
        mvc.perform(body(post("/api/auth/register"), Map.of("fullName", "Impostor", "email", adminEmail,
                "password", "integration-pass-123", "phone", "0771234567", "address", "Test Street",
                "role", "ADMIN"))).andExpect(status().isBadRequest());

        User admin = new User();
        admin.setFullName("Flow Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(encoder.encode("integration-pass-123"));
        admin.setRole(Role.ADMIN);
        users.saveAndFlush(admin);

        String customer = login(customerEmail);
        String other = login(otherEmail);
        String driver = login(driverEmail);
        String adminToken = login(adminEmail);
        assertEquals(customerId, call(as(get("/api/auth/me"), customer)).get("id").asLong());
        mvc.perform(get("/api/orders/customer/" + customerId)).andExpect(status().isUnauthorized());
        mvc.perform(as(get("/api/orders"), customer)).andExpect(status().isForbidden());
        mvc.perform(as(get("/api/cart/" + otherId), customer)).andExpect(status().isForbidden());
        mvc.perform(as(get("/api/delivery/persons"), customer)).andExpect(status().isForbidden());

        FoodItem food = new FoodItem();
        food.setName("Integration Meal");
        food.setPrice(new BigDecimal("950.00"));
        food.setAvailable(true);
        food = foods.saveAndFlush(food);
        mvc.perform(get("/api/foods/available")).andExpect(status().isOk());

        JsonNode cart = call(as(body(post("/api/cart/" + customerId + "/add"),
                Map.of("foodItemId", food.getId(), "quantity", 2)), customer));
        long cartId = cart.get("id").asLong();
        mvc.perform(as(delete("/api/cart/item/" + cartId), other)).andExpect(status().isNotFound());
        assertEquals(1, call(as(get("/api/cart/" + customerId), customer)).size());

        JsonNode order = call(as(body(post("/api/orders/place/" + customerId),
                Map.of("deliveryAddress", "Test Street", "paymentMethod", "COD", "notes", "Test")), customer));
        long orderId = order.get("id").asLong();
        assertEquals("PENDING", order.get("status").asText());
        assertEquals(0, call(as(get("/api/cart/" + customerId), customer)).size());
        assertEquals(1, notifications.findByRecipientIdOrderByCreatedAtDesc(customerId).stream()
                .filter(n -> n.getType() == NotificationType.CUSTOMER_ORDER_PLACED).count());
        assertEquals(1, notifications.findByRecipientIdOrderByCreatedAtDesc(admin.getId()).stream()
                .filter(n -> n.getType() == NotificationType.NEW_ORDER).count());
        mvc.perform(as(get("/api/orders/" + orderId), other)).andExpect(status().isNotFound());
        mvc.perform(as(get("/api/orders/" + orderId), driver)).andExpect(status().isNotFound());
        mvc.perform(as(put("/api/orders/" + orderId + "/status").contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"DELIVERED\"}"), customer)).andExpect(status().isForbidden());

        call(as(body(post("/api/payments/order/" + orderId + "/pay"),
                Map.of("paymentMethod", "COD")), customer));
        assertEquals("CONFIRMED", call(as(get("/api/orders/" + orderId), customer)).get("status").asText());
        call(as(body(put("/api/orders/" + orderId + "/status"), Map.of("status", "CONFIRMED")), adminToken));
        assertEquals(1, notifications.findByRecipientIdOrderByCreatedAtDesc(customerId).stream()
                .filter(n -> n.getType() == NotificationType.CUSTOMER_ORDER_CONFIRMED).count());
        mvc.perform(as(body(put("/api/orders/" + orderId + "/status"), Map.of("status", "DELIVERED")), adminToken))
                .andExpect(status().isBadRequest());
        for (String next : new String[]{"PREPARING", "READY_FOR_PICKUP"}) {
            call(as(body(put("/api/orders/" + orderId + "/status"), Map.of("status", next)), adminToken));
        }
        call(as(body(put("/api/delivery/assign/" + orderId), Map.of("deliveryPersonId", driverId)), adminToken));
        assertEquals(1, notifications.findByRecipientIdOrderByCreatedAtDesc(customerId).stream()
                .filter(n -> n.getType() == NotificationType.CUSTOMER_DELIVERY_ASSIGNED).count());
        mvc.perform(as(put("/api/delivery/orders/" + orderId + "/accept/" + otherId), driver))
                .andExpect(status().isForbidden());
        call(as(put("/api/delivery/orders/" + orderId + "/accept/" + driverId), driver));
        mvc.perform(as(body(put("/api/delivery/orders/" + orderId + "/status/" + driverId),
                Map.of("status", "DELIVERED")), driver)).andExpect(status().isBadRequest());
        for (String next : new String[]{"PICKED_UP", "ON_THE_WAY", "DELIVERED"}) {
            call(as(body(put("/api/delivery/orders/" + orderId + "/status/" + driverId),
                    Map.of("status", next)), driver));
        }
        assertEquals("DELIVERED", call(as(get("/api/orders/" + orderId), customer)).get("status").asText());
        assertEquals(1, notifications.findByRecipientIdOrderByCreatedAtDesc(customerId).stream()
                .filter(n -> n.getType() == NotificationType.CUSTOMER_ORDER_DELIVERED).count());

        JsonNode customerNotifications = call(as(get("/api/notifications/user/" + customerId), customer));
        assertTrue(customerNotifications.size() >= 7);
        long notificationId = customerNotifications.get(0).get("id").asLong();
        mvc.perform(as(get("/api/notifications/user/" + customerId), other)).andExpect(status().isForbidden());
        mvc.perform(as(put("/api/notifications/" + notificationId + "/read"), other))
                .andExpect(status().isNotFound());
        assertTrue(call(as(put("/api/notifications/" + notificationId + "/read"), customer))
                .get("readStatus").asBoolean());
        mvc.perform(as(put("/api/notifications/user/" + customerId + "/read-all"), customer))
                .andExpect(status().isOk());
        assertEquals(0, call(as(get("/api/notifications/user/" + customerId + "/unread-count"), customer))
                .get("unreadCount").asInt());
    }

    @Test
    void invalidForgedAndExpiredTokensAreRejected() throws Exception {
        assertThrows(IllegalStateException.class, () -> new JwtService(""));
        assertThrows(IllegalStateException.class, () -> new JwtService("not-base64"));
        assertThrows(IllegalStateException.class, () -> new JwtService(Base64.getEncoder()
                .encodeToString(new byte[16])));
        String email = "token-" + UUID.randomUUID() + "@example.test";
        long id = register(email, "CUSTOMER").get("id").asLong();
        String token = login(email);
        mvc.perform(as(get("/api/users/" + id), "invalid-token"))
                .andExpect(status().isUnauthorized());
        String[] parts = token.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
        String forged = parts[0] + "." + Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.replace("CUSTOMER", "ADMIN").getBytes()) + "." + parts[2];
        mvc.perform(as(get("/api/orders"), forged)).andExpect(status().isUnauthorized());

        var key = new javax.crypto.spec.SecretKeySpec(SIGNING_KEY, "HmacSHA256");
        var encoder = new org.springframework.security.oauth2.jwt.NimbusJwtEncoder(
                new com.nimbusds.jose.jwk.source.ImmutableSecret<>(key));
        var claims = org.springframework.security.oauth2.jwt.JwtClaimsSet.builder()
                .issuer("quickbite-api").subject(Long.toString(id))
                .issuedAt(Instant.now().minusSeconds(120))
                .expiresAt(Instant.now().minusSeconds(60))
                .claim("role", "CUSTOMER").build();
        String expired = encoder.encode(org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader.with(
                        org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build(), claims)).getTokenValue();
        mvc.perform(as(get("/api/users/" + id), expired)).andExpect(status().isUnauthorized());
    }

    @Test
    void cancelledOrderEmitsOneNotificationAndHidesOtherCustomersData() throws Exception {
        String suffix = UUID.randomUUID().toString();
        long ownerId = register("cancel-owner-" + suffix + "@example.test", "CUSTOMER").get("id").asLong();
        long strangerId = register("cancel-stranger-" + suffix + "@example.test", "CUSTOMER").get("id").asLong();
        String owner = login("cancel-owner-" + suffix + "@example.test");
        String stranger = login("cancel-stranger-" + suffix + "@example.test");
        FoodItem food = new FoodItem();
        food.setName("Cancellation Meal");
        food.setPrice(new BigDecimal("350.00"));
        food.setAvailable(true);
        food = foods.saveAndFlush(food);
        call(as(body(post("/api/cart/" + ownerId + "/add"),
                Map.of("foodItemId", food.getId(), "quantity", 1)), owner));
        long orderId = call(as(body(post("/api/orders/place/" + ownerId),
                Map.of("deliveryAddress", "Test Street", "paymentMethod", "COD")), owner))
                .get("id").asLong();
        mvc.perform(as(put("/api/orders/" + orderId + "/cancel"), stranger))
                .andExpect(status().isNotFound());
        call(as(put("/api/orders/" + orderId + "/cancel"), owner));
        call(as(put("/api/orders/" + orderId + "/cancel"), owner));
        assertEquals(1, notifications.findByRecipientIdOrderByCreatedAtDesc(ownerId).stream()
                .filter(n -> n.getType() == NotificationType.CUSTOMER_ORDER_CANCELLED).count());
        assertEquals(0, call(as(get("/api/notifications/user/" + strangerId), stranger)).size());
    }
}
