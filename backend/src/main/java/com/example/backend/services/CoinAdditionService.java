package com.example.backend.services;

import com.example.backend.dtos.CoinAdditionRequestDto;
import com.example.backend.dtos.CoinAdditionResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.CoinAddition;
import com.example.backend.models.Company;
import com.example.backend.models.User;
import com.example.backend.repositories.CoinAdditionRepository;
import com.example.backend.repositories.CompanyRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoinAdditionService {

    private final CoinAdditionRepository coinAdditionRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<CoinAdditionResponseDto> getAllCoinAdditions() {
        return coinAdditionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CoinAdditionResponseDto getCoinAdditionById(Integer id) {
        CoinAddition coinAddition = coinAdditionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CoinAddition not found with id: " + id));
        return mapToResponse(coinAddition);
    }

    @Transactional(readOnly = true)
    public List<CoinAdditionResponseDto> getCoinAdditionsByUserId(Integer userId) {
        return coinAdditionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CoinAdditionResponseDto> getCoinAdditionsByCompanyId(Integer companyId) {
        return coinAdditionRepository.findByCompanyId(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CoinAdditionResponseDto createCoinAddition(CoinAdditionRequestDto request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        CoinAddition coinAddition = CoinAddition.builder()
                .user(user)
                .company(company)
                .coinAmount(request.getCoinAmount())
                .date(request.getDate())
                .build();

        CoinAddition saved = coinAdditionRepository.save(coinAddition);
        return mapToResponse(saved);
    }

    @Transactional
    public CoinAdditionResponseDto updateCoinAddition(Integer id, CoinAdditionRequestDto request) {
        CoinAddition coinAddition = coinAdditionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CoinAddition not found with id: " + id));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        coinAddition.setUser(user);
        coinAddition.setCompany(company);
        coinAddition.setCoinAmount(request.getCoinAmount());
        coinAddition.setDate(request.getDate());

        CoinAddition updated = coinAdditionRepository.save(coinAddition);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCoinAddition(Integer id) {
        if (!coinAdditionRepository.existsById(id)) {
            throw new ResourceNotFoundException("CoinAddition not found with id: " + id);
        }
        coinAdditionRepository.deleteById(id);
    }

    public CoinAdditionResponseDto mapToResponse(CoinAddition coinAddition) {
        return CoinAdditionResponseDto.builder()
                .id(coinAddition.getId())
                .userId(coinAddition.getUser() != null ? coinAddition.getUser().getId() : null)
                .companyId(coinAddition.getCompany() != null ? coinAddition.getCompany().getId() : null)
                .coinAmount(coinAddition.getCoinAmount())
                .date(coinAddition.getDate())
                .build();
    }
}
