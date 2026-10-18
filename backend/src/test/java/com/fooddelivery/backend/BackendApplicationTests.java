package com.fooddelivery.backend;

import com.fooddelivery.backend.dto.LoginRequest;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.UserRepository;
import com.fooddelivery.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:quickbite_test;DB_CLOSE_DELAY=-1",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop"
})
class BackendApplicationTests {
	@Autowired UserRepository users;
	@Autowired AuthService auth;
	@Autowired PasswordEncoder encoder;

	@Test
	void contextLoads() {
		assertFalse(users.existsByRole(Role.ADMIN));
	}

	@Test
	@Transactional
	void repositoryAndAdminLoginWork() {
		User admin = new User();
		admin.setFullName("QuickBite Administrator");
		admin.setEmail("owner@example.com");
		admin.setPassword(encoder.encode("correct-password-123"));
		admin.setRole(Role.ADMIN);
		users.saveAndFlush(admin);
		assertTrue(users.existsByRole(Role.ADMIN));
		assertTrue(users.existsByEmailIgnoreCase("OWNER@example.com"));
		LoginRequest login = new LoginRequest();
		login.setEmail("owner@example.com");
		login.setPassword("correct-password-123");
		assertEquals(Role.ADMIN, auth.login(login).getRole());
		login.setPassword("wrong-password");
		assertThrows(RuntimeException.class, () -> auth.login(login));
	}

}
