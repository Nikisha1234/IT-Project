package com.rentequip.rentequip_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDirectory = Paths.get("uploads");

    public String saveFile(MultipartFile file, String folder) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        try {
            Path folderPath = uploadDirectory.resolve(folder);

            Files.createDirectories(folderPath);

            String originalName = file.getOriginalFilename();

            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension =
                        originalName.substring(originalName.lastIndexOf("."));
            }

            String fileName =
                    UUID.randomUUID() + extension;

            Path filePath = folderPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath
            );

            return "/uploads/" + folder + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to save file");
        }
    }
}