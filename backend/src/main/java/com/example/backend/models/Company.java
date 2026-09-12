package com.example.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotBlank
    @Size(max = 20)
    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @NotNull
    @Digits(integer = 2, fraction = 2)
    @Column(name = "locationx", nullable = false, precision = 4, scale = 2)
    private BigDecimal locationX;

    @NotNull
    @Digits(integer = 2, fraction = 2)
    @Column(name = "locationy", nullable = false, precision = 4, scale = 2)
    private BigDecimal locationY;

    @NotBlank
    @Size(max = 200)
    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner", nullable = false)
    private User owner;

    @NotNull
    @Column(name = "isinrevitalizationzone", nullable = false)
    @Builder.Default
    private Boolean isInRevitalizationZone = false;

    @Column(name = "picture", length = 255)
    private String picture;
}
