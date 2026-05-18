package com.project.gogreen.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.gogreen.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    void deleteById(Long id);
    Optional<Product> findById(Long id);

    // Find all products belonging to a specific seller
    List<Product> findBySellerUsername(String sellerUsername);
}
