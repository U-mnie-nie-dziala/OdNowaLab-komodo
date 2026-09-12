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
@Schema(description = "Response payload after user registration")
public class RegisterResponseDto {

    @Schema(description = "Status message", example = "User registered successfully. Please check your email for confirmation code.")
    private String message;

    @Schema(description = "AWS Cognito unique subject identifier (sub)", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
    private String userSub;

    @Schema(description = "User email address", example = "user@example.com")
    private String email;

    @Schema(description = "Whether the user account is already confirmed in Cognito", example = "false")
    private Boolean isConfirmed;

    @Schema(description = "Local database user profile")
    private UserResponseDto user;
}
