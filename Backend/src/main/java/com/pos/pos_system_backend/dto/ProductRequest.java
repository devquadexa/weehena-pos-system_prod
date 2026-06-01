package com.pos.pos_system_backend.dto;


import lombok.Data;

@Data
public class ProductRequest {

    private String barcode;

    private String name;

    private double retailPrice;
    private double bulkPrice;
    private double packPrice;
    private double pricePerKg;

    private boolean weighted;
}