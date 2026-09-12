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
@Schema(description = "Request payload for creating or updating a coin addition")
public class CoinAdditionRequestDto {

    @NotNull(message = "User ID is required")
    @Schema(description = "ID of the user receiving coins", example = "1")
    private Integer userId;

    @NotNull(message = "Company ID is required")
    @Schema(description = "ID of the company granting coins", example = "1")
    private Integer companyId;

    @NotNull(message = "Coin amount is required")
    @Schema(description = "Amount of coins to add", example = "50")
    private Integer coinAmount;

    @NotNull(message = "Date is required")
    @Schema(description = "Date when the coins were added (YYYY-MM-DD)", example = "2026-09-12")
    private LocalDate date;
}
