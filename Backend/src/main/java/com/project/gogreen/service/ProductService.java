package com.project.gogreen.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.project.gogreen.model.Product;
import com.project.gogreen.repo.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepo;

    // ── Public: all products (for buyers/guests browsing) ─────────────

    public List<Product> getProducts() {
        return productRepo.findAll();
    }

    public Product getProduct(Long id) {
        return productRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Product not found: " + id));
    }

    // ── Seller-scoped: only this seller's products ─────────────────────

    public List<Product> getProductsBySeller(String sellerUsername) {
        return productRepo.findBySellerUsername(sellerUsername);
    }

    // ── Add product (sets sellerUsername) ─────────────────────────────

    public Product addProduct(Product product) {
        return productRepo.save(product);
    }

    // ── Update product (verifies ownership before saving) ─────────────

    public Product updateProduct(Long id, Product updated, String requestingUsername) {
        Product existing = getProduct(id);

        // Ownership check — sellers can only edit their own products
        if (existing.getSellerUsername() != null
                && !existing.getSellerUsername().equals(requestingUsername)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "You do not own this product");
        }

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());

        // Only update image if a new one was provided
        if (updated.getImage() != null && updated.getImage().length > 0) {
            existing.setImage(updated.getImage());
        }

        // Keep sellerUsername unchanged
        return productRepo.save(existing);
    }

    // ── Delete product (verifies ownership) ───────────────────────────

    public void deleteProduct(Long id, String requestingUsername) {
        Product existing = getProduct(id);

        // Ownership check
        if (existing.getSellerUsername() != null
                && !existing.getSellerUsername().equals(requestingUsername)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "You do not own this product");
        }

        productRepo.deleteById(id);
    }

    // ── Legacy method (kept for backward compatibility) ───────────────

    public Product updateProduct(Long id, Product updated) {
        Product existing = getProduct(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        if (updated.getImage() != null && updated.getImage().length > 0) {
            existing.setImage(updated.getImage());
        }
        return productRepo.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }
}
