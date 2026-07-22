package com.fooddelivery.backend.controller;

import com.fooddelivery.backend.dto.FooterSettingRequest;
import com.fooddelivery.backend.entity.FooterSetting;
import com.fooddelivery.backend.service.FooterSettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/footer-settings")
@CrossOrigin(origins = "http://localhost:5173")
public class FooterSettingController {

    private final FooterSettingService footerSettingService;

    public FooterSettingController(FooterSettingService footerSettingService) {
        this.footerSettingService = footerSettingService;
    }

    @GetMapping
    public ResponseEntity<FooterSetting> getFooterSetting() {
        return ResponseEntity.ok(footerSettingService.getFooterSetting());
    }

    @PutMapping("/admin/update")
    public ResponseEntity<FooterSetting> updateFooterSetting(
            @Valid @RequestBody FooterSettingRequest request
    ) {
        return ResponseEntity.ok(footerSettingService.updateFooterSetting(request));
    }
}