package com.example.backend.dtos;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoinAdditionResponseDto {
    private Integer id;
    private Integer userId;
    private Integer companyId;
    private Integer coinAmount;
    private LocalDate date;
}
