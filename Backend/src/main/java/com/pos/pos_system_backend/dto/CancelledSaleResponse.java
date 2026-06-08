package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class CancelledSaleResponse {
    private String invoiceNo;
    private String outletId;
    private String date;
    private double total;
}
