package com.fooddelivery.backend.service;

import com.fooddelivery.backend.dto.LoginRequest;
import com.fooddelivery.backend.dto.RegisterRequest;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTests {

    private final UserRepository users = mock(UserRepository.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final AuthService auth = new AuthService(users, encoder);

    @Test
    void publicRegistrationCannotCreateAdmin() {
        RegisterRequest request = new RegisterRequest();
        request.setRole(Role.ADMIN);
        request.setEmail("owner@example.com");
        assertThrows(IllegalArgumentException.class, () -> auth.register(request));
        verify(users, never()).save(any(User.class));
    }

    @Test
    void customerAndDeliveryRegistrationStillWork() {
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        for (Role role : new Role[]{Role.CUSTOMER, Role.DELIVERY}) {
            RegisterRequest request = new RegisterRequest();
            request.setFullName("Test User");
            request.setEmail(role.name().toLowerCase() + "@example.com");
            request.setPassword("example-password");
            request.setRole(role);
            assertEquals(role, auth.register(request).getRole());
        }
        verify(users, times(2)).save(any(User.class));
    }

    @Test
    void existingRolesCanLoginWithCorrectPasswordOnly() {
        for (Role role : Role.values()) {
            String email = role.name().toLowerCase() + "@example.com";
            User user = new User();
            user.setEmail(email);
            user.setRole(role);
            user.setPassword(encoder.encode("correct-password-123"));
            when(users.findByEmail(email)).thenReturn(Optional.of(user));
            LoginRequest request = new LoginRequest();
            request.setEmail(email);
            request.setPassword("correct-password-123");
            assertEquals(role, auth.login(request).getRole());
            request.setPassword("wrong-password");
            assertThrows(RuntimeException.class, () -> auth.login(request));
        }
    }
}
