package com.pos.pos_system_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Table(name = "users")
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String role; // ADMIN / STAFF
}