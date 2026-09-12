package com.example.backend.controllers;

import com.example.backend.dtos.CompanyRequestDto;
import com.example.backend.dtos.CompanyResponseDto;
import com.example.backend.services.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Endpoints for managing companies and company static resources")
public class CompanyController {

    private final CompanyService companyService;

    @Operation(summary = "Get all companies", description = "Retrieves a list of all companies, optionally filtered by owner ID.")
    @ApiResponse(responseCode = "200", description = "List of companies retrieved successfully")
    @GetMapping
    public ResponseEntity<List<CompanyResponseDto>> getAllCompanies(
            @Parameter(description = "Optional filter by owner user ID", example = "1")
            @RequestParam(required = false) Integer ownerId) {
        if (ownerId != null) {
            return ResponseEntity.ok(companyService.getCompaniesByOwnerId(ownerId));
        }
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @Operation(summary = "Get company by ID", description = "Retrieves a single company by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Company retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDto> getCompanyById(
            @Parameter(description = "ID of the company to retrieve", example = "1")
            @PathVariable Integer id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @Operation(summary = "Create a new company", description = "Creates a new company record linked to an existing owner user.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Company created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Owner user not found")
    })
    @PostMapping
    public ResponseEntity<CompanyResponseDto> createCompany(@Valid @RequestBody CompanyRequestDto request) {
        CompanyResponseDto created = companyService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing company", description = "Updates an existing company's information by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Company updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Company or owner user not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponseDto> updateCompany(
            @Parameter(description = "ID of the company to update", example = "1")
            @PathVariable Integer id,
            @Valid @RequestBody CompanyRequestDto request) {
        return ResponseEntity.ok(companyService.updateCompany(id, request));
    }

    @Operation(summary = "Delete company by ID", description = "Removes a company record by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Company deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(
            @Parameter(description = "ID of the company to delete", example = "1")
            @PathVariable Integer id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Upload company picture", description = "Uploads a picture image file (JPG, PNG, GIF, WEBP) for the specified company.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid image file"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponseDto> uploadCompanyImage(
            @Parameter(description = "ID of the company", example = "1")
            @PathVariable Integer id,
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file) {
        CompanyResponseDto updated = companyService.uploadCompanyImage(id, file);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Update company picture", description = "Replaces the existing picture of the company with a newly uploaded image file.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid image file"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponseDto> updateCompanyImage(
            @Parameter(description = "ID of the company", example = "1")
            @PathVariable Integer id,
            @Parameter(description = "New image file to replace the old one", required = true)
            @RequestParam("file") MultipartFile file) {
        CompanyResponseDto updated = companyService.updateCompanyImage(id, file);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete company picture", description = "Deletes the stored picture of the company from disk and clears the reference.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Image deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Company not found")
    })
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteCompanyImage(
            @Parameter(description = "ID of the company", example = "1")
            @PathVariable Integer id) {
        companyService.deleteCompanyImage(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get company picture resource", description = "Serves the image file static resource directly for the specified company.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image resource returned successfully",
                    content = @Content(mediaType = "image/*", schema = @Schema(type = "string", format = "binary"))),
            @ApiResponse(responseCode = "404", description = "Company or image not found")
    })
    @GetMapping("/{id}/image")
    public ResponseEntity<Resource> getCompanyImage(
            @Parameter(description = "ID of the company", example = "1")
            @PathVariable Integer id) {
        Resource resource = companyService.getCompanyImageResource(id);

        String contentType = "application/octet-stream";
        try {
            if (resource.getFile() != null) {
                String detected = Files.probeContentType(resource.getFile().toPath());
                if (detected != null) {
                    contentType = detected;
                }
            }
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
