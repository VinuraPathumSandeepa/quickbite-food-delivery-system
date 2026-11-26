package com.fooddelivery.backend.service;

import com.fooddelivery.backend.config.AccessGuard;
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
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
        AccessGuard.requireRole(Role.ADMIN);
        return userRepository.findByRole(Role.DELIVERY);
    }

    @Transactional
    public CustomerOrder assignDeliveryPerson(
            Long orderId,
            AssignDeliveryRequest request
    ) {
        AccessGuard.requireRole(Role.ADMIN);
        CustomerOrder order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        User deliveryPerson = userRepository.findById(request.getDeliveryPersonId())
                .orElseThrow(() -> new RuntimeException("Delivery person not found"));

        if (deliveryPerson.getRole() != Role.DELIVERY) {
            throw new RuntimeException("Selected user is not a delivery person");
        }

        if (order.getStatus() == OrderStatus.ASSIGNED_TO_DELIVERY &&
                order.getDeliveryPerson() != null &&
                order.getDeliveryPerson().getId().equals(deliveryPerson.getId())) {
            return order;
        }
        if (order.getStatus() != OrderStatus.PENDING &&
                order.getStatus() != OrderStatus.CONFIRMED &&
                order.getStatus() != OrderStatus.PREPARING &&
                order.getStatus() != OrderStatus.READY_FOR_PICKUP &&
                order.getStatus() != OrderStatus.ASSIGNED_TO_DELIVERY) {
            throw new RuntimeException("This order cannot be assigned now");
        }

        order.setDeliveryPerson(deliveryPerson);
        order.setStatus(OrderStatus.ASSIGNED_TO_DELIVERY);
        order.setUpdatedAt(LocalDateTime.now());

        CustomerOrder savedOrder = orderRepository.save(order);

        notificationService.createDeliveryAssignedNotification(savedOrder);
        notificationService.createCustomerOrderNotification(savedOrder, OrderStatus.ASSIGNED_TO_DELIVERY);

        return savedOrder;
    }

    public List<CustomerOrder> getOrdersAssignedToDeliveryPerson(
            Long deliveryPersonId
    ) {
        AccessGuard.requireRole(Role.DELIVERY);
        AccessGuard.requireSelf(deliveryPersonId);
        return orderRepository.findByDeliveryPersonId(deliveryPersonId);
    }

    public List<CustomerOrder> getActiveDeliveryOrders(
            Long deliveryPersonId
    ) {
        AccessGuard.requireRole(Role.DELIVERY);
        AccessGuard.requireSelf(deliveryPersonId);
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
        AccessGuard.requireRole(Role.DELIVERY);
        AccessGuard.requireSelf(deliveryPersonId);
        List<CustomerOrder> orders =
                orderRepository.findByDeliveryPersonId(deliveryPersonId);

        return orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());
    }

    @Transactional
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

    @Transactional
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

    @Transactional
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

        if (newStatus == order.getStatus()) return order;
        boolean validTransition =
                (order.getStatus() == OrderStatus.ACCEPTED_BY_DELIVERY && newStatus == OrderStatus.PICKED_UP) ||
                (order.getStatus() == OrderStatus.PICKED_UP && newStatus == OrderStatus.ON_THE_WAY) ||
                (order.getStatus() == OrderStatus.ON_THE_WAY && newStatus == OrderStatus.DELIVERED);
        if (!validTransition) {
            throw new RuntimeException("Delivery status transition is not allowed");
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        CustomerOrder savedOrder = orderRepository.save(order);
        notificationService.createCustomerOrderNotification(savedOrder, newStatus);
        return savedOrder;
    }

    private CustomerOrder getAssignedOrderForDeliveryPerson(
            Long orderId,
            Long deliveryPersonId
    ) {
        AccessGuard.requireRole(Role.DELIVERY);
        AccessGuard.requireSelf(deliveryPersonId);
        CustomerOrder order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (order.getDeliveryPerson() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        if (!order.getDeliveryPerson().getId().equals(deliveryPersonId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        return order;
    }
}
