package com.fooddelivery.backend.repository;

import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByCustomerId(Long customerId);

    List<CustomerOrder> findByDeliveryPersonId(Long deliveryPersonId);

    List<CustomerOrder> findByDeliveryPersonIdAndStatus(Long deliveryPersonId, OrderStatus status);

    List<CustomerOrder> findByStatus(OrderStatus status);

    @Query(value = "SELECT * FROM customer_orders WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<CustomerOrder> findByIdForUpdate(@Param("id") Long id);
}
