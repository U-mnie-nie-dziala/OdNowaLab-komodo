package com.example.backend.services;

import com.example.backend.dtos.ServiceRequestDto;
import com.example.backend.dtos.ServiceResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.Company;
import com.example.backend.models.Service;
import com.example.backend.repositories.CompanyRepository;
import com.example.backend.repositories.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private ServiceService serviceService;

    private Company provider;
    private Service sampleService;

    @BeforeEach
    void setUp() {
        provider = Company.builder()
                .id(1)
                .name("Kawiarnia")
                .build();

        sampleService = Service.builder()
                .id(1)
                .name("Kawa")
                .coinCost(15)
                .provider(provider)
                .build();
    }

    @Test
    @DisplayName("getAllServices returns list of all services")
    void getAllServices_returnsList() {
        when(serviceRepository.findAll()).thenReturn(List.of(sampleService));

        List<ServiceResponseDto> result = serviceService.getAllServices();

        assertEquals(1, result.size());
        assertEquals("Kawa", result.get(0).getName());
        assertEquals(15, result.get(0).getCoinCost());
        assertEquals(1, result.get(0).getProviderId());
    }

    @Test
    @DisplayName("getServiceById returns service when found")
    void getServiceById_found_returnsDto() {
        when(serviceRepository.findById(1)).thenReturn(Optional.of(sampleService));

        ServiceResponseDto result = serviceService.getServiceById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Kawa", result.getName());
        assertEquals(15, result.getCoinCost());
    }

    @Test
    @DisplayName("getServiceById throws ResourceNotFoundException when not found")
    void getServiceById_notFound_throwsException() {
        when(serviceRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> serviceService.getServiceById(99));
    }

    @Test
    @DisplayName("getServicesByProviderId returns services for provider")
    void getServicesByProviderId_returnsList() {
        when(serviceRepository.findByProviderId(1)).thenReturn(List.of(sampleService));

        List<ServiceResponseDto> result = serviceService.getServicesByProviderId(1);

        assertEquals(1, result.size());
        assertEquals("Kawa", result.get(0).getName());
    }

    @Test
    @DisplayName("createService creates service with provider")
    void createService_withProvider_success() {
        ServiceRequestDto request = ServiceRequestDto.builder()
                .name("Ciastko")
                .coinCost(10)
                .providerId(1)
                .build();

        when(companyRepository.findById(1)).thenReturn(Optional.of(provider));
        when(serviceRepository.save(any(Service.class))).thenAnswer(invocation -> {
            Service s = invocation.getArgument(0);
            s.setId(2);
            return s;
        });

        ServiceResponseDto result = serviceService.createService(request);

        assertNotNull(result);
        assertEquals(2, result.getId());
        assertEquals("Ciastko", result.getName());
        assertEquals(10, result.getCoinCost());
        assertEquals(1, result.getProviderId());
    }

    @Test
    @DisplayName("createService creates service without provider")
    void createService_withoutProvider_success() {
        ServiceRequestDto request = ServiceRequestDto.builder()
                .name("Bilet")
                .coinCost(5)
                .providerId(null)
                .build();

        when(serviceRepository.save(any(Service.class))).thenAnswer(invocation -> {
            Service s = invocation.getArgument(0);
            s.setId(3);
            return s;
        });

        ServiceResponseDto result = serviceService.createService(request);

        assertNotNull(result);
        assertEquals(3, result.getId());
        assertNull(result.getProviderId());
    }

    @Test
    @DisplayName("createService throws ResourceNotFoundException when provider company not found")
    void createService_providerNotFound_throwsException() {
        ServiceRequestDto request = ServiceRequestDto.builder()
                .name("Ciastko")
                .coinCost(10)
                .providerId(99)
                .build();

        when(companyRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> serviceService.createService(request));
        verify(serviceRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateService updates service fields successfully")
    void updateService_success() {
        ServiceRequestDto request = ServiceRequestDto.builder()
                .name("Kawa Duża")
                .coinCost(20)
                .providerId(1)
                .build();

        when(serviceRepository.findById(1)).thenReturn(Optional.of(sampleService));
        when(companyRepository.findById(1)).thenReturn(Optional.of(provider));
        when(serviceRepository.save(any(Service.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ServiceResponseDto result = serviceService.updateService(1, request);

        assertEquals("Kawa Duża", result.getName());
        assertEquals(20, result.getCoinCost());
        assertEquals(1, result.getProviderId());
    }

    @Test
    @DisplayName("deleteService deletes service when found")
    void deleteService_success() {
        when(serviceRepository.existsById(1)).thenReturn(true);

        serviceService.deleteService(1);

        verify(serviceRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("deleteService throws ResourceNotFoundException when not found")
    void deleteService_notFound_throwsException() {
        when(serviceRepository.existsById(99)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> serviceService.deleteService(99));
        verify(serviceRepository, never()).deleteById(any());
    }
}
