package com.example.backend.dtos.auth;

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
@Schema(description = "Request payload to refresh JWT tokens")
public class RefreshTokenRequestDto {

    @NotBlank(message = "Refresh token is required")
    @Schema(description = "Valid Cognito Refresh Token", example = "eyJjdHkiOiJ...")
    private String refreshToken;
}
