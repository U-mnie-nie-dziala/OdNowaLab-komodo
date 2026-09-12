package com.example.backend.dtos.auth;

import com.example.backend.dtos.UserResponseDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Authentication response with Cognito JWT tokens and user profile")
public class AuthResponseDto {

    @Schema(description = "Cognito Access Token (used for authorized API calls)", example = "eyJraWQiOiJ...")
    private String accessToken;

    @Schema(description = "Cognito ID Token containing user claims and identity attributes", example = "eyJraWQiOiJ...")
    private String idToken;

    @Schema(description = "Cognito Refresh Token (used to obtain new access and ID tokens)", example = "eyJjdHkiOiJ...")
    private String refreshToken;

    @Schema(description = "Token validity duration in seconds", example = "3600")
    private Integer expiresIn;

    @Builder.Default
    @Schema(description = "Token type", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Authenticated user profile from database")
    private UserResponseDto user;
}
