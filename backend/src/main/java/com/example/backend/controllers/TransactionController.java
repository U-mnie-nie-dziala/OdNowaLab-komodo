package com.example.backend.controllers;

import com.example.backend.dtos.ConsumeTransactionRequestDto;
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
@Tag(name = "Transactions", description = "Endpoints for managing transactions and consumption by service providers")
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "Get all transactions", description = "Retrieves a list of all transactions, optionally filtered by user ID, service provider (company ID), service ID, or validity/consumption status.")
    @ApiResponse(responseCode = "200", description = "List of transactions retrieved successfully")
    @GetMapping
    public ResponseEntity<List<TransactionResponseDto>> getAllTransactions(
            @Parameter(description = "Optional filter by user ID", example = "1")
            @RequestParam(required = false) Integer userId,
            @Parameter(description = "Optional filter by service provider company ID", example = "1")
            @RequestParam(required = false) Integer providerId,
            @Parameter(description = "Optional filter by service ID", example = "1")
            @RequestParam(required = false) Integer serviceId,
            @Parameter(description = "Optional filter by valid (unconsumed) status", example = "true")
            @RequestParam(required = false) Boolean isValid,
            @Parameter(description = "Optional filter by consumed status", example = "false")
            @RequestParam(required = false) Boolean isConsumed) {
        if (userId != null && providerId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByUserIdAndProviderId(userId, providerId, isValid, isConsumed));
        }
        if (providerId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByProviderId(providerId, isValid, isConsumed));
        }
        if (userId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
        }
        if (serviceId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByServiceId(serviceId));
        }
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @Operation(summary = "Get transactions by service provider", description = "Retrieves transactions associated with a specific service provider (company ID), optionally filtered by user ID, phone number, or validity/consumption status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of transactions retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "User not found (when phone number filter is used)")
    })
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<TransactionResponseDto>> getTransactionsByProvider(
            @Parameter(description = "ID of the service provider company", example = "1")
            @PathVariable Integer providerId,
            @Parameter(description = "Optional filter by user ID", example = "1")
            @RequestParam(required = false) Integer userId,
            @Parameter(description = "Optional filter by user phone number", example = "123456789")
            @RequestParam(required = false) Integer phoneNumber,
            @Parameter(description = "Optional filter by valid (unconsumed) status", example = "true")
            @RequestParam(required = false) Boolean isValid,
            @Parameter(description = "Optional filter by consumed status", example = "false")
            @RequestParam(required = false) Boolean isConsumed) {
        if (userId != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByUserIdAndProviderId(userId, providerId, isValid, isConsumed));
        }
        if (phoneNumber != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByUserPhoneAndProviderId(phoneNumber, providerId, isValid, isConsumed));
        }
        return ResponseEntity.ok(transactionService.getTransactionsByProviderId(providerId, isValid, isConsumed));
    }

    @Operation(summary = "Get transactions by service provider (alias)", description = "Retrieves transactions associated with a specific service provider company.")
    @ApiResponse(responseCode = "200", description = "List of transactions retrieved successfully")
    @GetMapping("/by-provider/{providerId}")
    public ResponseEntity<List<TransactionResponseDto>> getTransactionsByProviderAlias(
            @Parameter(description = "ID of the service provider company", example = "1")
            @PathVariable Integer providerId,
            @Parameter(description = "Optional filter by user ID", example = "1")
            @RequestParam(required = false) Integer userId,
            @Parameter(description = "Optional filter by user phone number", example = "123456789")
            @RequestParam(required = false) Integer phoneNumber,
            @Parameter(description = "Optional filter by valid (unconsumed) status", example = "true")
            @RequestParam(required = false) Boolean isValid,
            @Parameter(description = "Optional filter by consumed status", example = "false")
            @RequestParam(required = false) Boolean isConsumed) {
        return getTransactionsByProvider(providerId, userId, phoneNumber, isValid, isConsumed);
    }

    @Operation(summary = "Get user transactions by service provider", description = "Retrieves transactions for a specific user filtered by the service provider company.")
    @ApiResponse(responseCode = "200", description = "List of user transactions for the provider retrieved successfully")
    @GetMapping("/user/{userId}/provider/{providerId}")
    public ResponseEntity<List<TransactionResponseDto>> getUserTransactionsByProvider(
            @Parameter(description = "ID of the user", example = "1")
            @PathVariable Integer userId,
            @Parameter(description = "ID of the service provider company", example = "1")
            @PathVariable Integer providerId,
            @Parameter(description = "Optional filter by valid (unconsumed) status", example = "true")
            @RequestParam(required = false) Boolean isValid,
            @Parameter(description = "Optional filter by consumed status", example = "false")
            @RequestParam(required = false) Boolean isConsumed) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserIdAndProviderId(userId, providerId, isValid, isConsumed));
    }

    @Operation(
            summary = "Consume transaction by ID",
            description = "Marks a transaction as consumed by the service provider. Sets isValid to false and isConsumed to true. Rejects if already consumed."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaction consumed successfully"),
            @ApiResponse(responseCode = "400", description = "Transaction already consumed or provider ID mismatch"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    @RequestMapping(value = "/{id}/consume", method = {RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<TransactionResponseDto> consumeTransactionById(
            @Parameter(description = "ID of the transaction to consume", example = "1")
            @PathVariable Integer id,
            @Parameter(description = "Optional service provider company ID to verify ownership", example = "1")
            @RequestParam(required = false) Integer providerId) {
        return ResponseEntity.ok(transactionService.consumeTransaction(id, providerId));
    }

    @Operation(
            summary = "Consume transaction via payload or query",
            description = "Consumes a transaction specifying transactionId and optional providerId in request body or request parameters."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaction consumed successfully"),
            @ApiResponse(responseCode = "400", description = "Transaction already consumed or invalid request"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    @PostMapping("/consume")
    public ResponseEntity<TransactionResponseDto> consumeTransaction(
            @RequestBody(required = false) ConsumeTransactionRequestDto body,
            @Parameter(description = "Transaction ID if not provided in body", example = "1")
            @RequestParam(required = false) Integer transactionId,
            @Parameter(description = "Provider ID if not provided in body", example = "1")
            @RequestParam(required = false) Integer providerId) {
        Integer targetTransactionId = body != null && body.getTransactionId() != null ? body.getTransactionId() : transactionId;
        Integer targetProviderId = body != null && body.getProviderId() != null ? body.getProviderId() : providerId;

        if (targetTransactionId == null) {
            throw new IllegalArgumentException("transactionId must be provided either in request body or query parameter");
        }

        return ResponseEntity.ok(transactionService.consumeTransaction(targetTransactionId, targetProviderId));
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
