package com.fooddelivery.backend.service;

import com.fooddelivery.backend.dto.HomeCollectionRequest;
import com.fooddelivery.backend.entity.HomeCollection;
import com.fooddelivery.backend.repository.HomeCollectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HomeCollectionService {

    private final HomeCollectionRepository homeCollectionRepository;

    public HomeCollectionService(HomeCollectionRepository homeCollectionRepository) {
        this.homeCollectionRepository = homeCollectionRepository;
    }

    public HomeCollection createCollection(HomeCollectionRequest request) {
        HomeCollection collection = new HomeCollection();

        collection.setTitle(request.getTitle());
        collection.setDescription(request.getDescription());
        collection.setImageUrl(request.getImageUrl());
        collection.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());
        collection.setActive(request.getActive() == null ? true : request.getActive());

        return homeCollectionRepository.save(collection);
    }

    public List<HomeCollection> getActiveCollections() {
        return homeCollectionRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public List<HomeCollection> getAllCollections() {
        return homeCollectionRepository.findAllByOrderByDisplayOrderAsc();
    }

    public HomeCollection getCollectionById(Long id) {
        return homeCollectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
    }

    public HomeCollection updateCollection(Long id, HomeCollectionRequest request) {
        HomeCollection collection = homeCollectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        collection.setTitle(request.getTitle());
        collection.setDescription(request.getDescription());
        collection.setImageUrl(request.getImageUrl());
        collection.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());
        collection.setActive(request.getActive() == null ? true : request.getActive());

        return homeCollectionRepository.save(collection);
    }

    public void deleteCollection(Long id) {
        if (!homeCollectionRepository.existsById(id)) {
            throw new RuntimeException("Collection not found");
        }

        homeCollectionRepository.deleteById(id);
    }
}