package com.project.gogreen.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.gogreen.config.JwtUtil;
import com.project.gogreen.model.Product;
import com.project.gogreen.model.User;
import com.project.gogreen.model.cart.CartItem;
import com.project.gogreen.service.CartItemService;
import com.project.gogreen.service.JwtUserDetailsService;
import com.project.gogreen.service.ProductService;
import com.project.gogreen.service.UserService;

/**
 * context-path = /api  →  all endpoints at http://localhost:8080/api/*
 * NO @RequestMapping("/api") here — that would double the prefix.
 */
@RestController
public class APIController {

    private final UserService    userService;
    private final ProductService productService;
    private final CartItemService cartItemService;

    @Autowired private JwtUserDetailsService jwtUserDetailsService;
    @Autowired private JwtUtil jwtUtil;

    public APIController(UserService us, ProductService ps, CartItemService cs) {
        this.userService     = us;
        this.productService  = ps;
        this.cartItemService = cs;
    }

    // ── Helper: get the username of the currently authenticated user ──

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    // ── Token ─────────────────────────────────────────────────────────

    @PostMapping("/create-token")
    public ResponseEntity<?> createToken(@RequestBody Map<String, String> user) {
        Map<String, Object> r = new HashMap<>();
        var ud = jwtUserDetailsService.loadUserByUsername(user.get("username"));
        r.put("token", jwtUtil.generateToken(ud));
        return ResponseEntity.ok(r);
    }

    // ── Users ─────────────────────────────────────────────────────────

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('BUYER','SELLER')")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('BUYER','SELLER')")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('BUYER','SELLER')")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @RequestBody Map<String, Object> u) {
        User newUser = new User(
            (String) u.get("username"), (String) u.get("password"),
            (String) u.get("email"),    (String) u.get("name"),
            (String) u.get("address"),  (String) u.get("phone")
        );
        return ResponseEntity.ok(userService.updateUser(id, newUser));
    }

    // ── Product GET — PUBLIC (no auth needed) ─────────────────────────

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts() {
        return ResponseEntity.ok(productService.getProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    /** Returns only the products belonging to the logged-in seller */
    @GetMapping("/seller/products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Product>> getMyProducts() {
        String username = currentUsername();
        return ResponseEntity.ok(productService.getProductsBySeller(username));
    }

    /** Returns products for any seller by username (public store page) */
    @GetMapping("/products/seller/{username}")
    public ResponseEntity<List<Product>> getProductsBySeller(@PathVariable String username) {
        return ResponseEntity.ok(productService.getProductsBySeller(username));
    }

    // ── Product WRITE — SELLER only ───────────────────────────────────

    /**
     * POST /products/upload  — add product WITH optional image (multipart)
     * This is the endpoint the seller dashboard calls.
     */
    @PostMapping(value = "/products/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> addProductWithImage(
            @RequestParam("name")        String name,
            @RequestParam("description") String description,
            @RequestParam("price")       BigDecimal price,
            @RequestParam(value = "image", required = false) MultipartFile image)
            throws IOException {

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setSellerUsername(currentUsername()); // ← ownership tag

        if (image != null && !image.isEmpty()) {
            product.setImage(image.getBytes());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(productService.addProduct(product));
    }

    /**
     * POST /products  — add product via JSON (kept for backward compat)
     */
    @PostMapping("/products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        product.setSellerUsername(currentUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(productService.addProduct(product));
    }

    /**
     * PUT /products/{id}/upload  — update product WITH optional new image (multipart)
     * Verifies that the requesting seller owns the product.
     */
    @PutMapping(value = "/products/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> updateProductWithImage(
            @PathVariable Long id,
            @RequestParam("name")        String name,
            @RequestParam("description") String description,
            @RequestParam("price")       BigDecimal price,
            @RequestParam(value = "image", required = false) MultipartFile image)
            throws IOException {

        Product updated = new Product();
        updated.setName(name);
        updated.setDescription(description);
        updated.setPrice(price);
        if (image != null && !image.isEmpty()) {
            updated.setImage(image.getBytes());
        }

        return ResponseEntity.ok(
            productService.updateProduct(id, updated, currentUsername())
        );
    }

    /**
     * PUT /products/{id}  — update via JSON, checks ownership
     */
    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                  @RequestBody Product product) {
        return ResponseEntity.ok(
            productService.updateProduct(id, product, currentUsername())
        );
    }

    /**
     * DELETE /products/{id}  — checks ownership before deleting
     */
    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id, currentUsername());
        return ResponseEntity.noContent().build();
    }

    // ── Cart — BUYER only ─────────────────────────────────────────────

    @GetMapping("/users/{id}/cart")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<CartItem>> getUserCart(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id).getCartItems());
    }

    @PostMapping("/users/{id}/cart/add/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Map<String, String>> addToCart(
            @PathVariable Long id, @PathVariable Long productId) {
        User user       = userService.getUser(id);
        Product product = productService.getProduct(productId);
        try {
            cartItemService.addCartItem(new CartItem(user, product, 1));
        } catch (Exception ignored) {}
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(Map.of("status", "added"));
    }

    @PutMapping("/users/{id}/cart/update/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Map<String, String>> updateCart(
            @PathVariable Long id, @PathVariable Long productId,
            @RequestBody Map<String, Object> body) {
        try {
            CartItem item = cartItemService.getCartItem(id, productId);
            item.setQuantity((Integer) body.get("quantity"));
            cartItemService.updateCartItem(item);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @DeleteMapping("/users/{id}/cart/remove/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long id, @PathVariable Long productId) {
        try { cartItemService.deleteCartItem(id, productId); } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }
}
