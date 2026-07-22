package com.fooddelivery.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FooterSettingRequest {

    @Size(max = 20, message = "Brand icon cannot be longer than 20 characters")
    private String brandIcon;

    @NotBlank(message = "Brand name is required")
    @Size(min = 2, max = 80, message = "Brand name must be between 2 and 80 characters")
    private String brandName;

    @Size(max = 500, message = "Description cannot be longer than 500 characters")
    private String description;

    @Size(max = 80, message = "Quick links title cannot be longer than 80 characters")
    private String quickLinksTitle;

    private String quickLink1Label;
    private String quickLink1Url;

    private String quickLink2Label;
    private String quickLink2Url;

    private String quickLink3Label;
    private String quickLink3Url;

    @Size(max = 80, message = "Resource title cannot be longer than 80 characters")
    private String resourceTitle;

    private String resourceLink1Label;
    private String resourceLink1Url;

    private String resourceLink2Label;
    private String resourceLink2Url;

    private String resourceLink3Label;
    private String resourceLink3Url;

    @Size(max = 200, message = "Copyright text cannot be longer than 200 characters")
    private String copyrightText;

    public FooterSettingRequest() {
    }

    public String getBrandIcon() {
        return brandIcon;
    }

    public String getBrandName() {
        return brandName;
    }

    public String getDescription() {
        return description;
    }

    public String getQuickLinksTitle() {
        return quickLinksTitle;
    }

    public String getQuickLink1Label() {
        return quickLink1Label;
    }

    public String getQuickLink1Url() {
        return quickLink1Url;
    }

    public String getQuickLink2Label() {
        return quickLink2Label;
    }

    public String getQuickLink2Url() {
        return quickLink2Url;
    }

    public String getQuickLink3Label() {
        return quickLink3Label;
    }

    public String getQuickLink3Url() {
        return quickLink3Url;
    }

    public String getResourceTitle() {
        return resourceTitle;
    }

    public String getResourceLink1Label() {
        return resourceLink1Label;
    }

    public String getResourceLink1Url() {
        return resourceLink1Url;
    }

    public String getResourceLink2Label() {
        return resourceLink2Label;
    }

    public String getResourceLink2Url() {
        return resourceLink2Url;
    }

    public String getResourceLink3Label() {
        return resourceLink3Label;
    }

    public String getResourceLink3Url() {
        return resourceLink3Url;
    }

    public String getCopyrightText() {
        return copyrightText;
    }

    public void setBrandIcon(String brandIcon) {
        this.brandIcon = brandIcon;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setQuickLinksTitle(String quickLinksTitle) {
        this.quickLinksTitle = quickLinksTitle;
    }

    public void setQuickLink1Label(String quickLink1Label) {
        this.quickLink1Label = quickLink1Label;
    }

    public void setQuickLink1Url(String quickLink1Url) {
        this.quickLink1Url = quickLink1Url;
    }

    public void setQuickLink2Label(String quickLink2Label) {
        this.quickLink2Label = quickLink2Label;
    }

    public void setQuickLink2Url(String quickLink2Url) {
        this.quickLink2Url = quickLink2Url;
    }

    public void setQuickLink3Label(String quickLink3Label) {
        this.quickLink3Label = quickLink3Label;
    }

    public void setQuickLink3Url(String quickLink3Url) {
        this.quickLink3Url = quickLink3Url;
    }

    public void setResourceTitle(String resourceTitle) {
        this.resourceTitle = resourceTitle;
    }

    public void setResourceLink1Label(String resourceLink1Label) {
        this.resourceLink1Label = resourceLink1Label;
    }

    public void setResourceLink1Url(String resourceLink1Url) {
        this.resourceLink1Url = resourceLink1Url;
    }

    public void setResourceLink2Label(String resourceLink2Label) {
        this.resourceLink2Label = resourceLink2Label;
    }

    public void setResourceLink2Url(String resourceLink2Url) {
        this.resourceLink2Url = resourceLink2Url;
    }

    public void setResourceLink3Label(String resourceLink3Label) {
        this.resourceLink3Label = resourceLink3Label;
    }

    public void setResourceLink3Url(String resourceLink3Url) {
        this.resourceLink3Url = resourceLink3Url;
    }

    public void setCopyrightText(String copyrightText) {
        this.copyrightText = copyrightText;
    }
}