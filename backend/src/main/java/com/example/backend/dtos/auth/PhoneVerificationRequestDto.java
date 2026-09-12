package com.example.backend.dtos.auth;

import com.fasterxml.jackson.annotation.JsonSetter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for inputting phone number and triggering SMS verification")
public class PhoneVerificationRequestDto {

    @NotNull(message = "Phone number is required")
    @Schema(description = "Phone number to register and verify via SMS", example = "123456789")
    private Integer phoneNumber;

    @Schema(description = "Cognito access token (optional if Authorization header is supplied)", example = "eyJraWQi...")
    private String accessToken;

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
