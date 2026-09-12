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
