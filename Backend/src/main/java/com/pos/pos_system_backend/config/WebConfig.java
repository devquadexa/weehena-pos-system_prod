package com.pos.pos_system_backend.config;

import jakarta.annotation.Nullable;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@Nullable CorsRegistry registry) {
                assert registry != null;
                registry.addMapping("/**")
                        .allowedOrigins(
                            "http://localhost:3000",
                            "https://weehenapos360.cloud",
                            "https://www.weehenapos360.cloud"
                        )
                        .allowedMethods("*")
                        .allowCredentials(true);
            }
        };
    }
}
