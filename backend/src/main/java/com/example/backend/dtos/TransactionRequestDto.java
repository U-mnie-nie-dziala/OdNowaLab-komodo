package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating or updating a transaction")
public class TransactionRequestDto {

    @NotNull(message = "User ID is required")
    @Schema(description = "ID of the user involved in the transaction", example = "1")
    private Integer userId;

    @NotNull(message = "Service ID is required")
    @Schema(description = "ID of the service purchased", example = "1")
    private Integer serviceId;

    @NotNull(message = "Date is required")
    @Schema(description = "Date when the transaction took place (YYYY-MM-DD)", example = "2026-09-12")
    private LocalDate date;
}
