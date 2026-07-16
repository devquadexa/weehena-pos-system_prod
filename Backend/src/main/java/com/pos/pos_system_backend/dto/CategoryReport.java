package com.pos.pos_system_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class CategoryReport {
    private List<SoldItemReport> items;
    private double totalValue;
    private double totalQty;

    public CategoryReport(List<SoldItemReport> items) {
        this.items = items;
        this.totalValue = items.stream()
                .mapToDouble(SoldItemReport::getSaleValue)
                .sum();
        this.totalQty = items.stream()
                .mapToDouble(SoldItemReport::getSaleQty)
                .sum();
    }
}