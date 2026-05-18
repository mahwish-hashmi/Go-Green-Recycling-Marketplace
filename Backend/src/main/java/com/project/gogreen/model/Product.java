package com.project.gogreen.model;

import java.math.BigDecimal;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date addedOn = new Date();

    @Lob
    @Column(nullable = true, length = Integer.MAX_VALUE)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private byte[] image;

    /**
     * NEW: The username of the seller who created this product.
     * Used for multi-seller ownership — sellers can only edit/delete their own products.
     * Nullable for backward compatibility with existing products.
     */
    @Column(nullable = true, length = 35)
    private String sellerUsername;

    public Product() {}

    public Product(String name, String description, BigDecimal price) {
        this.name        = name;
        this.description = description;
        this.price       = price;
    }

    public Product(String name, String description, BigDecimal price, byte[] image) {
        this.name        = name;
        this.description = description;
        this.price       = price;
        this.image       = image;
    }

    public long getId()                     { return id; }
    public void setId(long id)              { this.id = id; }

    public String getName()                 { return name; }
    public void setName(String name)        { this.name = name; }

    public String getDescription()              { return description; }
    public void setDescription(String desc)     { this.description = desc; }

    public BigDecimal getPrice()                { return price; }
    public void setPrice(BigDecimal price)      { this.price = price; }

    public Date getAddedOn()                    { return addedOn; }
    public void setAddedOn(Date addedOn)        { this.addedOn = addedOn; }

    public byte[] getImage()                    { return image; }
    public void setImage(byte[] image)          { this.image = image; }

    public String getSellerUsername()               { return sellerUsername; }
    public void setSellerUsername(String seller)    { this.sellerUsername = seller; }
}
