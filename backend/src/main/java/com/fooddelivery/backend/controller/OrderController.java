package com.fooddelivery.backend.controller;

import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place/{customerId}")
    public ResponseEntity<CustomerOrder> placeOrder(
            @PathVariable Long customerId,
            @RequestBody Map<String, String> request
    ) {
        String deliveryAddress = request.get("deliveryAddress");
        String paymentMethod = request.get("paymentMethod");
        String notes = request.get("notes");

        CustomerOrder order = orderService.placeOrder(
                customerId,
                deliveryAddress,
                paymentMethod,
                notes
        );

        return ResponseEntity.ok(order);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CustomerOrder>> getOrdersByCustomer(
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @GetMapping
    public ResponseEntity<List<CustomerOrder>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<CustomerOrder> getOrderById(
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<CustomerOrder> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");

        CustomerOrder updatedOrder = orderService.updateOrderStatus(
                orderId,
                status
        );

        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<CustomerOrder> cancelOrder(
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteCompletedOrCancelledOrder(
            @PathVariable Long orderId
    ) {
        orderService.deleteCompletedOrCancelledOrder(orderId);

        return ResponseEntity.ok("Order deleted successfully.");
    }
}