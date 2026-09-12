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
@Schema(description = "Request payload for user registration with AWS Cognito")
public class RegisterRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "Email address (used as Cognito username / alias)", example = "user@example.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Schema(description = "User password (minimum 8 characters, with lowercase, uppercase, and numbers)", example = "Secret123")
    private String password;

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must not exceed 20 characters")
    @Schema(description = "First name", example = "Jan", maxLength = 20)
    private String name;

    @NotBlank(message = "Surname is required")
    @Size(max = 20, message = "Surname must not exceed 20 characters")
    @Schema(description = "Last name", example = "Kowalski", maxLength = 20)
    private String surname;

    @Schema(description = "Optional phone number (can be provided and verified separately via SMS)", example = "123456789")
    private Integer phoneNumber;

    @Builder.Default
    @Schema(description = "Whether the user is an owner of a company", example = "false", defaultValue = "false")
    private Boolean isOwner = false;
}
