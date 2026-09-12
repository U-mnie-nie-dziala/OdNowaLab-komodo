package com.example.backend.dtos.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
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
@Schema(description = "Request payload to confirm password reset")
public class ConfirmForgotPasswordRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "User email address", example = "user@example.com")
    private String email;

    @NotBlank(message = "Confirmation code is required")
    @Schema(description = "Verification code received via email", example = "123456")
    private String confirmationCode;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "New password must be at least 8 characters long")
    @Schema(description = "New password", example = "NewSecret123")
    private String newPassword;
}
