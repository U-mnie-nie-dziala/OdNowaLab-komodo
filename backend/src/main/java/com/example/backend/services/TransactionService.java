package com.example.backend.services;

import com.example.backend.dtos.TransactionRequestDto;
import com.example.backend.dtos.TransactionResponseDto;
import com.example.backend.exceptions.InsufficientCoinsException;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.Service;
import com.example.backend.models.Transaction;
import com.example.backend.models.User;
import com.example.backend.repositories.ServiceRepository;
import com.example.backend.repositories.TransactionRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionResponseDto getTransactionById(Integer id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return mapToResponse(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByUserId(Integer userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByServiceId(Integer serviceId) {
        return transactionRepository.findByServiceId(serviceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponseDto createTransaction(TransactionRequestDto request) {
        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        int cost = service.getCoinCost();

        // Pessimistic lock on user to ensure coin balance cannot be overdrawn concurrently
        User user = userRepository.findByIdWithLock(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (user.getCoins() < cost) {
            throw new InsufficientCoinsException(
                    "Insufficient coins to complete transaction. Required: " + cost
                            + ", available balance: " + user.getCoins());
        }

        user.setCoins(user.getCoins() - cost);
        userRepository.save(user);

        Transaction transaction = Transaction.builder()
                .user(user)
                .service(service)
                .date(request.getDate())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Transactional
    public TransactionResponseDto updateTransaction(Integer id, TransactionRequestDto request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        Service newService = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        Integer oldUserId = transaction.getUser().getId();
        Integer newUserId = request.getUserId();
        int oldCost = transaction.getService().getCoinCost();
        int newCost = newService.getCoinCost();

        if (oldUserId.equals(newUserId)) {
            // Same user: lock user and adjust net difference
            User user = userRepository.findByIdWithLock(oldUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + oldUserId));

            int netCost = newCost - oldCost;
            if (user.getCoins() < netCost) {
                throw new InsufficientCoinsException(
                        "Insufficient coins to update transaction. Additional coins required: "
                                + netCost + ", available balance: " + user.getCoins());
            }

            user.setCoins(user.getCoins() - netCost);
            userRepository.save(user);

            transaction.setUser(user);
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

            // Refund previous user
            oldUser.setCoins(oldUser.getCoins() + oldCost);

            // Deduct from new user
            if (newUser.getCoins() < newCost) {
                throw new InsufficientCoinsException(
                        "Insufficient coins for new transaction user. Required: "
                                + newCost + ", available balance: " + newUser.getCoins());
            }
            newUser.setCoins(newUser.getCoins() - newCost);

            userRepository.save(oldUser);
            userRepository.save(newUser);

            transaction.setUser(newUser);
        }

        transaction.setService(newService);
        transaction.setDate(request.getDate());

        Transaction updated = transactionRepository.save(transaction);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTransaction(Integer id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Refund the user with pessimistic lock
        User user = userRepository.findByIdWithLock(transaction.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + transaction.getUser().getId()));

        int refund = transaction.getService().getCoinCost();
        user.setCoins(user.getCoins() + refund);
        userRepository.save(user);

        transactionRepository.delete(transaction);
    }

    public TransactionResponseDto mapToResponse(Transaction transaction) {
        return TransactionResponseDto.builder()
                .id(transaction.getId())
                .userId(transaction.getUser() != null ? transaction.getUser().getId() : null)
                .serviceId(transaction.getService() != null ? transaction.getService().getId() : null)
                .date(transaction.getDate())
                .build();
    }
}
