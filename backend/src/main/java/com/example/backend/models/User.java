package com.example.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "\"user\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "email", unique = true)
    @Email(message = "Invalid email format")
    private String email;

    @Column(name = "cognito_sub", unique = true)
    private String cognitoSub;

    @Column(name = "cognito_username", unique = true)
    private String cognitoUsername;

    @NotBlank(message = "Name is required")
    @Size(max = 20, message = "Name must not exceed 20 characters")
    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @NotNull(message = "Coins is required")
    @Column(name = "coins", nullable = false)
    private Integer coins;

    @NotBlank(message = "Surname is required")
    @Size(max = 20, message = "Surname must not exceed 20 characters")
    @Column(name = "surname", nullable = false, length = 20)
    private String surname;

    @Column(name = "phonenumber", nullable = true)
    private Integer phoneNumber;

    @Builder.Default
    @Column(name = "is_phone_verified", nullable = false)
    private Boolean isPhoneVerified = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Builder.Default
    @Column(name = "is_owner", nullable = false)
    private Boolean isOwner = false;
}
