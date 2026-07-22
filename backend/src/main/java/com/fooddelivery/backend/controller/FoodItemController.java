package com.fooddelivery.backend.controller;

import com.fooddelivery.backend.dto.FoodItemRequest;
import com.fooddelivery.backend.entity.FoodItem;
import com.fooddelivery.backend.service.FoodItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @PostMapping
    public ResponseEntity<FoodItem> createFoodItem( @Valid @RequestBody FoodItemRequest request) {
        return ResponseEntity.ok(foodItemService.createFoodItem(request));
    }

    @GetMapping
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemService.getAllFoodItems());
    }

    @GetMapping("/available")
    public ResponseEntity<List<FoodItem>> getAvailableFoodItems() {
        return ResponseEntity.ok(foodItemService.getAvailableFoodItems());
    }

    @GetMapping("/available/sort/price")
    public ResponseEntity<List<FoodItem>> getAvailableFoodsSortedByPrice(
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return ResponseEntity.ok(foodItemService.getAvailableFoodItemsSortedByPrice(direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodItemById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodItemById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<FoodItem>> getFoodItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(foodItemService.getFoodItemsByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodItem>> searchFoodItems(@RequestParam String keyword) {
        return ResponseEntity.ok(foodItemService.searchFoodItems(keyword));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItem> updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItemRequest request
    ) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFoodItem(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok("Food item deleted successfully");
    }
}