package com.example.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadBasePath;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadBasePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadBasePath);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize upload directory: " + this.uploadBasePath, e);
        }
    }

    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String extension = getFileExtension(originalFilename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file type: " + extension + ". Allowed: " + ALLOWED_EXTENSIONS);
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        try {
            Path targetDir = this.uploadBasePath.resolve(subDirectory).normalize();
            Files.createDirectories(targetDir);

            String newFilename = UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(newFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + subDirectory + "/" + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalFilename, e);
        }
    }

    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        try {
            // Strip leading /uploads/ or uploads/
            String sanitized = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
            if (sanitized.startsWith("uploads/")) {
                sanitized = sanitized.substring("uploads/".length());
            }

            Path filePath = this.uploadBasePath.resolve(sanitized).normalize();
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException ignored) {
            // Non-critical: log and proceed
        }
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            String sanitized = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
            if (sanitized.startsWith("uploads/")) {
                sanitized = sanitized.substring("uploads/".length());
            }

            Path filePath = this.uploadBasePath.resolve(sanitized).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("File not found or not readable: " + relativePath);
            }
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid file path: " + relativePath, e);
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : "";
    }
}
