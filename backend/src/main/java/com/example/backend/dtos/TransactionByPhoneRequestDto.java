package com.example.backend.dtos;

import com.fasterxml.jackson.annotation.JsonSetter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating a transaction by providing the user's phone number")
public class TransactionByPhoneRequestDto {

    @NotNull(message = "Phone number is required")
    @Schema(description = "Phone number of the user", example = "123456789")
    private Integer phoneNumber;

    @NotNull(message = "Service ID is required")
    @Schema(description = "ID of the service purchased", example = "1")
    private Integer serviceId;

    @Schema(description = "Date when the transaction took place (YYYY-MM-DD). Defaults to current date if omitted.", example = "2026-09-12")
    private LocalDate date;

    @JsonSetter("phoneNumber")
    public void setPhoneNumberFromJson(Object value) {
        if (value instanceof Number n) {
            this.phoneNumber = n.intValue();
        } else if (value instanceof String s) {
            String cleaned = s.replaceAll("[^0-9]", "");
            if (cleaned.length() > 9) {
                cleaned = cleaned.substring(cleaned.length() - 9);
            }
            if (!cleaned.isEmpty()) {
                this.phoneNumber = Integer.parseInt(cleaned);
            }
        }
    }
}
