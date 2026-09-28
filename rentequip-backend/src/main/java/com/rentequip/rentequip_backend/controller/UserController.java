package com.rentequip.rentequip_backend.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rentequip.rentequip_backend.entity.User;
import com.rentequip.rentequip_backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/citizenship/status")
    public Map<String, Boolean> getCitizenshipStatus(
            @RequestParam String email
    ) {
        boolean provided =
                userService.hasCitizenship(email);

        return Map.of(
                "provided",
                provided
        );
    }

    @PostMapping(
            value = "/citizenship",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public User submitCitizenship(
            @RequestParam String email,
            @RequestParam("citizenship")
            MultipartFile citizenship
    ) {
        return userService.submitCitizenship(
                email,
                citizenship
        );
    }

    @GetMapping("/by-email")
public User getUserByEmail(@RequestParam String email) {
    return userService.getUserByEmail(email);
}
}