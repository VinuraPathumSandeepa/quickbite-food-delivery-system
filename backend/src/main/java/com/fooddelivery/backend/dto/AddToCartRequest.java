package com.fooddelivery.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AddToCartRequest {

    @NotNull(message = "Food item ID is required")
    private Long foodItemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    public AddToCartRequest() {
    }

    public Long getFoodItemId() {
        return foodItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}