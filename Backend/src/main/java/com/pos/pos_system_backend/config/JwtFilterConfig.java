package com.pos.pos_system_backend.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtFilterConfig {
    @Bean
    public FilterRegistrationBean<JwtFilter> jwtFilter(JwtUtil jwtUtil) {

        FilterRegistrationBean<JwtFilter> reg =
                new FilterRegistrationBean<>();

        reg.setFilter(new JwtFilter(jwtUtil));

        reg.addUrlPatterns("/api/*");

        return reg;
    }
}
