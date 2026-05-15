package com.project.gogreen.model.cart;

import java.io.Serializable;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.project.gogreen.model.Product;
import com.project.gogreen.model.User;

import jakarta.persistence.Embeddable;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Embeddable
public class CartItemPK implements Serializable {

    // KEY FIX: @JsonIgnoreProperties on user ignores the cartItems field
    // inside user when serializing CartItemPK — this breaks the infinite loop:
    //   User → cartItems → CartItemPK.user → (ignore cartItems) → stop
    @JsonIgnoreProperties({"cartItems", "password", "cartTotal"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    // Ignore image bytes in nested product to keep JSON response small
    @JsonIgnoreProperties({"image"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    public CartItemPK() {}

    public CartItemPK(User user, Product product) {
        this.user    = user;
        this.product = product;
    }

    public User getUser()                     { return user; }
    public void setUser(User user)            { this.user = user; }

    public Product getProduct()               { return product; }
    public void setProduct(Product product)   { this.product = product; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemPK that = (CartItemPK) o;
        return Objects.equals(user, that.user) &&
               Objects.equals(product, that.product);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, product);
    }
}
