package com.rentequip.rentequip_backend.config;

import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminDataInitializer {

    @Bean
    CommandLineRunner createAdmin(UserRepository userRepository) {
        return args -> {

            String adminEmail = "admin@rentequip.com";

            if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {

                User admin = new User(
                        "Admin",
                        adminEmail,
                        "9800000000",
                        "admin123",
                        "ADMIN"
                );

                userRepository.save(admin);

                System.out.println("Admin account created successfully.");
            }
        };
    }
}
