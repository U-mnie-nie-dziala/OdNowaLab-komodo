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
@Table(name = "\"User\"")
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

    @Email
    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "cognito_sub", unique = true)
    private String cognitoSub;

    @NotBlank
    @Size(max = 20)
    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @NotNull
    @Column(name = "coins", nullable = false)
    private Integer coins;

    @NotBlank
    @Size(max = 20)
    @Column(name = "surname", nullable = false, length = 20)
    private String surname;

    @NotNull
    @Column(name = "phonenumber", nullable = false)
    private Integer phoneNumber;

    @NotNull
    @Column(name = "isdeleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @NotNull
    @Column(name = "isowner", nullable = false)
    @Builder.Default
    private Boolean isOwner = false;
}
