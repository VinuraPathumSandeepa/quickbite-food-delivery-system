package com.fooddelivery.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   UrlBasedCorsConfigurationSource corsConfigurationSource,
                                                   JwtService jwtService) throws Exception {
        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            if (role == null || !List.of("ADMIN", "CUSTOMER", "DELIVERY").contains(role)) {
                return List.of();
            }
            return List.of(new SimpleGrantedAuthority("ROLE_" + role));
        });

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt
                        .decoder(jwtService.decoder())
                        .jwtAuthenticationConverter(authenticationConverter)))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> response.sendError(401))
                        .accessDeniedHandler((request, response, exception) -> response.sendError(403)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/test", "/api/categories", "/api/collections", "/api/footer-settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/foods/available/**", "/api/foods/category/**", "/api/foods/search", "/api/foods/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/collections/admin/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/collections/*").permitAll()
                        .requestMatchers("/api/foods/**", "/api/categories/**", "/api/collections/**", "/api/footer-settings/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/delivery/persons").hasRole("ADMIN")
                        .requestMatchers("/api/delivery/assign/**").hasRole("ADMIN")
                        .requestMatchers("/api/delivery/orders/**").hasRole("DELIVERY")
                        .requestMatchers("/api/cart/**", "/api/payments/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/orders/place/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/orders/customer/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/cancel").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/*").hasAnyRole("ADMIN", "CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/orders/*").hasAnyRole("ADMIN", "CUSTOMER", "DELIVERY")
                        .requestMatchers("/api/notifications/**", "/api/users/**").authenticated()
                        .anyRequest().denyAll()
                );

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource(
            @Value("${QUICKBITE_CORS_ALLOWED_ORIGINS:}") String additionalOrigins) {
        List<String> allowedOrigins = new ArrayList<>(List.of(
                "https://quickbite-food-delivery-system.vercel.app",
                "http://localhost:5173"
        ));
        if (!additionalOrigins.isBlank()) {
            for (String entry : additionalOrigins.split(",", -1)) {
                String origin = entry.trim();
                if (!origin.matches("https://[A-Za-z0-9.-]+(?::[0-9]{1,5})?")) {
                    throw new IllegalArgumentException("Invalid QUICKBITE_CORS_ALLOWED_ORIGINS entry");
                }
                allowedOrigins.add(origin);
            }
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Authorization", "Accept"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
