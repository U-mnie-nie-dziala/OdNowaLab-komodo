package com.example.backend.services;

import com.example.backend.dtos.ServiceRequestDto;
import com.example.backend.dtos.ServiceResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.Company;
import com.example.backend.models.Service;
import com.example.backend.repositories.CompanyRepository;
import com.example.backend.repositories.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<ServiceResponseDto> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceResponseDto getServiceById(Integer id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return mapToResponse(service);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponseDto> getServicesByProviderId(Integer providerId) {
        return serviceRepository.findByProviderId(providerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceResponseDto createService(ServiceRequestDto request) {
        Company provider = null;
        if (request.getProviderId() != null) {
            provider = companyRepository.findById(request.getProviderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company (provider) not found with id: " + request.getProviderId()));
        }

        Service service = Service.builder()
                .name(request.getName())
                .coinCost(request.getCoinCost())
                .provider(provider)
                .build();

        Service saved = serviceRepository.save(service);
        return mapToResponse(saved);
    }

    @Transactional
    public ServiceResponseDto updateService(Integer id, ServiceRequestDto request) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        Company provider = null;
        if (request.getProviderId() != null) {
            provider = companyRepository.findById(request.getProviderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company (provider) not found with id: " + request.getProviderId()));
        }

        service.setName(request.getName());
        service.setCoinCost(request.getCoinCost());
        service.setProvider(provider);

        Service updated = serviceRepository.save(service);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteService(Integer id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found with id: " + id);
        }
        serviceRepository.deleteById(id);
    }

    public ServiceResponseDto mapToResponse(Service service) {
        return ServiceResponseDto.builder()
                .id(service.getId())
                .name(service.getName())
                .coinCost(service.getCoinCost())
                .providerId(service.getProvider() != null ? service.getProvider().getId() : null)
                .build();
    }
}
