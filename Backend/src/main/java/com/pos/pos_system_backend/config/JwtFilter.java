package com.pos.pos_system_backend.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

public class JwtFilter implements Filter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        System.out.println("JWT FILTER RUNNING");
        HttpServletRequest req = (HttpServletRequest) request;

        String path = req.getRequestURI();

        // Skip JWT check for login endpoint
        if (path.endsWith("/auth/login")) {
            chain.doFilter(request, response);
            return;
        }

        String auth = req.getHeader("Authorization");

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
//            jwtUtil.validateToken(token);

            Claims claims = jwtUtil.validateToken(token);

            String username = claims.getSubject();
            String role = claims.get("role", String.class);

            // attach to request so controllers/services can read them
            request.setAttribute("username", username);
            request.setAttribute("role", role);
        }

        chain.doFilter(request, response);
    }
}