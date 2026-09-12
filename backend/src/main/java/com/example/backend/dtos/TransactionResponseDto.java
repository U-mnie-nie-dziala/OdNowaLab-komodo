package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing a transaction")
public class TransactionResponseDto {

    @Schema(description = "Unique identifier of the transaction", example = "1")
    private Integer id;

    @Schema(description = "User ID who performed the transaction", example = "1")
    private Integer userId;

    @Schema(description = "Service ID purchased", example = "1")
    private Integer serviceId;

    @Schema(description = "Service provider (company) ID", example = "1")
    private Integer providerId;

    @Schema(description = "Name of the service provider company", example = "Coffee Lab")
    private String providerName;

    @Schema(description = "Name of the service purchased", example = "Espresso")
    private String serviceName;

    @Schema(description = "Cost in coins for the service", example = "15")
    private Integer coinCost;

    @Schema(description = "Whether the transaction is valid (not yet consumed)", example = "true")
    private Boolean isValid;

    @Schema(description = "Whether the transaction has been consumed by the provider", example = "false")
    private Boolean isConsumed;

    @Schema(description = "Date of the transaction", example = "2026-09-12")
    private LocalDate date;
}
