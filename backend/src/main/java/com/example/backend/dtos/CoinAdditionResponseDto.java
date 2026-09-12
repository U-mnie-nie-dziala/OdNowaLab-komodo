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
@Schema(description = "Response payload representing a coin addition")
public class CoinAdditionResponseDto {

    @Schema(description = "Unique identifier of the coin addition record", example = "1")
    private Integer id;

    @Schema(description = "User ID who received the coins", example = "1")
    private Integer userId;

    @Schema(description = "Company ID that granted the coins", example = "1")
    private Integer companyId;

    @Schema(description = "Amount of coins added", example = "50")
    private Integer coinAmount;

    @Schema(description = "Date of the coin addition", example = "2026-09-12")
    private LocalDate date;
}
