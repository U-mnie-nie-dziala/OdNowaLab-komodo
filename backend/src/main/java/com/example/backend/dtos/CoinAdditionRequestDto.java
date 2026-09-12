package com.example.backend.dtos;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoinAdditionRequestDto {

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Company ID is required")
    private Integer companyId;

    @NotNull(message = "Coin amount is required")
    private Integer coinAmount;

    @NotNull(message = "Date is required")
    private LocalDate date;
}
