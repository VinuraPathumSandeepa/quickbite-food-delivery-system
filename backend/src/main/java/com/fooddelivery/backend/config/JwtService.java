package com.fooddelivery.backend.config;

import com.fooddelivery.backend.entity.Role;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Component
public class JwtService {
    private static final String ISSUER = "quickbite-api";
    private static final Duration LIFETIME = Duration.ofMinutes(30);
    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    public JwtService(@Value("${QUICKBITE_JWT_SECRET_BASE64:}") String encodedSecret) {
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(encodedSecret);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("QUICKBITE_JWT_SECRET_BASE64 must be a Base64-encoded 32-byte-or-longer key");
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException("QUICKBITE_JWT_SECRET_BASE64 must be a Base64-encoded 32-byte-or-longer key");
        }
        SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        jwtDecoder.setJwtValidator(org.springframework.security.oauth2.jwt.JwtValidators.createDefaultWithIssuer(ISSUER));
        this.decoder = jwtDecoder;
    }

    public IssuedToken issue(Long userId, Role role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(LIFETIME);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(userId.toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("role", role.name())
                .build();
        Jwt jwt = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims));
        return new IssuedToken(jwt.getTokenValue(), expiresAt);
    }

    public JwtDecoder decoder() {
        return decoder;
    }

    public record IssuedToken(String value, Instant expiresAt) {}
}
