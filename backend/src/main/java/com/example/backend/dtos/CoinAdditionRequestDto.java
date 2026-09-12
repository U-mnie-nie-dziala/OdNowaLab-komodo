package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
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
@Schema(description = "Request payload for creating or updating a coin addition")
public class CoinAdditionRequestDto {

    @NotNull(message = "User ID is required")
    @Schema(description = "ID of the user receiving coins", example = "1")
    private Integer userId;

    @NotNull(message = "Company ID is required")
    @Schema(description = "ID of the company granting coins", example = "1")
    private Integer companyId;

    @NotNull(message = "Coin amount is required")
    @Min(value = 1, message = "Coin amount must be at least 1")
    @Schema(description = "Amount of coins to add (must be at least 1)", example = "50", minimum = "1")
    private Integer coinAmount;

    @NotNull(message = "Date is required")
    @Schema(description = "Date when the coins were added (YYYY-MM-DD)", example = "2026-09-12")
    private LocalDate date;
}
