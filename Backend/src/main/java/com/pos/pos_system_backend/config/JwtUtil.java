package com.pos.pos_system_backend.config;

import com.pos.pos_system_backend.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;

import java.util.Date;

@Component
public class JwtUtil {
    private final String SECRET = "t1lgeDwMoXmRqWaz5ekJmBffa7oMV511ertJwZ2YvXMXYbAs3gKBtErRM3fJOGtcMc4uYEAghyIageXUXvVQBYHgHEQjUj711j72";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    public String getRoleFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.get("role", String.class);
    }

    public UserRole getRoleEnumFromToken(String token) {
        String role = getRoleFromToken(token);
        return UserRole.valueOf(role);
    }

    public String getUsernameFromToken(String token) {
        Claims claims = validateToken(token);
        return claims.getSubject();
    }
}