package com.fooddelivery.backend.service;

import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.Notification;
import com.fooddelivery.backend.entity.NotificationType;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.NotificationRepository;
import com.fooddelivery.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification createNotification(
            User recipient,
            NotificationType type,
            String title,
            String message,
            Long relatedOrderId
    ) {
        Notification notification = new Notification();

        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedOrderId(relatedOrderId);
        notification.setReadStatus(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public void createNewOrderNotificationForAdmins(CustomerOrder order) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        String customerName = order.getCustomer() != null
                ? order.getCustomer().getFullName()
                : "Customer";

        for (User admin : admins) {
            createNotification(
                    admin,
                    NotificationType.NEW_ORDER,
                    "New Order Received",
                    "Order #" + order.getId() + " was placed by " + customerName + ".",
                    order.getId()
            );
        }
    }

    public void createDeliveryAssignedNotification(CustomerOrder order) {
        if (order.getDeliveryPerson() == null) {
            return;
        }

        createNotification(
                order.getDeliveryPerson(),
                NotificationType.DELIVERY_ASSIGNED,
                "New Delivery Assigned",
                "You have been assigned Order #" + order.getId() + ". Please check your assigned orders.",
                order.getId()
        );
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByRecipientIdAndReadStatusFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadStatusFalse(userId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setReadStatus(true);

        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications =
                notificationRepository.findByRecipientIdAndReadStatusFalseOrderByCreatedAtDesc(userId);

        for (Notification notification : unreadNotifications) {
            notification.setReadStatus(true);
        }

        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notificationRepository.delete(notification);
    }
}