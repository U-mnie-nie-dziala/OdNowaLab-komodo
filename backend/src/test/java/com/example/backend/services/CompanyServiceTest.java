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
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

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

    @Mock
    private FileStorageService fileStorageService;

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
                .picture(null)
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
                .picture("/uploads/companies/test.png")
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
        assertEquals("/uploads/companies/test.png", result.getPicture());
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
                .picture("/uploads/companies/updated.jpg")
                .build();

        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CompanyResponseDto result = companyService.updateCompany(1, request);

        assertEquals("EkoPiekarnia Zmieniona", result.getName());
        assertEquals(new BigDecimal("52.50"), result.getLocationX());
        assertFalse(result.getIsInRevitalizationZone());
        assertEquals("/uploads/companies/updated.jpg", result.getPicture());
    }

    @Test
    @DisplayName("deleteCompany deletes company and its image when found")
    void deleteCompany_success() {
        sampleCompany.setPicture("/uploads/companies/old.png");
        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));

        companyService.deleteCompany(1);

        verify(fileStorageService, times(1)).deleteFile("/uploads/companies/old.png");
        verify(companyRepository, times(1)).delete(sampleCompany);
    }

    @Test
    @DisplayName("deleteCompany throws ResourceNotFoundException when not found")
    void deleteCompany_notFound_throwsException() {
        when(companyRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> companyService.deleteCompany(99));
        verify(companyRepository, never()).delete(any());
    }

    @Test
    @DisplayName("uploadCompanyImage uploads new image and updates picture field")
    void uploadCompanyImage_success() {
        MockMultipartFile file = new MockMultipartFile("file", "bakery.png", "image/png", "dummy-bytes".getBytes());

        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));
        when(fileStorageService.storeFile(file, "companies")).thenReturn("/uploads/companies/new-uuid.png");
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> i.getArgument(0));

        CompanyResponseDto result = companyService.uploadCompanyImage(1, file);

        assertEquals("/uploads/companies/new-uuid.png", result.getPicture());
        verify(fileStorageService, times(1)).storeFile(file, "companies");
        verify(companyRepository, times(1)).save(sampleCompany);
    }

    @Test
    @DisplayName("uploadCompanyImage deletes previous image when replacing it")
    void uploadCompanyImage_replacesOldImage() {
        sampleCompany.setPicture("/uploads/companies/previous.jpg");
        MockMultipartFile file = new MockMultipartFile("file", "new.jpg", "image/jpeg", "bytes".getBytes());

        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));
        when(fileStorageService.storeFile(file, "companies")).thenReturn("/uploads/companies/brand-new.jpg");
        when(companyRepository.save(any(Company.class))).thenAnswer(i -> i.getArgument(0));

        CompanyResponseDto result = companyService.uploadCompanyImage(1, file);

        verify(fileStorageService, times(1)).deleteFile("/uploads/companies/previous.jpg");
        assertEquals("/uploads/companies/brand-new.jpg", result.getPicture());
    }

    @Test
    @DisplayName("deleteCompanyImage deletes stored file and clears picture field")
    void deleteCompanyImage_success() {
        sampleCompany.setPicture("/uploads/companies/image-to-remove.png");
        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));

        companyService.deleteCompanyImage(1);

        verify(fileStorageService, times(1)).deleteFile("/uploads/companies/image-to-remove.png");
        assertNull(sampleCompany.getPicture());
        verify(companyRepository, times(1)).save(sampleCompany);
    }

    @Test
    @DisplayName("getCompanyImageResource returns Resource when image exists")
    void getCompanyImageResource_success() {
        sampleCompany.setPicture("/uploads/companies/test.png");
        Resource dummyResource = new ByteArrayResource("image-content".getBytes());

        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));
        when(fileStorageService.loadFileAsResource("/uploads/companies/test.png")).thenReturn(dummyResource);

        Resource result = companyService.getCompanyImageResource(1);

        assertNotNull(result);
        assertEquals(dummyResource, result);
    }

    @Test
    @DisplayName("getCompanyImageResource throws ResourceNotFoundException when company has no picture")
    void getCompanyImageResource_noImage_throwsException() {
        sampleCompany.setPicture(null);
        when(companyRepository.findById(1)).thenReturn(Optional.of(sampleCompany));

        assertThrows(ResourceNotFoundException.class, () -> companyService.getCompanyImageResource(1));
    }
}
