package com.fooddelivery.backend.service;

import com.fooddelivery.backend.dto.AssignDeliveryRequest;
import com.fooddelivery.backend.dto.DeliveryStatusUpdateRequest;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.OrderStatus;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.CustomerOrderRepository;
import com.fooddelivery.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private final CustomerOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public DeliveryService(
            CustomerOrderRepository orderRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<User> getAllDeliveryPersons() {
        return userRepository.findByRole(Role.DELIVERY);
    }

    @Transactional
    public CustomerOrder assignDeliveryPerson(
            Long orderId,
            AssignDeliveryRequest request
    ) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User deliveryPerson = userRepository.findById(request.getDeliveryPersonId())
                .orElseThrow(() -> new RuntimeException("Delivery person not found"));

        if (deliveryPerson.getRole() != Role.DELIVERY) {
            throw new RuntimeException("Selected user is not a delivery person");
        }

        if (
                order.getStatus() == OrderStatus.DELIVERED ||
                order.getStatus() == OrderStatus.CANCELLED
        ) {
            throw new RuntimeException(
                    "Cannot assign delivery person to completed or cancelled order"
            );
        }

        order.setDeliveryPerson(deliveryPerson);
        order.setStatus(OrderStatus.ASSIGNED_TO_DELIVERY);
        order.setUpdatedAt(LocalDateTime.now());

        CustomerOrder savedOrder = orderRepository.save(order);

        notificationService.createDeliveryAssignedNotification(savedOrder);

        return savedOrder;
    }

    public List<CustomerOrder> getOrdersAssignedToDeliveryPerson(
            Long deliveryPersonId
    ) {
        return orderRepository.findByDeliveryPersonId(deliveryPersonId);
    }

    public List<CustomerOrder> getActiveDeliveryOrders(
            Long deliveryPersonId
    ) {
        List<CustomerOrder> orders =
                orderRepository.findByDeliveryPersonId(deliveryPersonId);

        return orders.stream()
                .filter(order ->
                        order.getStatus() != OrderStatus.DELIVERED &&
                        order.getStatus() != OrderStatus.CANCELLED
                )
                .collect(Collectors.toList());
    }

    public List<CustomerOrder> getCompletedDeliveryOrders(
            Long deliveryPersonId
    ) {
        List<CustomerOrder> orders =
                orderRepository.findByDeliveryPersonId(deliveryPersonId);

        return orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());
    }

    public CustomerOrder acceptDelivery(
            Long orderId,
            Long deliveryPersonId
    ) {
        CustomerOrder order = getAssignedOrderForDeliveryPerson(
                orderId,
                deliveryPersonId
        );

        if (order.getStatus() != OrderStatus.ASSIGNED_TO_DELIVERY) {
            throw new RuntimeException("Only assigned orders can be accepted");
        }

        order.setStatus(OrderStatus.ACCEPTED_BY_DELIVERY);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public CustomerOrder rejectDelivery(
            Long orderId,
            Long deliveryPersonId
    ) {
        CustomerOrder order = getAssignedOrderForDeliveryPerson(
                orderId,
                deliveryPersonId
        );

        if (order.getStatus() != OrderStatus.ASSIGNED_TO_DELIVERY) {
            throw new RuntimeException("Only assigned orders can be rejected");
        }

        order.setDeliveryPerson(null);
        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public CustomerOrder updateDeliveryStatus(
            Long orderId,
            Long deliveryPersonId,
            DeliveryStatusUpdateRequest request
    ) {
        CustomerOrder order = getAssignedOrderForDeliveryPerson(
                orderId,
                deliveryPersonId
        );

        OrderStatus newStatus = request.getStatus();

        if (newStatus == null) {
            throw new RuntimeException("Delivery status is required");
        }

        if (
                newStatus != OrderStatus.ACCEPTED_BY_DELIVERY &&
                newStatus != OrderStatus.PICKED_UP &&
                newStatus != OrderStatus.ON_THE_WAY &&
                newStatus != OrderStatus.DELIVERED
        ) {
            throw new RuntimeException(
                    "This status is not allowed for delivery person"
            );
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    private CustomerOrder getAssignedOrderForDeliveryPerson(
            Long orderId,
            Long deliveryPersonId
    ) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getDeliveryPerson() == null) {
            throw new RuntimeException(
                    "This order is not assigned to a delivery person"
            );
        }

        if (!order.getDeliveryPerson().getId().equals(deliveryPersonId)) {
            throw new RuntimeException("This order is not assigned to you");
        }

        return order;
    }
}