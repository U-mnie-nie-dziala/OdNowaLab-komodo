package com.example.backend.controllers;

import com.example.backend.dtos.TransactionByPhoneRequestDto;
import com.example.backend.dtos.TransactionRequestDto;
import com.example.backend.dtos.TransactionResponseDto;
import com.example.backend.services.TransactionService;
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
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Endpoints for managing transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "Get all transactions", description = "Retrieves a list of all transactions, optionally filtered by user ID or service ID.")
    @ApiResponse(responseCode = "200", description = "List of transactions retrieved successfully")
    @GetMapping
    public ResponseEntity<List<TransactionResponseDto>> getAllTransactions(
            @Parameter(description = "Optional filter by user ID", example = "1")
            @RequestParam(required = false) Integer userId,
            @Parameter(description = "Optional filter by service ID", example = "1")
            @RequestParam(required = false) Integer serviceId) {
        if (userId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
        }
        if (serviceId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByServiceId(serviceId));
        }
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @Operation(summary = "Get transaction by ID", description = "Retrieves a single transaction by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaction retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> getTransactionById(
            @Parameter(description = "ID of the transaction to retrieve", example = "1")
            @PathVariable Integer id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @Operation(summary = "Create a new transaction", description = "Creates a new transaction record linking a user (via userId or phoneNumber), service, and execution date.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transaction created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or insufficient coins"),
            @ApiResponse(responseCode = "404", description = "User or service not found")
    })
    @PostMapping
    public ResponseEntity<TransactionResponseDto> createTransaction(@Valid @RequestBody TransactionRequestDto request) {
        TransactionResponseDto created = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Create transaction by user phone number", description = "Creates a new transaction for a user identified solely by their phone number.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transaction created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or insufficient coins"),
            @ApiResponse(responseCode = "404", description = "User or service not found")
    })
    @PostMapping("/by-phone")
    public ResponseEntity<TransactionResponseDto> createTransactionByPhone(@Valid @RequestBody TransactionByPhoneRequestDto request) {
        TransactionResponseDto created = transactionService.createTransactionByPhone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing transaction", description = "Updates an existing transaction by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaction updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or insufficient coins"),
            @ApiResponse(responseCode = "404", description = "Transaction, user, or service not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> updateTransaction(
            @Parameter(description = "ID of the transaction to update", example = "1")
            @PathVariable Integer id,
            @Valid @RequestBody TransactionRequestDto request) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request));
    }

    @Operation(summary = "Delete transaction by ID", description = "Removes a transaction record by its unique identifier.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Transaction deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @Parameter(description = "ID of the transaction to delete", example = "1")
            @PathVariable Integer id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
