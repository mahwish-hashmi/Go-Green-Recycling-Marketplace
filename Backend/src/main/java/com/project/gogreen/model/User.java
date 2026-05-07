package com.project.gogreen.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.project.gogreen.enums.Role;
import com.project.gogreen.model.cart.CartItem;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true, nullable = false, length = 35)
    private String username;

    @Column(nullable = false, length = 128)
    private String password;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 128)
    private String address;

    @Column(nullable = false, length = 15)
    private String phone;

    // ── NEW: Role field stored as VARCHAR("ROLE_BUYER" / "ROLE_SELLER") ──
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.ROLE_BUYER; // safe default

    @JsonManagedReference
    @OneToMany(mappedBy = "pk.user", cascade = CascadeType.ALL)
    private List<CartItem> cartItems = new ArrayList<>();

    public User() {
    }

    /** Original constructor kept intact — role defaults to ROLE_BUYER. */
    public User(String username, String password, String email,
                String name, String address, String phone) {
        this.username = username;
        this.password = password;
        this.email    = email;
        this.name     = name;
        this.address  = address;
        this.phone    = phone;
        this.role     = Role.ROLE_BUYER;
        this.cartItems = new ArrayList<>();
    }

    /** New constructor that accepts an explicit role. */
    public User(String username, String password, String email,
                String name, String address, String phone, Role role) {
        this(username, password, email, name, address, phone);
        this.role = role;
    }

    // ── Getters & Setters ─────────────────────────────────────────────

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public List<CartItem> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItem> cartItems) { this.cartItems = cartItems; }

    @Transient
    public BigDecimal getCartTotal() {
        BigDecimal sum = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            sum = sum.add(item.getTotalPrice());
        }
        return sum;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", role=" + role +
                '}';
    }
}
