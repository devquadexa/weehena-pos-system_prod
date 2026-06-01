package com.pos.pos_system_backend.controller;

import com.pos.pos_system_backend.config.JwtUtil;
import com.pos.pos_system_backend.dto.LoginRequest;
import com.pos.pos_system_backend.service.AuthService;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService service;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return service.login(request);
    }

    @GetMapping("/admin")
    public String adminOnly(@RequestHeader("Authorization") String auth) {
        String token = auth.substring(7);
        Claims claims = jwtUtil.validateToken(token);

        if (!claims.get("role").equals("ADMIN")) {
            throw new RuntimeException("Access denied");
        }

        return "Welcome Admin";
    }
}
