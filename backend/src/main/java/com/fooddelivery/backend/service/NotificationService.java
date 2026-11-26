package com.fooddelivery.backend.service;

import com.fooddelivery.backend.config.AccessGuard;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.Notification;
import com.fooddelivery.backend.entity.NotificationType;
import com.fooddelivery.backend.entity.OrderStatus;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.NotificationRepository;
import com.fooddelivery.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
            if (notificationRepository.existsByRecipientIdAndRelatedOrderIdAndType(
                    admin.getId(), order.getId(), NotificationType.NEW_ORDER)) continue;
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

        if (notificationRepository.existsByRecipientIdAndRelatedOrderIdAndType(
                order.getDeliveryPerson().getId(), order.getId(), NotificationType.DELIVERY_ASSIGNED)) return;

        createNotification(
                order.getDeliveryPerson(),
                NotificationType.DELIVERY_ASSIGNED,
                "New Delivery Assigned",
                "You have been assigned Order #" + order.getId() + ". Please check your assigned orders.",
                order.getId()
        );
    }

    public void createCustomerOrderNotification(CustomerOrder order, OrderStatus status) {
        NotificationType type = switch (status) {
            case PENDING -> NotificationType.CUSTOMER_ORDER_PLACED;
            case CONFIRMED -> NotificationType.CUSTOMER_ORDER_CONFIRMED;
            case PREPARING -> NotificationType.CUSTOMER_ORDER_PREPARING;
            case READY_FOR_PICKUP -> NotificationType.CUSTOMER_ORDER_READY;
            case ASSIGNED_TO_DELIVERY -> NotificationType.CUSTOMER_DELIVERY_ASSIGNED;
            case PICKED_UP -> NotificationType.CUSTOMER_ORDER_PICKED_UP;
            case ON_THE_WAY -> NotificationType.CUSTOMER_ORDER_ON_THE_WAY;
            case DELIVERED -> NotificationType.CUSTOMER_ORDER_DELIVERED;
            case CANCELLED -> NotificationType.CUSTOMER_ORDER_CANCELLED;
            default -> null;
        };
        if (type == null || notificationRepository.existsByRecipientIdAndRelatedOrderIdAndType(
                order.getCustomer().getId(), order.getId(), type)) return;

        String title = switch (status) {
            case PENDING -> "Order placed";
            case CONFIRMED -> "Order confirmed";
            case PREPARING -> "Order being prepared";
            case READY_FOR_PICKUP -> "Order ready for pickup";
            case ASSIGNED_TO_DELIVERY -> "Delivery assigned";
            case PICKED_UP -> "Order picked up";
            case ON_THE_WAY -> "Delivery on the way";
            case DELIVERED -> "Order delivered";
            case CANCELLED -> "Order cancelled";
            default -> throw new IllegalStateException("Unsupported notification status");
        };
        createNotification(order.getCustomer(), type, title,
                "Order #" + order.getId() + ": " + title + ".", order.getId());
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        AccessGuard.requireSelf(userId);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsByUser(Long userId) {
        AccessGuard.requireSelf(userId);
        return notificationRepository.findByRecipientIdAndReadStatusFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        AccessGuard.requireSelf(userId);
        return notificationRepository.countByRecipientIdAndReadStatusFalse(userId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        AccessGuard.requireNotificationOwner(notification);

        notification.setReadStatus(true);

        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        AccessGuard.requireSelf(userId);
        List<Notification> unreadNotifications =
                notificationRepository.findByRecipientIdAndReadStatusFalseOrderByCreatedAtDesc(userId);

        for (Notification notification : unreadNotifications) {
            notification.setReadStatus(true);
        }

        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        AccessGuard.requireNotificationOwner(notification);

        notificationRepository.delete(notification);
    }
}
