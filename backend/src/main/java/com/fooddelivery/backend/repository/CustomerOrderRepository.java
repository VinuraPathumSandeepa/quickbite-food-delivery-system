package com.fooddelivery.backend.repository;

import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByCustomerId(Long customerId);

    List<CustomerOrder> findByDeliveryPersonId(Long deliveryPersonId);

    List<CustomerOrder> findByDeliveryPersonIdAndStatus(Long deliveryPersonId, OrderStatus status);

    List<CustomerOrder> findByStatus(OrderStatus status);
}