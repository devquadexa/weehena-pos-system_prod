package com.pos.pos_system_backend.dto;

import com.pos.pos_system_backend.enums.UserRole;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class CreateUserRequest {
    private String username;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;
}
