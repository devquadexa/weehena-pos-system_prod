package com.pos.pos_system_backend.dto;

import com.pos.pos_system_backend.entity.SaleItem;
import com.pos.pos_system_backend.enums.DiscountType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import java.util.List;

@Data
public class SaleRequest {
    private String invoiceNo;
    private String outletId;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private double discountValue;

    private List<SaleItem> items;

}
