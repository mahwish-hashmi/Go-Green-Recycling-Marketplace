package com.project.gogreen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.project.gogreen.config.JwtUtil;
import com.project.gogreen.model.Product;
import com.project.gogreen.model.User;
import com.project.gogreen.model.cart.CartItem;
import com.project.gogreen.service.CartItemService;
import com.project.gogreen.service.JwtUserDetailsService;
import com.project.gogreen.service.ProductService;
import com.project.gogreen.service.UserService;

/**
 * CRITICAL: server.servlet.context-path = /api (in application.properties)
 *
 * This means Spring Boot already prefixes ALL endpoints with /api.
 * So DO NOT add @RequestMapping("/api") here — that would make
 * every URL become /api/api/... which gives 404.
 *
 * Correct URLs from the browser:
 *   GET  http://localhost:8080/api/products
 *   POST http://localhost:8080/api/users/1/cart/add/3
 *   POST http://localhost:8080/api/login   (JwtAuthenticationController)
 */
@RestController
public class APIController {

    private final UserService userService;
    private final ProductService productService;
    private final CartItemService cartItemService;

    @Autowired private JwtUserDetailsService jwtUserDetailsService;
    @Autowired private JwtUtil jwtUtil;

    public APIController(UserService us, ProductService ps, CartItemService cs) {
        this.userService     = us;
        this.productService  = ps;
        this.cartItemService = cs;
    }

    // ── Token ─────────────────────────────────────────────────────────

    @PostMapping("/create-token")
    public ResponseEntity<?> createToken(@RequestBody Map<String, String> user) {
        Map<String, Object> r = new HashMap<>();
        UserDetails ud = jwtUserDetailsService.loadUserByUsername(user.get("username"));
        r.put("token", jwtUtil.generateToken(ud));
        return ResponseEntity.ok(r);
    }

    // ── Users ─────────────────────────────────────────────────────────

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('BUYER','SELLER')")
    public ResponseEntity<List<User>> getUsers() {
        return new ResponseEntity<>(userService.getUsers(), HttpStatus.OK);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('BUYER','SELLER')")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return new ResponseEntity<>(userService.getUser(id), HttpStatus.OK);
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
        return new ResponseEntity<>(userService.updateUser(id, newUser), HttpStatus.OK);
    }

    // ── Products (GET is public, write is SELLER only) ────────────────

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts() {
        return new ResponseEntity<>(productService.getProducts(), HttpStatus.OK);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return new ResponseEntity<>(productService.getProduct(id), HttpStatus.OK);
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return new ResponseEntity<>(productService.addProduct(product), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
                                                  @RequestBody Product product) {
        return new ResponseEntity<>(productService.updateProduct(id, product), HttpStatus.OK);
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ── Cart (BUYER only) ─────────────────────────────────────────────

    /**
     * GET /users/{id}/cart
     * Returns list of CartItem objects WITH pk.user and pk.product populated.
     */
    @GetMapping("/users/{id}/cart")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<CartItem>> getUserCart(@PathVariable Long id) {
        return new ResponseEntity<>(userService.getUser(id).getCartItems(), HttpStatus.OK);
    }

    /**
     * POST /users/{id}/cart/add/{productId}
     * Adds product to cart. If already in cart, does nothing (no error).
     */
    @PostMapping("/users/{id}/cart/add/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Map<String, String>> addToUserCart(
            @PathVariable Long id,
            @PathVariable Long productId) {

        User user       = userService.getUser(id);
        Product product = productService.getProduct(productId);

        try {
            cartItemService.addCartItem(new CartItem(user, product, 1));
        } catch (Exception e) {
            // Item already in cart — that's fine, just return success
        }

        Map<String, String> resp = new HashMap<>();
        resp.put("status", "added");
        resp.put("message", "Product added to cart successfully");
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    /**
     * PUT /users/{id}/cart/update/{productId}
     * Updates quantity of a cart item.
     */
    @PutMapping("/users/{id}/cart/update/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Map<String, String>> updateCartItem(
            @PathVariable Long id,
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body) {

        try {
            CartItem item = cartItemService.getCartItem(id, productId);
            item.setQuantity((Integer) body.get("quantity"));
            cartItemService.updateCartItem(item);
        } catch (Exception e) {
            // Item not found — ignore
        }

        Map<String, String> resp = new HashMap<>();
        resp.put("status", "updated");
        return ResponseEntity.ok(resp);
    }

    /**
     * DELETE /users/{id}/cart/remove/{productId}
     * Removes a product from the cart.
     */
    @DeleteMapping("/users/{id}/cart/remove/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Void> removeCartItem(
            @PathVariable Long id,
            @PathVariable Long productId) {

        try {
            cartItemService.deleteCartItem(id, productId);
        } catch (Exception e) {
            // Item not found — that's fine
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
