package com.fooddelivery.backend.repository;

import com.fooddelivery.backend.entity.FooterSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FooterSettingRepository extends JpaRepository<FooterSetting, Long> {

    Optional<FooterSetting> findFirstByOrderByIdAsc();
}