package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating or updating a user")
public class UserRequestDto {

    @Email(message = "Invalid email format")
    @Schema(description = "Email address of the user", example = "jan.kowalski@example.com")
    private String email;

    @Schema(description = "AWS Cognito unique subject identifier (sub)", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
    private String cognitoSub;

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must not exceed 20 characters")
    @Schema(description = "First name of the user", example = "Jan", maxLength = 20)
    private String name;

    @NotNull(message = "Coins is required")
    @Min(value = 0, message = "Coins balance cannot be negative")
    @Schema(description = "Coin balance of the user", example = "100", minimum = "0")
    private Integer coins;

    @NotBlank(message = "Surname is required")
    @Size(max = 20, message = "Surname must not exceed 20 characters")
    @Schema(description = "Last name of the user", example = "Kowalski", maxLength = 20)
    private String surname;

    @NotNull(message = "PhoneNumber is required")
    @Schema(description = "Phone number of the user", example = "123456789")
    private Integer phoneNumber;

    @Builder.Default
    @Schema(description = "Whether the user account is soft deleted", example = "false", defaultValue = "false")
    private Boolean isDeleted = false;

    @Builder.Default
    @Schema(description = "Whether the user is an owner of a company", example = "false", defaultValue = "false")
    private Boolean isOwner = false;
}
