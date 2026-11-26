package com.fooddelivery.backend.config;

import com.fooddelivery.backend.entity.CartItem;
import com.fooddelivery.backend.entity.CustomerOrder;
import com.fooddelivery.backend.entity.Notification;
import com.fooddelivery.backend.entity.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;

public final class AccessGuard {
    private AccessGuard() {}

    private static JwtAuthenticationToken actor() {
        if (SecurityContextHolder.getContext().getAuthentication() instanceof JwtAuthenticationToken token) {
            return token;
        }
        throw new AccessDeniedException("Authentication required");
    }

    public static Long userId() {
        return Long.valueOf(actor().getName());
    }

    public static Role role() {
        return Role.valueOf(actor().getToken().getClaimAsString("role"));
    }

    public static void requireRole(Role role) {
        if (role() != role) throw new AccessDeniedException("Role not permitted");
    }

    public static void requireSelf(Long userId) {
        if (!userId().equals(userId)) throw new AccessDeniedException("Account not permitted");
    }

    public static void requireOrderAccess(CustomerOrder order) {
        Long id = userId();
        if (role() == Role.ADMIN ||
                (role() == Role.CUSTOMER && order.getCustomer().getId().equals(id)) ||
                (role() == Role.DELIVERY && order.getDeliveryPerson() != null && order.getDeliveryPerson().getId().equals(id))) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
    }

    public static void requireCartOwner(CartItem item) {
        if (!item.getCustomer().getId().equals(userId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found");
        }
    }

    public static void requireNotificationOwner(Notification notification) {
        if (!notification.getRecipient().getId().equals(userId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
        }
    }
}
