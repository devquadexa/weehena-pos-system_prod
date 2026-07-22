package com.pos.pos_system_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class ProductSaleDetailDto {

    private String invoiceNo;
    private String barcode;
    private String productName;
    private String outletId;
    private String saleStatus;
    private double saleQty;
    private double salePrice;
    private double saleValue;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Colombo")
    private OffsetDateTime saleDate;


}
