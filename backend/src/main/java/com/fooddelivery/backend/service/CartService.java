package com.fooddelivery.backend.service;

import com.fooddelivery.backend.dto.AddToCartRequest;
import com.fooddelivery.backend.dto.UpdateCartItemRequest;
import com.fooddelivery.backend.entity.CartItem;
import com.fooddelivery.backend.entity.FoodItem;
import com.fooddelivery.backend.entity.Role;
import com.fooddelivery.backend.entity.User;
import com.fooddelivery.backend.repository.CartItemRepository;
import com.fooddelivery.backend.repository.FoodItemRepository;
import com.fooddelivery.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;

    public CartService(CartItemRepository cartItemRepository,
                       UserRepository userRepository,
                       FoodItemRepository foodItemRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.foodItemRepository = foodItemRepository;
    }

    public CartItem addToCart(Long customerId, AddToCartRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (customer.getRole() != Role.CUSTOMER) {
            throw new RuntimeException("Only customers can add items to cart");
        }

        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        if (foodItem.getAvailable() == null || !foodItem.getAvailable()) {
            throw new RuntimeException("Food item is not available");
        }

        int quantity = request.getQuantity() == null ? 1 : request.getQuantity();

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        CartItem cartItem = cartItemRepository
                .findByCustomerIdAndFoodItemId(customerId, request.getFoodItemId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = new CartItem();
            cartItem.setCustomer(customer);
            cartItem.setFoodItem(foodItem);
            cartItem.setQuantity(quantity);
        }

        return cartItemRepository.save(cartItem);
    }

    public List<CartItem> getCartItems(Long customerId) {
        return cartItemRepository.findByCustomerId(customerId);
    }

    public CartItem updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        cartItem.setQuantity(request.getQuantity());

        return cartItemRepository.save(cartItem);
    }

    public void removeCartItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new RuntimeException("Cart item not found");
        }

        cartItemRepository.deleteById(cartItemId);
    }

    public void clearCart(Long customerId) {
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customerId);
        cartItemRepository.deleteAll(cartItems);
    }

    public BigDecimal getCartTotal(Long customerId) {
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customerId);

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem item : cartItems) {
            BigDecimal itemTotal = item.getFoodItem()
                    .getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            total = total.add(itemTotal);
        }

        return total;
    }
}