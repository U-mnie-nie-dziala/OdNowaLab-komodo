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
@Schema(description = "Response payload representing a service offering")
public class ServiceResponseDto {

    @Schema(description = "Unique identifier of the service", example = "1")
    private Integer id;

    @Schema(description = "Name of the service", example = "Kawa i ciastko")
    private String name;

    @Schema(description = "Cost of the service in coins", example = "15")
    private Integer coinCost;

    @Schema(description = "ID of the company providing this service", example = "1", nullable = true)
    private Integer providerId;
}
