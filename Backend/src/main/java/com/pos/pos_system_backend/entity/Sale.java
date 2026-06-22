package com.pos.pos_system_backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pos.pos_system_backend.enums.SaleStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Entity
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String invoiceNo;

    private String outletId;
    private double discountAmount;
    private double total;

    @Enumerated(EnumType.STRING)
    private SaleStatus status = SaleStatus.ACTIVE;

    //    private LocalDateTime date;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Colombo")
    private OffsetDateTime date;


    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
    private List<SaleItem> items;

}