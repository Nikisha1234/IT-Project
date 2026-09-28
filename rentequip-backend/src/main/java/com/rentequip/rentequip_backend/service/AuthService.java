package com.rentequip.rentequip_backend.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User register(User user) {

        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        String email = user.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException(
                    "An account with this email already exists"
            );
        }

        user.setName(user.getName().trim());
        user.setEmail(email);
        user.setRole("USER");

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    public User login(String email, String password) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        User user = userRepository
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        String storedPassword = user.getPassword();

        boolean passwordMatches;

        if (storedPassword.startsWith("$2a$")
                || storedPassword.startsWith("$2b$")
                || storedPassword.startsWith("$2y$")) {

            passwordMatches = passwordEncoder.matches(
                    password,
                    storedPassword
            );

        } else {

            passwordMatches = storedPassword.equals(password);

            if (passwordMatches) {
                user.setPassword(
                        passwordEncoder.encode(password)
                );

                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }
}