package com.rentequip.rentequip_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public UserService(
            UserRepository userRepository,
            FileStorageService fileStorageService
    ) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public User submitCitizenship(
            String email,
            MultipartFile citizenship
    ) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException(
                    "Email is required"
            );
        }

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                email.trim()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        if (citizenship == null ||
                citizenship.isEmpty()) {

            throw new RuntimeException(
                    "Citizenship image is required"
            );
        }

        String citizenshipUrl =
                fileStorageService.saveFile(
                        citizenship,
                        "citizenship"
                );

        user.setCitizenshipUrl(
                citizenshipUrl
        );

        user.setCitizenshipProvided(true);

        return userRepository.save(user);
    }

    public boolean hasCitizenship(String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            return false;
        }

        return userRepository
                .findByEmailIgnoreCase(
                        email.trim()
                )
                .map(User::isCitizenshipProvided)
                .orElse(false);
    }

    public User getUserByEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException(
                    "Email is required"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(
                        email.trim()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }
}