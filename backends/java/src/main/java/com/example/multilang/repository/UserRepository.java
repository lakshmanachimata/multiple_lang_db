package com.example.multilang.repository;

import com.example.multilang.domain.User;

import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
}
