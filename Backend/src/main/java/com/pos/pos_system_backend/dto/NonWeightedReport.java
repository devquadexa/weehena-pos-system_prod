package com.pos.pos_system_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class NonWeightedReport {
    private CategoryReport retail;
    private CategoryReport bulk;
    private double totalValue;
    private double totalQty;

    public NonWeightedReport(List<SoldItemReport> retailItems, List<SoldItemReport> bulkItems) {
        this.retail = new CategoryReport(retailItems);
        this.bulk = new CategoryReport(bulkItems);
        this.totalValue = this.retail.getTotalValue() + this.bulk.getTotalValue();
        this.totalQty = this.retail.getTotalQty() + this.bulk.getTotalQty();
    }
}
