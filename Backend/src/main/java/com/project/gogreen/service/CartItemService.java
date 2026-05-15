package com.project.gogreen.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.gogreen.model.cart.CartItem;
import com.project.gogreen.repo.CartItemRepository;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepo;

    // ── Existing method (keep as is) ──────────────────────────────────
    public CartItem addCartItem(CartItem cartItem) {
        return cartItemRepo.save(cartItem);
    }

    // ── NEW: find a specific cart item by userId and productId ────────
    public CartItem getCartItem(Long userId, Long productId) {
        return cartItemRepo.findAll().stream()
            .filter(ci ->
                ci.getPk().getUser().getId() == userId &&
                ci.getPk().getProduct().getId() == productId
            )
            .findFirst()
            .orElse(null);
    }

    // ── NEW: update quantity ──────────────────────────────────────────
    public CartItem updateCartItem(CartItem cartItem) {
        return cartItemRepo.save(cartItem);
    }

    // ── NEW: delete by userId and productId ───────────────────────────
    public void deleteCartItem(Long userId, Long productId) {
        CartItem item = getCartItem(userId, productId);
        if (item != null) {
            cartItemRepo.delete(item);
        }
    }

    // ── NEW: get all items for a user ─────────────────────────────────
    public List<CartItem> getUserCart(Long userId) {
        return cartItemRepo.findAll().stream()
            .filter(ci -> ci.getPk().getUser().getId() == userId)
            .toList();
    }
}