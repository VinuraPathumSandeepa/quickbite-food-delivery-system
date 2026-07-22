package com.fooddelivery.backend.controller;

import com.fooddelivery.backend.dto.AssignDeliveryRequest;
import com.fooddelivery.backend.dto.DeliveryStatusUpdateRequest;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.service.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/persons")
    public ResponseEntity<List<User>> getAllDeliveryPersons() {
        return ResponseEntity.ok(deliveryService.getAllDeliveryPersons());
    }

    @PutMapping("/assign/{orderId}")
    public ResponseEntity<CustomerOrder> assignDeliveryPerson(
            @PathVariable Long orderId,
            @Valid @RequestBody AssignDeliveryRequest request
    ) {
        return ResponseEntity.ok(deliveryService.assignDeliveryPerson(orderId, request));
    }

    @GetMapping("/orders/{deliveryPersonId}")
    public ResponseEntity<List<CustomerOrder>> getOrdersAssignedToDeliveryPerson(
            @PathVariable Long deliveryPersonId
    ) {
        return ResponseEntity.ok(deliveryService.getOrdersAssignedToDeliveryPerson(deliveryPersonId));
    }

    @GetMapping("/orders/{deliveryPersonId}/active")
    public ResponseEntity<List<CustomerOrder>> getActiveDeliveryOrders(
            @PathVariable Long deliveryPersonId
    ) {
        return ResponseEntity.ok(deliveryService.getActiveDeliveryOrders(deliveryPersonId));
    }

    @GetMapping("/orders/{deliveryPersonId}/completed")
    public ResponseEntity<List<CustomerOrder>> getCompletedDeliveryOrders(
            @PathVariable Long deliveryPersonId
    ) {
        return ResponseEntity.ok(deliveryService.getCompletedDeliveryOrders(deliveryPersonId));
    }

    @PutMapping("/orders/{orderId}/accept/{deliveryPersonId}")
    public ResponseEntity<CustomerOrder> acceptDelivery(
            @PathVariable Long orderId,
            @PathVariable Long deliveryPersonId
    ) {
        return ResponseEntity.ok(deliveryService.acceptDelivery(orderId, deliveryPersonId));
    }

    @PutMapping("/orders/{orderId}/reject/{deliveryPersonId}")
    public ResponseEntity<CustomerOrder> rejectDelivery(
            @PathVariable Long orderId,
            @PathVariable Long deliveryPersonId
    ) {
        return ResponseEntity.ok(deliveryService.rejectDelivery(orderId, deliveryPersonId));
    }

    @PutMapping("/orders/{orderId}/status/{deliveryPersonId}")
    public ResponseEntity<CustomerOrder> updateDeliveryStatus(
            @PathVariable Long orderId,
            @PathVariable Long deliveryPersonId,
            @Valid @RequestBody DeliveryStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(orderId, deliveryPersonId, request));
    }
}