package com.fooddelivery.backend.controller;

import com.fooddelivery.backend.dto.HomeCollectionRequest;
import com.fooddelivery.backend.entity.HomeCollection;
import com.fooddelivery.backend.service.HomeCollectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
public class HomeCollectionController {

    private final HomeCollectionService homeCollectionService;

    public HomeCollectionController(HomeCollectionService homeCollectionService) {
        this.homeCollectionService = homeCollectionService;
    }

    // Public Home page uses this
    @GetMapping
    public ResponseEntity<List<HomeCollection>> getActiveCollections() {
        return ResponseEntity.ok(homeCollectionService.getActiveCollections());
    }

    // Admin uses this
    @GetMapping("/admin/all")
    public ResponseEntity<List<HomeCollection>> getAllCollections() {
        return ResponseEntity.ok(homeCollectionService.getAllCollections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HomeCollection> getCollectionById(@PathVariable Long id) {
        return ResponseEntity.ok(homeCollectionService.getCollectionById(id));
    }

    @PostMapping
    public ResponseEntity<HomeCollection> createCollection(
            @Valid @RequestBody HomeCollectionRequest request
    ) {
        return ResponseEntity.ok(homeCollectionService.createCollection(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HomeCollection> updateCollection(
            @PathVariable Long id,
            @Valid @RequestBody HomeCollectionRequest request
    ) {
        return ResponseEntity.ok(homeCollectionService.updateCollection(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCollection(@PathVariable Long id) {
        homeCollectionService.deleteCollection(id);
        return ResponseEntity.ok("Collection deleted successfully");
    }
}
