package com.pos.pos_system_backend.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class SoldItemsReportResponse {

    private final CategoryReport weighted;
    private final NonWeightedReport nonWeighted;
    private final double grandTotal;

    public SoldItemsReportResponse(List<SoldItemReport> weightedItems,
                                   List<SoldItemReport> nonWeightedRetailItems,
                                   List<SoldItemReport> bulkItems) {
        this.weighted = new CategoryReport(weightedItems);
        this.nonWeighted = new NonWeightedReport(nonWeightedRetailItems, bulkItems);
        this.grandTotal = this.weighted.getTotalValue() + this.nonWeighted.getTotalValue();
    }
}
