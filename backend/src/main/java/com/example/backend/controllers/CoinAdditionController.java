package com.example.backend.controllers;

import com.example.backend.dtos.CoinAdditionRequestDto;
import com.example.backend.dtos.CoinAdditionResponseDto;
import com.example.backend.services.CoinAdditionService;
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
@RequestMapping("/api/coin-additions")
@RequiredArgsConstructor
@Tag(name = "Coin Additions", description = "Endpoints for managing coin additions")
public class CoinAdditionController {

    private final CoinAdditionService coinAdditionService;

    @Operation(summary = "Get all coin additions", description = "Retrieves a list of all coin additions, optionally filtered by user ID or company ID.")
    @ApiResponse(responseCode = "200", description = "List of coin additions retrieved successfully")
    @GetMapping
    public ResponseEntity<List<CoinAdditionResponseDto>> getAllCoinAdditions(
            @Parameter(description = "Optional filter by user ID", example = "1")
            @RequestParam(required = false) Integer userId,
            @Parameter(description = "Optional filter by company ID", example = "1")
            @RequestParam(required = false) Integer companyId) {
        if (userId != null) {
            return ResponseEntity.ok(coinAdditionService.getCoinAdditionsByUserId(userId));
        }
        if (companyId != null) {
            return ResponseEntity.ok(coinAdditionService.getCoinAdditionsByCompanyId(companyId));
        }
        return ResponseEntity.ok(coinAdditionService.getAllCoinAdditions());
    }

    @Operation(summary = "Get coin addition by ID", description = "Retrieves a single coin addition by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Coin addition retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Coin addition not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CoinAdditionResponseDto> getCoinAdditionById(
            @Parameter(description = "ID of the coin addition to retrieve", example = "1")
            @PathVariable Integer id) {
        return ResponseEntity.ok(coinAdditionService.getCoinAdditionById(id));
    }

    @Operation(summary = "Create a new coin addition", description = "Records an addition of coins from a company to a user on a specific date.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Coin addition created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "User or company not found")
    })
    @PostMapping
    public ResponseEntity<CoinAdditionResponseDto> createCoinAddition(@Valid @RequestBody CoinAdditionRequestDto request) {
        CoinAdditionResponseDto created = coinAdditionService.createCoinAddition(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing coin addition", description = "Updates an existing coin addition record by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Coin addition updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Coin addition, user, or company not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<CoinAdditionResponseDto> updateCoinAddition(
            @Parameter(description = "ID of the coin addition to update", example = "1")
            @PathVariable Integer id,
            @Valid @RequestBody CoinAdditionRequestDto request) {
        return ResponseEntity.ok(coinAdditionService.updateCoinAddition(id, request));
    }

    @Operation(summary = "Delete coin addition by ID", description = "Removes a coin addition record by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Coin addition deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Coin addition not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoinAddition(
            @Parameter(description = "ID of the coin addition to delete", example = "1")
            @PathVariable Integer id) {
        coinAdditionService.deleteCoinAddition(id);
        return ResponseEntity.noContent().build();
    }
}
