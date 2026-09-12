package com.example.backend.services;

import com.example.backend.dtos.CoinAdditionRequestDto;
import com.example.backend.dtos.CoinAdditionResponseDto;
import com.example.backend.exceptions.InsufficientCoinsException;
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
        if (request.getCoinAmount() == null || request.getCoinAmount() <= 0) {
            throw new IllegalArgumentException("Coin amount must be positive");
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        // Pessimistic lock on user to safely prevent race conditions
        User user = userRepository.findByIdWithLock(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        user.setCoins(user.getCoins() + request.getCoinAmount());
        userRepository.save(user);

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
        if (request.getCoinAmount() == null || request.getCoinAmount() <= 0) {
            throw new IllegalArgumentException("Coin amount must be positive");
        }

        CoinAddition coinAddition = coinAdditionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CoinAddition not found with id: " + id));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        Integer oldUserId = coinAddition.getUser().getId();
        Integer newUserId = request.getUserId();
        int oldAmount = coinAddition.getCoinAmount();
        int newAmount = request.getCoinAmount();

        if (oldUserId.equals(newUserId)) {
            // Same user: adjust difference with lock
            User user = userRepository.findByIdWithLock(oldUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + oldUserId));

            int diff = newAmount - oldAmount;
            if (user.getCoins() + diff < 0) {
                throw new InsufficientCoinsException(
                        "Cannot update coin addition: user balance would become negative (current balance: "
                                + user.getCoins() + ", required reduction: " + (-diff) + ")");
            }

            user.setCoins(user.getCoins() + diff);
            userRepository.save(user);

            coinAddition.setUser(user);
        } else {
            // Different users: lock both in fixed order to prevent deadlocks
            int firstId = Math.min(oldUserId, newUserId);
            int secondId = Math.max(oldUserId, newUserId);

            User firstLocked = userRepository.findByIdWithLock(firstId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + firstId));
            User secondLocked = userRepository.findByIdWithLock(secondId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + secondId));

            User oldUser = oldUserId.equals(firstId) ? firstLocked : secondLocked;
            User newUser = newUserId.equals(firstId) ? firstLocked : secondLocked;

            if (oldUser.getCoins() < oldAmount) {
                throw new InsufficientCoinsException(
                        "Cannot transfer coin addition to new user: previous user has insufficient coins to revert (current balance: "
                                + oldUser.getCoins() + ", required: " + oldAmount + ")");
            }

            oldUser.setCoins(oldUser.getCoins() - oldAmount);
            newUser.setCoins(newUser.getCoins() + newAmount);

            userRepository.save(oldUser);
            userRepository.save(newUser);

            coinAddition.setUser(newUser);
        }

        coinAddition.setCompany(company);
        coinAddition.setCoinAmount(newAmount);
        coinAddition.setDate(request.getDate());

        CoinAddition updated = coinAdditionRepository.save(coinAddition);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCoinAddition(Integer id) {
        CoinAddition coinAddition = coinAdditionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CoinAddition not found with id: " + id));

        User user = userRepository.findByIdWithLock(coinAddition.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + coinAddition.getUser().getId()));

        if (user.getCoins() < coinAddition.getCoinAmount()) {
            throw new InsufficientCoinsException(
                    "Cannot delete coin addition: user balance would become negative (current balance: "
                            + user.getCoins() + ", required reduction: " + coinAddition.getCoinAmount() + ")");
        }

        user.setCoins(user.getCoins() - coinAddition.getCoinAmount());
        userRepository.save(user);

        coinAdditionRepository.delete(coinAddition);
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
