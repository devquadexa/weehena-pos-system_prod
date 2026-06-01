package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class StockReportDto {
    private String barcode;

    private String productName;

    private double openingStock;

    private double stockIn;

    private double stockOut;

    private double closingStock;
}
