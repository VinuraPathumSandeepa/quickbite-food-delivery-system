package com.fooddelivery.backend.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY_FOR_PICKUP,
    ASSIGNED_TO_DELIVERY,
    ACCEPTED_BY_DELIVERY,
    PICKED_UP,
    ON_THE_WAY,
    DELIVERED,
    CANCELLED
}