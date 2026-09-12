package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing a company")
public class CompanyResponseDto {

    @Schema(description = "Unique identifier of the company", example = "1")
    private Integer id;

    @Schema(description = "Name of the company", example = "EkoPiekarnia")
    private String name;

    @Schema(description = "X coordinate of the location", example = "52.23")
    private BigDecimal locationX;

    @Schema(description = "Y coordinate of the location", example = "21.01")
    private BigDecimal locationY;

    @Schema(description = "Description of the company", example = "Lokalna piekarnia rzemieślnicza")
    private String description;

    @Schema(description = "User ID of the owner", example = "1")
    private Integer ownerId;

    @Schema(description = "Whether the company is in a revitalization zone", example = "true")
    private Boolean isInRevitalizationZone;

    @Schema(description = "Relative URL path to the company picture static resource", example = "/uploads/companies/example.jpg")
    private String picture;
}
