package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating or updating a company")
public class CompanyRequestDto {

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must not exceed 20 characters")
    @Schema(description = "Name of the company", example = "EkoPiekarnia", maxLength = 20)
    private String name;

    @NotNull(message = "LocationX is required")
    @Digits(integer = 2, fraction = 2, message = "LocationX must match decimal(4,2)")
    @Schema(description = "X coordinate of the location", example = "52.23")
    private BigDecimal locationX;

    @NotNull(message = "LocationY is required")
    @Digits(integer = 2, fraction = 2, message = "LocationY must match decimal(4,2)")
    @Schema(description = "Y coordinate of the location", example = "21.01")
    private BigDecimal locationY;

    @NotBlank(message = "Description is required")
    @Size(max = 200, message = "Description must not exceed 200 characters")
    @Schema(description = "Company description", example = "Lokalna piekarnia rzemieślnicza", maxLength = 200)
    private String description;

    @NotNull(message = "Owner ID is required")
    @Schema(description = "ID of the user who owns this company", example = "1")
    private Integer ownerId;

    @Builder.Default
    @Schema(description = "Indicates whether the company is located in a revitalization zone", example = "true", defaultValue = "false")
    private Boolean isInRevitalizationZone = false;
}
