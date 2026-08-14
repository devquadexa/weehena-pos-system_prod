package com.pos.pos_system_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pos.pos_system_backend.enums.SaleStatus;

import java.time.OffsetDateTime;

public record LastSaleSummaryDto(
        String invoiceNo,

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Colombo")
        OffsetDateTime date,

        SaleStatus status,
        double total
) {
}