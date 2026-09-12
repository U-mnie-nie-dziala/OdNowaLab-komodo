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

    @Schema(description = "Date of the transaction", example = "2026-09-12")
    private LocalDate date;
}
