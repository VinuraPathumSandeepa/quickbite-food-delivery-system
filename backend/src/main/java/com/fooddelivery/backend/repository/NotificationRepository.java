package com.fooddelivery.backend.repository;

import com.fooddelivery.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByRecipientIdAndReadStatusFalseOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndReadStatusFalse(Long recipientId);
}