package com.pos.pos_system_backend.dto;

import com.pos.pos_system_backend.entity.SaleItem;
import lombok.Data;
import java.util.List;

@Data
public class SaleRequest {
    private String invoiceNo;
    private String outletId;
    private double discountAmount;

    private List<SaleItem> items;

}
