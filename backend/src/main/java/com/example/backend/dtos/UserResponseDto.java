package com.example.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Integer id;
    private String name;
    private Integer coins;
    private String surname;
    private Integer phoneNumber;
    private Boolean isDeleted;
    private Boolean isOwner;
}
