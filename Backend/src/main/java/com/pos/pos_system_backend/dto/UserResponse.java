package com.pos.pos_system_backend.dto;

import com.pos.pos_system_backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private UserRole role;
}
