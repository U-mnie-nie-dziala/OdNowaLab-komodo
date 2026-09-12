package com.example.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload representing a user")
public class UserResponseDto {

    @Schema(description = "Unique identifier of the user", example = "1")
    private Integer id;

    @Schema(description = "Email address of the user", example = "jan.kowalski@example.com")
    private String email;

    @Schema(description = "AWS Cognito unique subject identifier (sub)", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
    private String cognitoSub;

    @Schema(description = "AWS Cognito internal username identifier", example = "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39")
    private String cognitoUsername;

    @Schema(description = "First name of the user", example = "Jan")
    private String name;

    @Schema(description = "Current coin balance", example = "100")
    private Integer coins;

    @Schema(description = "Last name of the user", example = "Kowalski")
    private String surname;

    @Schema(description = "Phone number of the user", example = "123456789")
    private Integer phoneNumber;

    @Schema(description = "Soft deletion status", example = "false")
    private Boolean isDeleted;

    @Schema(description = "Whether the user is an owner", example = "false")
    private Boolean isOwner;
}
