package com.pos.pos_system_backend.service;

import com.pos.pos_system_backend.dto.CreateUserRequest;
import com.pos.pos_system_backend.dto.UserResponse;
import com.pos.pos_system_backend.entity.User;
import com.pos.pos_system_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public List<UserResponse> getAllUsers() {
        return repo.findAll()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getRole()
                ))
                .toList();
    }

    public void deleteUser(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        repo.deleteById(id);
    }
}
