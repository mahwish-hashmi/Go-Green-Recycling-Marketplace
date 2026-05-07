package com.project.gogreen.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.project.gogreen.config.JwtUtil;
import com.project.gogreen.enums.Role;
import com.project.gogreen.model.User;
import com.project.gogreen.repo.UserRepository;
import com.project.gogreen.service.JwtUserDetailsService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
// NOTE: @CrossOrigin removed — CORS handled globally in WebSecurityConfig
public class JwtAuthenticationController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtUserDetailsService jwtUserDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @GetMapping("/user")
    public ResponseEntity<User> getCurrentUser(HttpServletRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = repo.findByUsername(((UserDetails) principal).getUsername());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> body) {

        String username = (String) body.get("username");
        String password = (String) body.get("password");
        String email    = (String) body.get("email");
        String name     = (String) body.get("name");
        String address  = (String) body.get("address");
        String phone    = (String) body.get("phone");

        if (username == null) return badRequest("Username is missing.");
        if (email    == null) return badRequest("Email is missing.");
        if (password == null) return badRequest("Password is missing.");
        if (password.length() < 8) return badRequest("Password length must be 8+.");
        if (name     == null) return badRequest("Name is missing.");
        if (address  == null) return badRequest("Address is missing.");
        if (phone    == null) return badRequest("Phone is missing.");

        // Role resolution — defaults to ROLE_BUYER
        Role role = Role.ROLE_BUYER;
        String roleStr = (String) body.get("role");
        if (roleStr != null) {
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        User newUser = new User(username, password, email, name, address, phone, role);

        User savedUser;
        try {
            savedUser = jwtUserDetailsService.save(newUser);
        } catch (DataIntegrityViolationException e) {
            String rootMsg = e.getRootCause() != null ? e.getRootCause().getMessage() : "";
            if (rootMsg.contains(username)) return badRequest("Username is not available.");
            if (rootMsg.contains(email))    return badRequest("Email is not available.");
            return badRequest("Registration failed due to a data conflict.");
        }

        final UserDetails userDetails = jwtUserDetailsService.loadUserByUsername(savedUser.getUsername());
        final String token = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", savedUser.getRole().name());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> body) throws Exception {
        authenticate(body.get("username"), body.get("password"));

        final UserDetails userDetails = jwtUserDetailsService.loadUserByUsername(body.get("username"));
        final String token = jwtUtil.generateToken(userDetails);

        User user = repo.findByUsername(body.get("username"));

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        return ResponseEntity.ok(response);
    }

    private void authenticate(String username, String password) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
        } catch (DisabledException e) {
            throw new Exception("User is disabled.", e);
        } catch (BadCredentialsException e) {
            throw new Exception("Invalid credentials.", e);
        }
    }

    private ResponseEntity<String> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
    }
}
