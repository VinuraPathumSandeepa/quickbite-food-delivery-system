package com.fooddelivery.backend.dto;

import com.fooddelivery.backend.entity.Role;

public class AuthResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String fullName, String email, Role role, String message) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}