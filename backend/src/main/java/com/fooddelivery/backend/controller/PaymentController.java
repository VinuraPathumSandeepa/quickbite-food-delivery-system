package com.fooddelivery.backend.controller;

import com.fooddelivery.backend.dto.PaymentRequest;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/order/{orderId}/pay")
    public ResponseEntity<CustomerOrder> processPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity.ok(paymentService.processPayment(orderId, request));
    }

    @PutMapping("/order/{orderId}/failed")
    public ResponseEntity<CustomerOrder> markPaymentFailed(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.markPaymentFailed(orderId));
    }

    @GetMapping("/order/{orderId}/status")
    public ResponseEntity<CustomerOrder> getPaymentStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(orderId));
    }
}