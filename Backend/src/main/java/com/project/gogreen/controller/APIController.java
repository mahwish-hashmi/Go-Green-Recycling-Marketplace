package com.project.gogreen.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.project.gogreen.config.JwtUtil;
import com.project.gogreen.model.Product;
import com.project.gogreen.model.User;
import com.project.gogreen.model.cart.CartItem;
import com.project.gogreen.service.CartItemService;
import com.project.gogreen.service.JwtUserDetailsService;
import com.project.gogreen.service.ProductService;
import com.project.gogreen.service.UserService;

/**
 * context-path = /api (set in application.properties)
 * So all endpoints here are at: http://localhost:8080/api/*
 * NO @RequestMapping("/api") — that would double the prefix.
 */
@RestController
public class APIController {

    private final UserService userService;
    private final ProductService productService;
    private final CartItemService cartItemService;

    @Autowired private JwtUserDetailsService jwtUserDetailsService;
    @Autowired private JwtUtil jwtUtil;

    public APIController(UserService us, ProductService ps, CartItemService cs) {
        this.userService = us; this.productService = ps; this.cartItemService = cs;
    }

    @PostMapping("/create-token")
    public ResponseEntity<?> createToken(@RequestBody Map<String, String> user) {
        Map<String, Object> r = new HashMap<>();
        UserDetails ud = jwtUserDetailsService.loadUserByUsername(user.get("username"));
        r.put("token", jwtUtil.generateToken(ud));
        return ResponseEntity.ok(r);
    }

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
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> u) {
        User newUser = new User((String)u.get("username"),(String)u.get("password"),(String)u.get("email"),
                (String)u.get("name"),(String)u.get("address"),(String)u.get("phone"));
        return new ResponseEntity<>(userService.updateUser(id, newUser), HttpStatus.OK);
    }

    // PUBLIC — no token required to browse products
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
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return new ResponseEntity<>(productService.updateProduct(id, product), HttpStatus.OK);
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/users/{id}/cart")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<CartItem>> getUserCart(@PathVariable Long id) {
        return new ResponseEntity<>(userService.getUser(id).getCartItems(), HttpStatus.OK);
    }

    @PostMapping("/users/{id}/cart/add/{productId}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<User> addToUserCart(@PathVariable Long id, @PathVariable Long productId) {
        User user = userService.getUser(id);
        Product product = productService.getProduct(productId);
        cartItemService.addCartItem(new CartItem(user, product, 1));
        return new ResponseEntity<>(userService.getUser(id), HttpStatus.CREATED);
    }
}
