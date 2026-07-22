package com.pos.pos_system_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class DayEndStockReportDto {

    private List<StockReportDto> weightedItems;
    private List<StockReportDto> nonWeightedItems;

    public DayEndStockReportDto(List<StockReportDto> weightedItems, List<StockReportDto> nonWeightedItems) {
        this.weightedItems = weightedItems;
        this.nonWeightedItems = nonWeightedItems;
    }
}
