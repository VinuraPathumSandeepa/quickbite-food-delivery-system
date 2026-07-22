package com.fooddelivery.backend.dto;

import com.fooddelivery.backend.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class DeliveryStatusUpdateRequest {

    @NotNull(message = "Delivery status is required")
    private OrderStatus status;

    public DeliveryStatusUpdateRequest() {
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}