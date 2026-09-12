package com.example.backend.services;

import com.example.backend.dtos.CompanyRequestDto;
import com.example.backend.dtos.CompanyResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.Company;
import com.example.backend.models.User;
import com.example.backend.repositories.CompanyRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CompanyResponseDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyById(Integer id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return mapToResponse(company);
    }

    @Transactional(readOnly = true)
    public List<CompanyResponseDto> getCompaniesByOwnerId(Integer ownerId) {
        return companyRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CompanyResponseDto createCompany(CompanyRequestDto request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User (owner) not found with id: " + request.getOwnerId()));

        Company company = Company.builder()
                .name(request.getName())
                .locationX(request.getLocationX())
                .locationY(request.getLocationY())
                .description(request.getDescription())
                .owner(owner)
                .isInRevitalizationZone(request.getIsInRevitalizationZone() != null ? request.getIsInRevitalizationZone() : false)
                .build();

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    @Transactional
    public CompanyResponseDto updateCompany(Integer id, CompanyRequestDto request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User (owner) not found with id: " + request.getOwnerId()));

        company.setName(request.getName());
        company.setLocationX(request.getLocationX());
        company.setLocationY(request.getLocationY());
        company.setDescription(request.getDescription());
        company.setOwner(owner);
        if (request.getIsInRevitalizationZone() != null) {
            company.setIsInRevitalizationZone(request.getIsInRevitalizationZone());
        }

        Company updated = companyRepository.save(company);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCompany(Integer id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    public CompanyResponseDto mapToResponse(Company company) {
        return CompanyResponseDto.builder()
                .id(company.getId())
                .name(company.getName())
                .locationX(company.getLocationX())
                .locationY(company.getLocationY())
                .description(company.getDescription())
                .ownerId(company.getOwner() != null ? company.getOwner().getId() : null)
                .isInRevitalizationZone(company.getIsInRevitalizationZone())
                .build();
    }
}
