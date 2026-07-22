package com.fooddelivery.backend.controller;

import com.fooddelivery.backend.dto.AddToCartRequest;
import com.fooddelivery.backend.dto.UpdateCartItemRequest;
import com.fooddelivery.backend.entity.CartItem;
import com.fooddelivery.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/{customerId}/add")
    public ResponseEntity<CartItem> addToCart(
            @PathVariable Long customerId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        return ResponseEntity.ok(cartService.addToCart(customerId, request));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<List<CartItem>> getCartItems(@PathVariable Long customerId) {
        return ResponseEntity.ok(cartService.getCartItems(customerId));
    }

    @GetMapping("/{customerId}/total")
    public ResponseEntity<BigDecimal> getCartTotal(@PathVariable Long customerId) {
        return ResponseEntity.ok(cartService.getCartTotal(customerId));
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateCartItem(cartItemId, request));
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<String> removeCartItem(@PathVariable Long cartItemId) {
        cartService.removeCartItem(cartItemId);
        return ResponseEntity.ok("Cart item removed successfully");
    }

    @DeleteMapping("/{customerId}/clear")
    public ResponseEntity<String> clearCart(@PathVariable Long customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.ok("Cart cleared successfully");
    }
}