package com.fooddelivery.backend.service;

import com.fooddelivery.backend.dto.FoodItemRequest;
import com.fooddelivery.backend.entity.Category;
import com.fooddelivery.backend.entity.FoodItem;
import com.fooddelivery.backend.repository.CategoryRepository;
import com.fooddelivery.backend.repository.FoodItemRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;

    public FoodItemService(FoodItemRepository foodItemRepository, CategoryRepository categoryRepository) {
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
    }

    public FoodItem createFoodItem(FoodItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        FoodItem foodItem = new FoodItem();
        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setRating(request.getRating() == null ? 4.5 : request.getRating());
        foodItem.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
        foodItem.setAvailable(request.getAvailable() == null ? true : request.getAvailable());
        foodItem.setCategory(category);

        return foodItemRepository.save(foodItem);
    }

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public List<FoodItem> getAvailableFoodItems() {
        return foodItemRepository.findByAvailableTrue();
    }

    public FoodItem getFoodItemById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
    }

    public List<FoodItem> getFoodItemsByCategory(Long categoryId) {
        return foodItemRepository.findByCategoryId(categoryId);
    }

    public List<FoodItem> searchFoodItems(String keyword) {
        return foodItemRepository.findByNameContainingIgnoreCase(keyword);
    }

    public FoodItem updateFoodItem(Long id, FoodItemRequest request) {
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setRating(request.getRating());
        foodItem.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
        foodItem.setAvailable(request.getAvailable());
        foodItem.setCategory(category);

        return foodItemRepository.save(foodItem);
    }

    public void deleteFoodItem(Long id) {
        if (!foodItemRepository.existsById(id)) {
            throw new RuntimeException("Food item not found");
        }

        foodItemRepository.deleteById(id);
    }

    public List<FoodItem> getAvailableFoodItemsSortedByPrice(String direction) {

        List<FoodItem> foodItems = foodItemRepository.findByAvailableTrue();

        return sortByPriceAlgorithm(foodItems, direction);
    }

    private List<FoodItem> sortByPriceAlgorithm(List<FoodItem> foodItems, String direction) {

        List<FoodItem> sortedItems = new ArrayList<>(foodItems);

        boolean ascending = direction == null || !direction.equalsIgnoreCase("desc");

        for (int i = 0; i < sortedItems.size() - 1; i++) {
            for (int j = 0; j < sortedItems.size() - i - 1; j++) {

                int comparison = sortedItems.get(j)
                        .getPrice()
                        .compareTo(sortedItems.get(j + 1).getPrice());

                boolean shouldSwap;

                if (ascending) {
                    shouldSwap = comparison > 0;
                } else {
                    shouldSwap = comparison < 0;
                }

                if (shouldSwap) {
                    FoodItem temp = sortedItems.get(j);
                    sortedItems.set(j, sortedItems.get(j + 1));
                    sortedItems.set(j + 1, temp);
                }
            }
        }

        return sortedItems;
    }
}