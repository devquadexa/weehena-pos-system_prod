package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class CancelledSaleResponse {
    private String invoiceNo;
    private String date;
    private String barcode;
    private String itemName;
    private double saleQty;
    private double salePrice;
    private double saleValue;
}
