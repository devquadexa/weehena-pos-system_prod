package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.config.JwtUtil;
import com.pos.pos_system_backend.dto.LoginRequest;
import com.pos.pos_system_backend.entity.User;
import com.pos.pos_system_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository repo;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository repo,  JwtUtil jwtUtil) {
        this.repo = repo;
        this.jwtUtil = jwtUtil;
    }

    public String login(LoginRequest request) {
        try {
            logger.info("Login attempt for username: {}", request.getUsername());
            
            // Find user by username
            User user = repo.findByUsername(request.getUsername())
                    .orElseThrow(() -> {
                        logger.warn("User not found: {}", request.getUsername());
                        return new RuntimeException("User not found");
                    });

            logger.info("User found: {}", user.getUsername());
            logger.debug("Stored password: {}", user.getPassword());
            logger.debug("Provided password: {}", request.getPassword());

            // Compare passwords (case-sensitive)
            if (!user.getPassword().equals(request.getPassword())) {
                logger.warn("Invalid password for user: {}", request.getUsername());
                throw new RuntimeException("Invalid password");
            }

            logger.info("Password matched for user: {}", user.getUsername());
            
            // Generate and return JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            logger.info("JWT token generated for user: {}", user.getUsername());
            
            return token;
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            throw e;
        }
    }
}
