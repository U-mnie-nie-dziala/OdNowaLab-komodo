package com.example.backend.dtos;

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
public class CompanyRequestDto {

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must not exceed 20 characters")
    private String name;

    @NotNull(message = "LocationX is required")
    @Digits(integer = 2, fraction = 2, message = "LocationX must match decimal(4,2)")
    private BigDecimal locationX;

    @NotNull(message = "LocationY is required")
    @Digits(integer = 2, fraction = 2, message = "LocationY must match decimal(4,2)")
    private BigDecimal locationY;

    @NotBlank(message = "Description is required")
    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;

    @NotNull(message = "Owner ID is required")
    private Integer ownerId;

    @Builder.Default
    private Boolean isInRevitalizationZone = false;
}
