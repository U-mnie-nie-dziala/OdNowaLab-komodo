package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload to consume a transaction")
public class ConsumeTransactionRequestDto {

    @Schema(description = "ID of the transaction to consume", example = "1")
    private Integer transactionId;

    @Schema(description = "Optional ID of the service provider company to verify ownership", example = "1")
    private Integer providerId;
}
