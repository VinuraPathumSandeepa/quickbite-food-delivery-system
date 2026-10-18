package com.fooddelivery.backend;

import com.fooddelivery.backend.dto.LoginRequest;
import com.fooddelivery.backend.config.SecurityConfig;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.UserRepository;
import com.fooddelivery.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:quickbite_test;DB_CLOSE_DELAY=-1",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"QUICKBITE_CORS_ALLOWED_ORIGINS=https://preview-quickbite.vercel.app"
})
@AutoConfigureMockMvc
class BackendApplicationTests {
	@Autowired UserRepository users;
	@Autowired AuthService auth;
	@Autowired PasswordEncoder encoder;
	@Autowired MockMvc mvc;

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

	@Test
	void productionLoginPreflightAllowsJsonAndAuthorization() throws Exception {
		mvc.perform(options("/api/auth/login")
				.header("Origin", "https://quickbite-food-delivery-system.vercel.app")
				.header("Access-Control-Request-Method", "POST")
				.header("Access-Control-Request-Headers", "content-type,authorization"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "https://quickbite-food-delivery-system.vercel.app"))
				.andExpect(header().string("Access-Control-Allow-Methods", containsString("POST")))
				.andExpect(header().string("Access-Control-Allow-Headers", containsString("content-type")))
				.andExpect(header().string("Access-Control-Allow-Headers", containsString("authorization")))
				.andExpect(header().doesNotExist("Access-Control-Allow-Credentials"));
	}

	@Test
	void localhostAndExplicitPreviewOriginsAreAllowed() throws Exception {
		for (String origin : new String[]{"http://localhost:5173", "https://preview-quickbite.vercel.app"}) {
			mvc.perform(options("/api/foods/available")
					.header("Origin", origin)
					.header("Access-Control-Request-Method", "GET"))
					.andExpect(status().isOk())
					.andExpect(header().string("Access-Control-Allow-Origin", origin));
		}
	}

	@Test
	void apiPreflightSupportsConfiguredMethods() throws Exception {
		for (String method : new String[]{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}) {
			mvc.perform(options("/api/foods/available")
					.header("Origin", "https://quickbite-food-delivery-system.vercel.app")
					.header("Access-Control-Request-Method", method))
					.andExpect(status().isOk())
					.andExpect(header().string("Access-Control-Allow-Methods", containsString(method)));
		}
	}

	@Test
	void unlistedOriginIsRejected() throws Exception {
		mvc.perform(options("/api/auth/login")
				.header("Origin", "https://unlisted-preview.vercel.app")
				.header("Access-Control-Request-Method", "POST")
				.header("Access-Control-Request-Headers", "content-type"))
				.andExpect(status().isForbidden())
				.andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
	}

	@Test
	void wildcardPreviewOriginsAreRejected() {
		assertThrows(IllegalArgumentException.class,
				() -> new SecurityConfig().corsConfigurationSource("https://*.vercel.app"));
	}

	@Test
	@Transactional
	void actualLoginIncludesProductionCorsHeaders() throws Exception {
		User admin = new User();
		admin.setFullName("QuickBite Administrator");
		admin.setEmail("cors-admin@example.com");
		admin.setPassword(encoder.encode("correct-password-123"));
		admin.setRole(Role.ADMIN);
		users.saveAndFlush(admin);
		mvc.perform(post("/api/auth/login")
				.header("Origin", "https://quickbite-food-delivery-system.vercel.app")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"cors-admin@example.com\",\"password\":\"correct-password-123\"}"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "https://quickbite-food-delivery-system.vercel.app"))
				.andExpect(jsonPath("$.role").value("ADMIN"));
	}

}
