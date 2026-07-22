package com.fooddelivery.backend.service;

import com.fooddelivery.backend.dto.FooterSettingRequest;
import com.fooddelivery.backend.entity.FooterSetting;
import com.fooddelivery.backend.repository.FooterSettingRepository;
import org.springframework.stereotype.Service;

@Service
public class FooterSettingService {

    private final FooterSettingRepository footerSettingRepository;

    public FooterSettingService(FooterSettingRepository footerSettingRepository) {
        this.footerSettingRepository = footerSettingRepository;
    }

    public FooterSetting getFooterSetting() {
        return footerSettingRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultFooterSetting);
    }

    public FooterSetting updateFooterSetting(FooterSettingRequest request) {
        FooterSetting footerSetting = footerSettingRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultFooterSetting);

        footerSetting.setBrandIcon(request.getBrandIcon());
        footerSetting.setBrandName(request.getBrandName());
        footerSetting.setDescription(request.getDescription());

        footerSetting.setQuickLinksTitle(request.getQuickLinksTitle());

        footerSetting.setQuickLink1Label(request.getQuickLink1Label());
        footerSetting.setQuickLink1Url(request.getQuickLink1Url());

        footerSetting.setQuickLink2Label(request.getQuickLink2Label());
        footerSetting.setQuickLink2Url(request.getQuickLink2Url());

        footerSetting.setQuickLink3Label(request.getQuickLink3Label());
        footerSetting.setQuickLink3Url(request.getQuickLink3Url());

        footerSetting.setResourceTitle(request.getResourceTitle());

        footerSetting.setResourceLink1Label(request.getResourceLink1Label());
        footerSetting.setResourceLink1Url(request.getResourceLink1Url());

        footerSetting.setResourceLink2Label(request.getResourceLink2Label());
        footerSetting.setResourceLink2Url(request.getResourceLink2Url());

        footerSetting.setResourceLink3Label(request.getResourceLink3Label());
        footerSetting.setResourceLink3Url(request.getResourceLink3Url());

        footerSetting.setCopyrightText(request.getCopyrightText());

        return footerSettingRepository.save(footerSetting);
    }

    private FooterSetting createDefaultFooterSetting() {
        FooterSetting footerSetting = new FooterSetting();

        footerSetting.setBrandIcon("🍽");
        footerSetting.setBrandName("QuickBite.");
        footerSetting.setDescription("Fresh meals delivered fast, easy, and reliable.");

        footerSetting.setQuickLinksTitle("Quick Links");

        footerSetting.setQuickLink1Label("Home");
        footerSetting.setQuickLink1Url("/");

        footerSetting.setQuickLink2Label("Menu");
        footerSetting.setQuickLink2Url("/menu");

        footerSetting.setQuickLink3Label("Orders");
        footerSetting.setQuickLink3Url("/customer/orders");

        footerSetting.setResourceTitle("Resource");

        footerSetting.setResourceLink1Label("Careers");
        footerSetting.setResourceLink1Url("/careers");

        footerSetting.setResourceLink2Label("Contact");
        footerSetting.setResourceLink2Url("/contact");

        footerSetting.setResourceLink3Label("Support");
        footerSetting.setResourceLink3Url("/support");

        footerSetting.setCopyrightText("© 2026 QuickBite. All rights reserved.");

        return footerSettingRepository.save(footerSetting);
    }
}