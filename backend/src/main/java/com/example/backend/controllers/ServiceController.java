package com.example.backend.controllers;

import com.example.backend.dtos.ServiceRequestDto;
import com.example.backend.dtos.ServiceResponseDto;
import com.example.backend.services.ServiceService;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Endpoints for managing services/offerings")
public class ServiceController {

    private final ServiceService serviceService;

    @Operation(summary = "Get all services", description = "Retrieves a list of all services, optionally filtered by provider company ID.")
    @ApiResponse(responseCode = "200", description = "List of services retrieved successfully")
    @GetMapping
    public ResponseEntity<List<ServiceResponseDto>> getAllServices(
            @Parameter(description = "Optional filter by provider company ID", example = "1")
            @RequestParam(required = false) Integer providerId) {
        if (providerId != null) {
            return ResponseEntity.ok(serviceService.getServicesByProviderId(providerId));
        }
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @Operation(summary = "Get service by ID", description = "Retrieves a single service by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Service retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Service not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDto> getServiceById(
            @Parameter(description = "ID of the service to retrieve", example = "1")
            @PathVariable Integer id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @Operation(summary = "Create a new service", description = "Creates a new service offering with name, coin cost, and optional provider company.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Service created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Provider company not found")
    })
    @PostMapping
    public ResponseEntity<ServiceResponseDto> createService(@Valid @RequestBody ServiceRequestDto request) {
        ServiceResponseDto created = serviceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing service", description = "Updates an existing service offering by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Service updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Service or provider company not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDto> updateService(
            @Parameter(description = "ID of the service to update", example = "1")
            @PathVariable Integer id,
            @Valid @RequestBody ServiceRequestDto request) {
        return ResponseEntity.ok(serviceService.updateService(id, request));
    }

    @Operation(summary = "Delete service by ID", description = "Removes a service offering by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Service deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Service not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(
            @Parameter(description = "ID of the service to delete", example = "1")
            @PathVariable Integer id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
