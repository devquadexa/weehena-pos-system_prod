package com.pos.pos_system_backend.dto;

import com.pos.pos_system_backend.enums.PriceType;

import java.time.LocalDate;
import java.util.List;

public record MonthlyReportDto(
        String outletId,
        String month,
        SalesSummary summary,
        List<DailySales> daily,
        List<ProductSales> products,
        DayEndStockReportDto stock) {

    public record SalesSummary(double totalSales, double totalDiscount,
                               long totalTransactions, long cancelledCount,
                               double averageSale) {}

    public record DailySales(LocalDate date, long saleCount, double revenue) {}

    public record ProductSales(String barcode, String productName, boolean weighted,
                               PriceType priceType, double quantity, double revenue) {}
}