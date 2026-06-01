package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class StockUpdateRequest {
    private double value;
    private String user;
}
