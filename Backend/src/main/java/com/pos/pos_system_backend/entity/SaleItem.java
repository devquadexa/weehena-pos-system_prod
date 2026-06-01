package com.pos.pos_system_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pos.pos_system_backend.enums.PriceType;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String barcode;
    private double value;

    @Enumerated(EnumType.STRING)
    private PriceType priceType;

    @ManyToOne
    @JoinColumn(name = "invoice_no",
            referencedColumnName = "invoiceNo")

    @JsonIgnore
    private Sale sale;

}