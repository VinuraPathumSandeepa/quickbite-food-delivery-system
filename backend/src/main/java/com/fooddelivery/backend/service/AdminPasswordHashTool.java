package com.fooddelivery.backend.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/** Local command-line helper. Password enters via stdin; only the hash is emitted. */
public final class AdminPasswordHashTool {

    private AdminPasswordHashTool() {
    }

    public static void main(String[] args) throws Exception {
        String password = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8)).readLine();
        if (password == null || password.length() < 12) {
            throw new IllegalArgumentException("Admin password must have at least 12 characters");
        }
        System.out.print(new BCryptPasswordEncoder().encode(password));
    }
}
