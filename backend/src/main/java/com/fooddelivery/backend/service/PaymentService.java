package com.fooddelivery.backend.service;

import com.fooddelivery.backend.dto.PaymentRequest;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.OrderStatus;
import com.fooddelivery.backend.entity.PaymentStatus;
import com.fooddelivery.backend.repository.CustomerOrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final CustomerOrderRepository customerOrderRepository;

    public PaymentService(CustomerOrderRepository customerOrderRepository) {
        this.customerOrderRepository = customerOrderRepository;
    }

    public CustomerOrder processPayment(Long orderId, PaymentRequest request) {

        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot pay for a cancelled order");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("This order is already paid");
        }

        String paymentMethod = request.getPaymentMethod() == null
                ? "CARD"
                : request.getPaymentMethod();

        order.setPaymentMethod(paymentMethod);

        if (paymentMethod.equalsIgnoreCase("CASH_ON_DELIVERY")
                || paymentMethod.equalsIgnoreCase("COD")
                || paymentMethod.equalsIgnoreCase("Cash on Delivery")) {

            order.setPaymentStatus(PaymentStatus.CASH_ON_DELIVERY_PENDING);
            order.setPaymentReference("COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        } else {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
            order.setPaymentReference("MOCKPAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }

        return customerOrderRepository.save(order);
    }

    public CustomerOrder markPaymentFailed(Long orderId) {

        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentStatus(PaymentStatus.FAILED);

        return customerOrderRepository.save(order);
    }

    public CustomerOrder getPaymentStatus(Long orderId) {
        return customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}