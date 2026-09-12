package com.example.backend.services;

import com.example.backend.dtos.TransactionByPhoneRequestDto;
import com.example.backend.dtos.TransactionRequestDto;
import com.example.backend.dtos.TransactionResponseDto;
import com.example.backend.exceptions.InsufficientCoinsException;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.Company;
import com.example.backend.models.Service;
import com.example.backend.models.Transaction;
import com.example.backend.models.User;
import com.example.backend.repositories.ServiceRepository;
import com.example.backend.repositories.TransactionRepository;
import com.example.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User user1;
    private User user2;
    private Company company;
    private Service serviceCoffee;
    private Service serviceLunch;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id(1)
                .name("Jan")
                .surname("Kowalski")
                .phoneNumber(123456789)
                .coins(100)
                .build();

        user2 = User.builder()
                .id(2)
                .name("Anna")
                .surname("Nowak")
                .phoneNumber(987654321)
                .coins(50)
                .build();

        company = Company.builder()
                .id(1)
                .name("Coffee House")
                .build();

        serviceCoffee = Service.builder()
                .id(1)
                .name("Kawa")
                .coinCost(15)
                .provider(company)
                .build();

        serviceLunch = Service.builder()
                .id(2)
                .name("Obiad")
                .coinCost(40)
                .provider(company)
                .build();

        transaction = Transaction.builder()
                .id(10)
                .user(user1)
                .service(serviceCoffee)
                .date(LocalDate.of(2026, 9, 12))
                .isValid(true)
                .isConsumed(false)
                .build();
    }

    @Nested
    @DisplayName("Query Operations")
    class QueryOperations {

        @Test
        @DisplayName("getAllTransactions returns mapped DTO list with provider info")
        void getAllTransactions_returnsList() {
            when(transactionRepository.findAll()).thenReturn(List.of(transaction));

            List<TransactionResponseDto> result = transactionService.getAllTransactions();

            assertEquals(1, result.size());
            assertEquals(10, result.get(0).getId());
            assertEquals(1, result.get(0).getUserId());
            assertEquals(1, result.get(0).getServiceId());
            assertEquals(1, result.get(0).getProviderId());
            assertEquals("Coffee House", result.get(0).getProviderName());
            assertEquals("Kawa", result.get(0).getServiceName());
            assertEquals(15, result.get(0).getCoinCost());
            assertTrue(result.get(0).getIsValid());
            assertFalse(result.get(0).getIsConsumed());
        }

        @Test
        @DisplayName("getTransactionById returns DTO when found")
        void getTransactionById_found() {
            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));

            TransactionResponseDto result = transactionService.getTransactionById(10);

            assertNotNull(result);
            assertEquals(10, result.getId());
            assertEquals(1, result.getUserId());
            assertEquals(1, result.getServiceId());
        }

        @Test
        @DisplayName("getTransactionById throws ResourceNotFoundException when not found")
        void getTransactionById_notFound() {
            when(transactionRepository.findById(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> transactionService.getTransactionById(99));
        }

        @Test
        @DisplayName("getTransactionsByUserId returns list for user")
        void getTransactionsByUserId() {
            when(transactionRepository.findByUserId(1)).thenReturn(List.of(transaction));

            List<TransactionResponseDto> result = transactionService.getTransactionsByUserId(1);

            assertEquals(1, result.size());
            assertEquals(1, result.get(0).getUserId());
        }

        @Test
        @DisplayName("getTransactionsByServiceId returns list for service")
        void getTransactionsByServiceId() {
            when(transactionRepository.findByServiceId(1)).thenReturn(List.of(transaction));

            List<TransactionResponseDto> result = transactionService.getTransactionsByServiceId(1);

            assertEquals(1, result.size());
            assertEquals(1, result.get(0).getServiceId());
        }

        @Test
        @DisplayName("getTransactionsByProviderId returns list for service provider company")
        void getTransactionsByProviderId() {
            when(transactionRepository.findByService_Provider_Id(1)).thenReturn(List.of(transaction));

            List<TransactionResponseDto> result = transactionService.getTransactionsByProviderId(1);

            assertEquals(1, result.size());
            assertEquals(1, result.get(0).getProviderId());
            assertEquals("Coffee House", result.get(0).getProviderName());
        }

        @Test
        @DisplayName("getTransactionsByProviderId with isValid filter returns only valid transactions")
        void getTransactionsByProviderId_withIsValidFilter() {
            when(transactionRepository.findByService_Provider_IdAndIsValid(1, true)).thenReturn(List.of(transaction));

            List<TransactionResponseDto> result = transactionService.getTransactionsByProviderId(1, true, null);

            assertEquals(1, result.size());
            assertTrue(result.get(0).getIsValid());
            verify(transactionRepository, times(1)).findByService_Provider_IdAndIsValid(1, true);
        }

        @Test
        @DisplayName("getTransactionsByUserIdAndProviderId returns list for user and provider")
        void getTransactionsByUserIdAndProviderId() {
            when(transactionRepository.findByUserIdAndService_Provider_Id(1, 1)).thenReturn(List.of(transaction));

            List<TransactionResponseDto> result = transactionService.getTransactionsByUserIdAndProviderId(1, 1);

            assertEquals(1, result.size());
            assertEquals(1, result.get(0).getUserId());
            assertEquals(1, result.get(0).getProviderId());
        }

        @Test
        @DisplayName("getTransactionsByUserPhoneAndProviderId resolves user by phone and returns list")
        void getTransactionsByUserPhoneAndProviderId() {
            when(userRepository.findByPhoneNumber(123456789)).thenReturn(Optional.of(user1));
            when(transactionRepository.findByUserIdAndService_Provider_Id(1, 1)).thenReturn(List.of(transaction));

            List<TransactionResponseDto> result = transactionService.getTransactionsByUserPhoneAndProviderId(123456789, 1);

            assertEquals(1, result.size());
            assertEquals(1, result.get(0).getUserId());
            assertEquals(1, result.get(0).getProviderId());
        }
    }

    @Nested
    @DisplayName("Consume Transaction")
    class ConsumeTransactionTests {

        @Test
        @DisplayName("consumeTransaction successfully marks transaction as consumed and invalidates it")
        void consumeTransaction_success() {
            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

            TransactionResponseDto response = transactionService.consumeTransaction(10, 1);

            assertNotNull(response);
            assertFalse(response.getIsValid());
            assertTrue(response.getIsConsumed());
            assertFalse(transaction.getIsValid());
            assertTrue(transaction.getIsConsumed());
            verify(transactionRepository, times(1)).save(transaction);
        }

        @Test
        @DisplayName("consumeTransaction throws IllegalStateException if already consumed")
        void consumeTransaction_alreadyConsumed_throwsException() {
            transaction.setIsValid(false);
            transaction.setIsConsumed(true);

            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));

            IllegalStateException ex = assertThrows(IllegalStateException.class,
                    () -> transactionService.consumeTransaction(10, 1));

            assertTrue(ex.getMessage().contains("already been consumed"));
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("consumeTransaction throws IllegalArgumentException if provider does not match")
        void consumeTransaction_wrongProvider_throwsException() {
            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> transactionService.consumeTransaction(10, 999));

            assertTrue(ex.getMessage().contains("does not belong to provider"));
            verify(transactionRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Coin Change Validity: Creation")
    class CreationCoinValidity {

        @Test
        @DisplayName("createTransaction deducts service coin cost when user has sufficient coins")
        void createTransaction_sufficientCoins_deductsBalance() {
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
                Transaction t = invocation.getArgument(0);
                t.setId(20);
                return t;
            });

            TransactionResponseDto result = transactionService.createTransaction(request);

            assertNotNull(result);
            assertEquals(85, user1.getCoins());
            assertTrue(result.getIsValid());
            assertFalse(result.getIsConsumed());
            verify(userRepository, times(1)).save(user1);
            verify(transactionRepository, times(1)).save(any(Transaction.class));
        }

        @Test
        @DisplayName("createTransaction succeeds with phoneNumber instead of userId")
        void createTransaction_withPhoneNumber_deductsBalance() {
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .phoneNumber(123456789)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByPhoneNumberWithLock(123456789)).thenReturn(Optional.of(user1));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
                Transaction t = invocation.getArgument(0);
                t.setId(22);
                return t;
            });

            TransactionResponseDto result = transactionService.createTransaction(request);

            assertNotNull(result);
            assertEquals(85, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
            verify(transactionRepository, times(1)).save(any(Transaction.class));
        }

        @Test
        @DisplayName("createTransactionByPhone deducts coins and creates transaction")
        void createTransactionByPhone_success() {
            TransactionByPhoneRequestDto request = TransactionByPhoneRequestDto.builder()
                    .phoneNumber(123456789)
                    .serviceId(1)
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByPhoneNumberWithLock(123456789)).thenReturn(Optional.of(user1));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
                Transaction t = invocation.getArgument(0);
                t.setId(25);
                return t;
            });

            TransactionResponseDto result = transactionService.createTransactionByPhone(request);

            assertNotNull(result);
            assertEquals(25, result.getId());
            assertEquals(1, result.getUserId());
            assertEquals(85, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
            verify(transactionRepository, times(1)).save(any(Transaction.class));
        }

        @Test
        @DisplayName("createTransactionByPhone throws ResourceNotFoundException when user phone not found")
        void createTransactionByPhone_userNotFound() {
            TransactionByPhoneRequestDto request = TransactionByPhoneRequestDto.builder()
                    .phoneNumber(999999999)
                    .serviceId(1)
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByPhoneNumberWithLock(999999999)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> transactionService.createTransactionByPhone(request));
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("createTransactionByPhone throws InsufficientCoinsException when user lacks coins")
        void createTransactionByPhone_insufficientCoins() {
            user1.setCoins(5);
            TransactionByPhoneRequestDto request = TransactionByPhoneRequestDto.builder()
                    .phoneNumber(123456789)
                    .serviceId(1)
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByPhoneNumberWithLock(123456789)).thenReturn(Optional.of(user1));

            InsufficientCoinsException ex = assertThrows(InsufficientCoinsException.class,
                    () -> transactionService.createTransactionByPhone(request));

            assertTrue(ex.getMessage().contains("Insufficient coins"));
            assertEquals(5, user1.getCoins());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("createTransaction succeeds when user has exact balance equal to service cost")
        void createTransaction_exactBalance_deductsToZero() {
            user1.setCoins(15);
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
                Transaction t = invocation.getArgument(0);
                t.setId(21);
                return t;
            });

            TransactionResponseDto result = transactionService.createTransaction(request);

            assertNotNull(result);
            assertEquals(0, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
        }

        @Test
        @DisplayName("createTransaction throws InsufficientCoinsException when user balance is lower than cost")
        void createTransaction_insufficientCoins_throwsException() {
            user1.setCoins(10);
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            InsufficientCoinsException ex = assertThrows(InsufficientCoinsException.class,
                    () -> transactionService.createTransaction(request));

            assertTrue(ex.getMessage().contains("Insufficient coins"));
            assertEquals(10, user1.getCoins());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("createTransaction with zero cost service does not reduce balance")
        void createTransaction_zeroCostService_succeeds() {
            Service freeService = Service.builder().id(3).name("Free").coinCost(0).build();
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(3)
                    .date(LocalDate.now())
                    .build();

            when(serviceRepository.findById(3)).thenReturn(Optional.of(freeService));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

            transactionService.createTransaction(request);

            assertEquals(100, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
        }

        @Test
        @DisplayName("createTransaction throws ResourceNotFoundException when user not found")
        void createTransaction_userNotFound() {
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(99)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByIdWithLock(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> transactionService.createTransaction(request));
        }

        @Test
        @DisplayName("createTransaction throws ResourceNotFoundException when service not found")
        void createTransaction_serviceNotFound() {
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(99)
                    .date(LocalDate.now())
                    .build();

            when(serviceRepository.findById(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> transactionService.createTransaction(request));
        }
    }

    @Nested
    @DisplayName("Coin Change Validity: Update")
    class UpdateCoinValidity {

        @Test
        @DisplayName("updateTransaction: switching to more expensive service deducts additional cost")
        void updateTransaction_sameUser_costIncreases_sufficientBalance() {
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(2)
                    .date(LocalDate.now())
                    .build();

            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(serviceRepository.findById(2)).thenReturn(Optional.of(serviceLunch));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

            TransactionResponseDto result = transactionService.updateTransaction(10, request);

            assertEquals(75, user1.getCoins());
            assertEquals(2, result.getServiceId());
            verify(userRepository, times(1)).save(user1);
        }

        @Test
        @DisplayName("updateTransaction: switching to more expensive service with insufficient coins throws InsufficientCoinsException")
        void updateTransaction_sameUser_costIncreases_insufficientBalance_throwsException() {
            user1.setCoins(20);
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(2)
                    .date(LocalDate.now())
                    .build();

            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(serviceRepository.findById(2)).thenReturn(Optional.of(serviceLunch));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            InsufficientCoinsException ex = assertThrows(InsufficientCoinsException.class,
                    () -> transactionService.updateTransaction(10, request));

            assertTrue(ex.getMessage().contains("Insufficient coins to update transaction"));
            assertEquals(20, user1.getCoins());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("updateTransaction: switching to cheaper service refunds the difference")
        void updateTransaction_sameUser_costDecreases_refundsDifference() {
            transaction.setService(serviceLunch);
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(1)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

            transactionService.updateTransaction(10, request);

            assertEquals(125, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
        }

        @Test
        @DisplayName("updateTransaction: changing user refunds previous user and deducts from new user")
        void updateTransaction_differentUser_transfersSafely() {
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(2)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(userRepository.findByIdWithLock(2)).thenReturn(Optional.of(user2));
            when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));

            TransactionResponseDto result = transactionService.updateTransaction(10, request);

            assertEquals(115, user1.getCoins());
            assertEquals(35, user2.getCoins());
            assertEquals(2, result.getUserId());
            verify(userRepository, times(1)).save(user1);
            verify(userRepository, times(1)).save(user2);
        }

        @Test
        @DisplayName("updateTransaction: changing user when new user has insufficient coins throws InsufficientCoinsException")
        void updateTransaction_differentUser_insufficientNewUser_throwsException() {
            user2.setCoins(10);
            TransactionRequestDto request = TransactionRequestDto.builder()
                    .userId(2)
                    .serviceId(1)
                    .date(LocalDate.now())
                    .build();

            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(serviceRepository.findById(1)).thenReturn(Optional.of(serviceCoffee));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(userRepository.findByIdWithLock(2)).thenReturn(Optional.of(user2));

            InsufficientCoinsException ex = assertThrows(InsufficientCoinsException.class,
                    () -> transactionService.updateTransaction(10, request));

            assertTrue(ex.getMessage().contains("Insufficient coins for new transaction user"));
            verify(transactionRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Coin Change Validity: Deletion")
    class DeletionCoinValidity {

        @Test
        @DisplayName("deleteTransaction: refunds service cost to user balance upon deletion")
        void deleteTransaction_refundsCoinsToUser() {
            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            transactionService.deleteTransaction(10);

            assertEquals(115, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
            verify(transactionRepository, times(1)).delete(transaction);
        }

        @Test
        @DisplayName("deleteTransaction: service with zero cost leaves user balance unchanged")
        void deleteTransaction_zeroCostService_refundsZero() {
            Service freeService = Service.builder().id(4).name("Free").coinCost(0).build();
            transaction.setService(freeService);

            when(transactionRepository.findById(10)).thenReturn(Optional.of(transaction));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            transactionService.deleteTransaction(10);

            assertEquals(100, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
            verify(transactionRepository, times(1)).delete(transaction);
        }

        @Test
        @DisplayName("deleteTransaction: throws ResourceNotFoundException when transaction does not exist")
        void deleteTransaction_notFound() {
            when(transactionRepository.findById(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> transactionService.deleteTransaction(99));
            verify(userRepository, never()).findByIdWithLock(any());
        }
    }
}
