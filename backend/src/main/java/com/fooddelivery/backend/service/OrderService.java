package com.fooddelivery.backend.service;

import com.fooddelivery.backend.entity.CartItem;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.OrderItem;
import com.fooddelivery.backend.entity.OrderStatus;
import com.fooddelivery.backend.entity.PaymentStatus;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.CartItemRepository;
import com.fooddelivery.backend.repository.CustomerOrderRepository;
import com.fooddelivery.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final NotificationService notificationService;

    public OrderService(
            CustomerOrderRepository orderRepository,
            UserRepository userRepository,
            CartItemRepository cartItemRepository,
            NotificationService notificationService
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public CustomerOrder placeOrder(
            Long customerId,
            String deliveryAddress,
            String paymentMethod,
            String notes
    ) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customerId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Please add food items first.");
        }

        CustomerOrder order = new CustomerOrder();

        order.setCustomer(customer);
        order.setDeliveryAddress(deliveryAddress);
        order.setPaymentMethod(paymentMethod);
        order.setNotes(notes);

        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        double totalAmount = 0.0;

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setFoodItem(cartItem.getFoodItem());
            orderItem.setQuantity(cartItem.getQuantity());

            BigDecimal price = cartItem.getFoodItem().getPrice();

            orderItem.setPrice(price != null ? price.doubleValue() : null);

            double itemTotal = price != null
                    ? price.multiply(BigDecimal.valueOf(cartItem.getQuantity())).doubleValue()
                    : 0.0;

            totalAmount += itemTotal;

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        CustomerOrder savedOrder = orderRepository.save(order);

        cartItemRepository.deleteAll(cartItems);

        notificationService.createNewOrderNotificationForAdmins(savedOrder);

        return savedOrder;
    }

    public List<CustomerOrder> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<CustomerOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public CustomerOrder getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public CustomerOrder updateOrderStatus(Long orderId, String status) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus newStatus;

        try {
            newStatus = OrderStatus.valueOf(status);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Invalid order status");
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public CustomerOrder cancelOrder(Long orderId) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Transactional
    public void deleteCompletedOrCancelledOrder(Long orderId) {
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (
                order.getStatus() != OrderStatus.DELIVERED &&
                order.getStatus() != OrderStatus.CANCELLED
        ) {
            throw new RuntimeException(
                    "Only delivered or cancelled orders can be deleted"
            );
        }

        orderRepository.delete(order);
    }
}