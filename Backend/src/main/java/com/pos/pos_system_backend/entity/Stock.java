package com.pos.pos_system_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"barcode", "outletId"})
})
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String barcode;
    private String productName;
    private String outletId;
    private int quantity;

    private double weight;

    private int lowStockThresholdQty;
    private double lowStockThresholdWeight;
    private boolean weighted;
}