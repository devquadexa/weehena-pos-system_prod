package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class StockRequest {
    private Long id;
    private String barcode;
    private String outletId;
    private int quantity;
    private double weight;
    private int lowStockThresholdQty;
    private double lowStockThresholdWeight;
    private boolean weighted;
}