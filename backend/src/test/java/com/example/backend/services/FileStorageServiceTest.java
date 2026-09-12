package com.example.backend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir.toString());
    }

    @Test
    @DisplayName("storeFile safely writes image file to disk and returns relative web path")
    void storeFile_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", "sample-image-data".getBytes());

        String path = fileStorageService.storeFile(file, "companies");

        assertNotNull(path);
        assertTrue(path.startsWith("/uploads/companies/"));
        assertTrue(path.endsWith(".png"));

        // Verify file physically exists in the temp upload directory
        String filename = path.substring(path.lastIndexOf('/') + 1);
        Path targetFile = tempDir.resolve("companies").resolve(filename);
        assertTrue(Files.exists(targetFile));
    }

    @Test
    @DisplayName("storeFile throws IllegalArgumentException for empty file")
    void storeFile_emptyFile_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.png", "image/png", new byte[0]);

        assertThrows(IllegalArgumentException.class, () -> fileStorageService.storeFile(file, "companies"));
    }

    @Test
    @DisplayName("storeFile throws IllegalArgumentException for disallowed file extension (e.g. .pdf or .exe)")
    void storeFile_disallowedExtension_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", "pdf-data".getBytes());

        assertThrows(IllegalArgumentException.class, () -> fileStorageService.storeFile(file, "companies"));
    }

    @Test
    @DisplayName("storeFile throws IllegalArgumentException for non-image MIME type even with image extension")
    void storeFile_nonImageContentType_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.png", "application/javascript", "alert('x')".getBytes());

        assertThrows(IllegalArgumentException.class, () -> fileStorageService.storeFile(file, "companies"));
    }

    @Test
    @DisplayName("deleteFile removes physical file from disk")
    void deleteFile_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "image-bytes".getBytes());
        String webPath = fileStorageService.storeFile(file, "companies");

        String filename = webPath.substring(webPath.lastIndexOf('/') + 1);
        Path physicalFile = tempDir.resolve("companies").resolve(filename);
        assertTrue(Files.exists(physicalFile));

        fileStorageService.deleteFile(webPath);

        assertFalse(Files.exists(physicalFile));
    }

    @Test
    @DisplayName("loadFileAsResource returns readable Resource for existing file")
    void loadFileAsResource_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.webp", "image/webp", "photo-bytes".getBytes());
        String webPath = fileStorageService.storeFile(file, "companies");

        Resource resource = fileStorageService.loadFileAsResource(webPath);

        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    @DisplayName("loadFileAsResource throws IllegalArgumentException for non-existent file")
    void loadFileAsResource_notFound_throwsException() {
        assertThrows(IllegalArgumentException.class,
                () -> fileStorageService.loadFileAsResource("/uploads/companies/non-existent.png"));
    }
}
