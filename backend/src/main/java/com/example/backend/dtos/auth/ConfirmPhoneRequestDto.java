package com.example.backend.dtos.auth;

import com.fasterxml.jackson.annotation.JsonSetter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for confirming phone number with SMS code")
public class ConfirmPhoneRequestDto {

    @Schema(description = "Phone number that was verified (optional)", example = "123456789")
    private Integer phoneNumber;

    @NotBlank(message = "Verification code is required")
    @Schema(description = "SMS verification code received on the mobile device", example = "123456")
    private String code;

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
