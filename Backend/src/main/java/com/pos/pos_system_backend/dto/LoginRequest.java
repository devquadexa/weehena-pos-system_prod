package com.pos.pos_system_backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
