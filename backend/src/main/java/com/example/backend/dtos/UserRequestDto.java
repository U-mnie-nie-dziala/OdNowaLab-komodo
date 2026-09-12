package com.example.backend.dtos;

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
public class UserRequestDto {

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must not exceed 20 characters")
    private String name;

    @NotNull(message = "Coins is required")
    private Integer coins;

    @NotBlank(message = "Surname is required")
    @Size(max = 20, message = "Surname must not exceed 20 characters")
    private String surname;

    @NotNull(message = "PhoneNumber is required")
    private Integer phoneNumber;

    @Builder.Default
    private Boolean isDeleted = false;

    @Builder.Default
    private Boolean isOwner = false;
}
