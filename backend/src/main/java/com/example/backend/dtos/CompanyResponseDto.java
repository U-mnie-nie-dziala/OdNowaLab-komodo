package com.example.backend.dtos;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponseDto {
    private Integer id;
    private String name;
    private BigDecimal locationX;
    private BigDecimal locationY;
    private String description;
    private Integer ownerId;
    private Boolean isInRevitalizationZone;
}
