package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class SoldItemReport {

    private String barcode;
    private String itemName;
    private double saleQty; // can be weight also
    private double salePrice;
    private double saleValue;
    private String invoiceNo;
    private String saleStatus;

}
