package com.pos.pos_system_backend.controller;

import com.pos.pos_system_backend.config.JwtUtil;
import com.pos.pos_system_backend.dto.CreateUserRequest;
import com.pos.pos_system_backend.enums.UserRole;
import com.pos.pos_system_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService service;
    private final JwtUtil jwtUtil;

    public UserController(UserService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<String> createUser(
            @RequestHeader("Authorization") String auth,
            @RequestBody CreateUserRequest request
    ) {

        String token = auth.substring(7);

        UserRole role = jwtUtil.getRoleEnumFromToken(token);

        if ((role != UserRole.ADMIN) && (role != UserRole.MANAGER)) {
            return ResponseEntity.status(403).body("Access denied");
        }

        service.createUser(request);

        return ResponseEntity.ok("User created");
    }
}
