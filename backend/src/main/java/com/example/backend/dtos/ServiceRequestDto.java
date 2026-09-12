package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating or updating a service offering")
public class ServiceRequestDto {

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must not exceed 20 characters")
    @Schema(description = "Name of the service", example = "Kawa i ciastko", maxLength = 20)
    private String name;

    @NotNull(message = "CoinCost is required")
    @Schema(description = "Cost of the service in coins", example = "15")
    private Integer coinCost;

    @Schema(description = "Optional ID of the providing company", example = "1", nullable = true)
    private Integer providerId;
}
