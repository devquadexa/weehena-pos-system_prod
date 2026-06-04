package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.dto.CreateUserRequest;
import com.pos.pos_system_backend.entity.User;
import com.pos.pos_system_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;


    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public void createUser(CreateUserRequest request) {


        if (repo.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();

        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        repo.save(user);
    }
}
