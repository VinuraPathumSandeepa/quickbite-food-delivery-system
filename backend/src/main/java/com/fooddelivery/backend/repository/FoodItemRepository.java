package com.fooddelivery.backend.repository;

import com.fooddelivery.backend.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByAvailableTrue();

    List<FoodItem> findByCategoryId(Long categoryId);

    List<FoodItem> findByNameContainingIgnoreCase(String keyword);
}