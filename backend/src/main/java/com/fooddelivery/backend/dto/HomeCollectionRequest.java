package com.fooddelivery.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class HomeCollectionRequest {

    @NotBlank(message = "Collection title is required")
    @Size(min = 2, max = 80, message = "Title must be between 2 and 80 characters")
    private String title;

    @Size(max = 500, message = "Description cannot be longer than 500 characters")
    private String description;

    @NotBlank(message = "Image URL is required")
    @Size(max = 1000, message = "Image URL is too long")
    private String imageUrl;

    @Min(value = 0, message = "Display order cannot be negative")
    @Max(value = 100, message = "Display order cannot be more than 100")
    private Integer displayOrder;

    private Boolean active;

    public HomeCollectionRequest() {
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}