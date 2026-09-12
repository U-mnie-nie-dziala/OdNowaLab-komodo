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
public class TransactionRequestDto {

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Service ID is required")
    private Integer serviceId;

    @NotNull(message = "Date is required")
    private LocalDate date;
}
