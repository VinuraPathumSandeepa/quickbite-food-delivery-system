package com.fooddelivery.backend.repository;

import com.fooddelivery.backend.entity.HomeCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HomeCollectionRepository extends JpaRepository<HomeCollection, Long> {

    List<HomeCollection> findByActiveTrueOrderByDisplayOrderAsc();

    List<HomeCollection> findAllByOrderByDisplayOrderAsc();
}