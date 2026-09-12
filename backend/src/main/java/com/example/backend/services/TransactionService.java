package com.example.backend.services;

import com.example.backend.dtos.TransactionByPhoneRequestDto;
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

import java.time.LocalDate;
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

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByProviderId(Integer providerId) {
        return getTransactionsByProviderId(providerId, null, null);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByProviderId(Integer providerId, Boolean isValid, Boolean isConsumed) {
        List<Transaction> transactions;
        if (isValid != null) {
            transactions = transactionRepository.findByService_Provider_IdAndIsValid(providerId, isValid);
        } else if (isConsumed != null) {
            transactions = transactionRepository.findByService_Provider_IdAndIsConsumed(providerId, isConsumed);
        } else {
            transactions = transactionRepository.findByService_Provider_Id(providerId);
        }
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByUserIdAndProviderId(Integer userId, Integer providerId) {
        return getTransactionsByUserIdAndProviderId(userId, providerId, null, null);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByUserIdAndProviderId(Integer userId, Integer providerId, Boolean isValid, Boolean isConsumed) {
        List<Transaction> transactions;
        if (isValid != null) {
            transactions = transactionRepository.findByUserIdAndService_Provider_IdAndIsValid(userId, providerId, isValid);
        } else if (isConsumed != null) {
            transactions = transactionRepository.findByUserIdAndService_Provider_IdAndIsConsumed(userId, providerId, isConsumed);
        } else {
            transactions = transactionRepository.findByUserIdAndService_Provider_Id(userId, providerId);
        }
        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByUserPhoneAndProviderId(Integer phoneNumber, Integer providerId) {
        return getTransactionsByUserPhoneAndProviderId(phoneNumber, providerId, null, null);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDto> getTransactionsByUserPhoneAndProviderId(Integer phoneNumber, Integer providerId, Boolean isValid, Boolean isConsumed) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with phone number: " + phoneNumber));
        return getTransactionsByUserIdAndProviderId(user.getId(), providerId, isValid, isConsumed);
    }

    @Transactional
    public TransactionResponseDto consumeTransaction(Integer id, Integer providerId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (Boolean.FALSE.equals(transaction.getIsValid()) || Boolean.TRUE.equals(transaction.getIsConsumed())) {
            throw new IllegalStateException("Transaction with id " + id + " has already been consumed");
        }

        if (providerId != null) {
            if (transaction.getService() == null || transaction.getService().getProvider() == null
                    || !providerId.equals(transaction.getService().getProvider().getId())) {
                throw new IllegalArgumentException("Transaction does not belong to provider with id: " + providerId);
            }
        }

        transaction.setIsValid(false);
        transaction.setIsConsumed(true);
        Transaction updated = transactionRepository.save(transaction);
        return mapToResponse(updated);
    }

    @Transactional
    public TransactionResponseDto consumeTransaction(Integer id) {
        return consumeTransaction(id, null);
    }

    @Transactional
    public TransactionResponseDto createTransaction(TransactionRequestDto request) {
        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        int cost = service.getCoinCost();

        User user;
        if (request.getUserId() != null) {
            user = userRepository.findByIdWithLock(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        } else if (request.getPhoneNumber() != null) {
            user = userRepository.findByPhoneNumberWithLock(request.getPhoneNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with phone number: " + request.getPhoneNumber()));
        } else {
            throw new IllegalArgumentException("Either userId or phoneNumber must be provided");
        }

        if (user.getCoins() < cost) {
            throw new InsufficientCoinsException(
                    "Insufficient coins to complete transaction. Required: " + cost
                            + ", available balance: " + user.getCoins());
        }

        user.setCoins(user.getCoins() - cost);
        userRepository.save(user);

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        Transaction transaction = Transaction.builder()
                .user(user)
                .service(service)
                .date(date)
                .isValid(true)
                .isConsumed(false)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Transactional
    public TransactionResponseDto createTransactionByPhone(TransactionByPhoneRequestDto request) {
        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        int cost = service.getCoinCost();

        // Pessimistic lock on user by phone number
        User user = userRepository.findByPhoneNumberWithLock(request.getPhoneNumber())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with phone number: " + request.getPhoneNumber()));

        if (user.getCoins() < cost) {
            throw new InsufficientCoinsException(
                    "Insufficient coins to complete transaction. Required: " + cost
                            + ", available balance: " + user.getCoins());
        }

        user.setCoins(user.getCoins() - cost);
        userRepository.save(user);

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        Transaction transaction = Transaction.builder()
                .user(user)
                .service(service)
                .date(date)
                .isValid(true)
                .isConsumed(false)
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
        Integer newUserId;
        if (request.getUserId() != null) {
            newUserId = request.getUserId();
        } else if (request.getPhoneNumber() != null) {
            User resolved = userRepository.findByPhoneNumber(request.getPhoneNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with phone number: " + request.getPhoneNumber()));
            newUserId = resolved.getId();
        } else {
            newUserId = oldUserId;
        }

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
        if (request.getDate() != null) {
            transaction.setDate(request.getDate());
        }

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
        Integer providerId = null;
        String providerName = null;
        String serviceName = null;
        Integer coinCost = null;

        if (transaction.getService() != null) {
            serviceName = transaction.getService().getName();
            coinCost = transaction.getService().getCoinCost();
            if (transaction.getService().getProvider() != null) {
                providerId = transaction.getService().getProvider().getId();
                providerName = transaction.getService().getProvider().getName();
            }
        }

        return TransactionResponseDto.builder()
                .id(transaction.getId())
                .userId(transaction.getUser() != null ? transaction.getUser().getId() : null)
                .serviceId(transaction.getService() != null ? transaction.getService().getId() : null)
                .providerId(providerId)
                .providerName(providerName)
                .serviceName(serviceName)
                .coinCost(coinCost)
                .isValid(transaction.getIsValid() != null ? transaction.getIsValid() : true)
                .isConsumed(transaction.getIsConsumed() != null ? transaction.getIsConsumed() : false)
                .date(transaction.getDate())
                .build();
    }
}
