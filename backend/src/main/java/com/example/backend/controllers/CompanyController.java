package com.example.backend.controllers;

import com.example.backend.dtos.CompanyRequestDto;
import com.example.backend.dtos.CompanyResponseDto;
import com.example.backend.services.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Companies", description = "Endpoints for managing companies")
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
}
