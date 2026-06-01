package com.pos.pos_system_backend.dto;

import lombok.Data;


@Data
public class DailyReportResponse {
    private String date;
    private String outletId;
    private double totalSales;
    private double discountAmount;
    private long totalTransactions;
}
