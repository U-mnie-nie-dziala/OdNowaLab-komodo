package com.example.backend.services;

import com.example.backend.dtos.CompanyRequestDto;
import com.example.backend.dtos.CompanyResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.Company;
import com.example.backend.models.User;
import com.example.backend.repositories.CompanyRepository;
import com.example.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CompanyService companyService;

    private User owner;
    private Company sampleCompany;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(1)
                .name("Jan")
                .surname("Kowalski")
                .coins(100)
                .phoneNumber(123456789)
                .isOwner(true)
                .build();

        sampleCompany = Company.builder()
                .id(1)
                .name("EkoPiekarnia")
                .locationX(new BigDecimal("52.23"))
                .locationY(new BigDecimal("21.01"))
                .description("Piekarnia rzemieślnicza")
                .owner(owner)
                .isInRevitalizationZone(true)
                .build();
    }

    @Test
    @DisplayName("getAllCompanies returns mapped list of companies")
    void getAllCompanies_returnsList() {
        when(companyRepository.findAll()).thenReturn(List.of(sampleCompany));

        List<CompanyResponseDto> result = companyService.getAllCompanies();

        assertEquals(1, result.size());
        assertEquals("EkoPiekarnia", result.get(0).getName());
        assertEquals(1, result.get(0).getOwnerId());
    }

    @Test
    @DisplayName("getCompanyById returns company when found")
    void getCompanyById_found_returnsDto() {
        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));

        CompanyResponseDto result = companyService.getCompanyById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("EkoPiekarnia", result.getName());
        assertEquals(new BigDecimal("52.23"), result.getLocationX());
    }

    @Test
    @DisplayName("getCompanyById throws ResourceNotFoundException when not found")
    void getCompanyById_notFound_throwsException() {
        when(companyRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.getCompanyById(99));
    }

    @Test
    @DisplayName("getCompaniesByOwnerId returns list of companies for owner")
    void getCompaniesByOwnerId_returnsList() {
        when(companyRepository.findByOwnerId(1)).thenReturn(List.of(sampleCompany));

        List<CompanyResponseDto> result = companyService.getCompaniesByOwnerId(1);

        assertEquals(1, result.size());
        assertEquals("EkoPiekarnia", result.get(0).getName());
    }

    @Test
    @DisplayName("createCompany creates and returns company when owner exists")
    void createCompany_success() {
        CompanyRequestDto request = CompanyRequestDto.builder()
                .name("NowaFirma")
                .locationX(new BigDecimal("50.00"))
                .locationY(new BigDecimal("20.00"))
                .description("Opis")
                .ownerId(1)
                .isInRevitalizationZone(false)
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> {
            Company c = invocation.getArgument(0);
            c.setId(2);
            return c;
        });

        CompanyResponseDto result = companyService.createCompany(request);

        assertNotNull(result);
        assertEquals(2, result.getId());
        assertEquals("NowaFirma", result.getName());
        assertEquals(1, result.getOwnerId());
    }

    @Test
    @DisplayName("createCompany throws ResourceNotFoundException when owner not found")
    void createCompany_ownerNotFound_throwsException() {
        CompanyRequestDto request = CompanyRequestDto.builder()
                .name("NowaFirma")
                .locationX(new BigDecimal("50.00"))
                .locationY(new BigDecimal("20.00"))
                .description("Opis")
                .ownerId(99)
                .build();

        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.createCompany(request));
        verify(companyRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateCompany updates fields and returns updated company")
    void updateCompany_success() {
        CompanyRequestDto request = CompanyRequestDto.builder()
                .name("EkoPiekarnia Zmieniona")
                .locationX(new BigDecimal("52.50"))
                .locationY(new BigDecimal("21.50"))
                .description("Nowy opis")
                .ownerId(1)
                .isInRevitalizationZone(false)
                .build();

        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CompanyResponseDto result = companyService.updateCompany(1, request);

        assertEquals("EkoPiekarnia Zmieniona", result.getName());
        assertEquals(new BigDecimal("52.50"), result.getLocationX());
        assertFalse(result.getIsInRevitalizationZone());
    }

    @Test
    @DisplayName("deleteCompany deletes company when found")
    void deleteCompany_success() {
        when(companyRepository.existsById(1)).thenReturn(true);

        companyService.deleteCompany(1);

        verify(companyRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("deleteCompany throws ResourceNotFoundException when not found")
    void deleteCompany_notFound_throwsException() {
        when(companyRepository.existsById(99)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> companyService.deleteCompany(99));
        verify(companyRepository, never()).deleteById(any());
    }
}
