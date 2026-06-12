package com.pos.pos_system_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String barcode;

    private String name;

    private double pricePerKg;

    private Double retailPrice;
    private Double bulkPrice;
    private Double packPrice;

    private boolean weighted;
}