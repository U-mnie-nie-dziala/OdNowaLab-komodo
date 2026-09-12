package com.example.backend.dtos.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload to change password for an authenticated user")
public class ChangePasswordRequestDto {

    @NotBlank(message = "Access token is required")
    @Schema(description = "Valid Cognito access token (can alternatively be passed in Authorization header)", example = "eyJraWQiOiJ...")
    private String accessToken;

    @NotBlank(message = "Previous password is required")
    @Schema(description = "Current password", example = "OldSecret123")
    private String previousPassword;

    @NotBlank(message = "Proposed password is required")
    @Size(min = 8, message = "Proposed password must be at least 8 characters long")
    @Schema(description = "New password", example = "NewSecret123")
    private String proposedPassword;
}
