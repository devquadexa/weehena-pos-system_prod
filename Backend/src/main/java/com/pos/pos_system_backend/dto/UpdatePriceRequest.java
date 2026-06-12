package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class UpdatePriceRequest {

    private String barcode;

    private Double retailPrice;
    private Double bulkPrice;
    private Double packPrice;
    private Double pricePerKg;
}
