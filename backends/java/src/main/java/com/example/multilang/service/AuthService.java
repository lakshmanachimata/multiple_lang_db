package com.example.multilang.service;

import com.example.multilang.config.RepositoryFactory;
import com.example.multilang.domain.User;
import com.example.multilang.repository.UserRepository;
import com.example.multilang.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final RepositoryFactory repositoryFactory;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String register(String email, String password) {
        UserRepository userRepo = repositoryFactory.getUserRepository();
        if (userRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .build();
        User saved = userRepo.save(user);
        return jwtUtil.generateToken(saved.getId(), saved.getEmail());
    }

    public String login(String email, String password) {
        UserRepository userRepo = repositoryFactory.getUserRepository();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return jwtUtil.generateToken(user.getId(), user.getEmail());
    }
}
