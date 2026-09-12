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
class CoinAdditionServiceTest {

    @Mock
    private CoinAdditionRepository coinAdditionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private CoinAdditionService coinAdditionService;

    private User user1;
    private User user2;
    private Company company;
    private CoinAddition coinAddition;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
                .id(1)
                .name("Jan")
                .surname("Kowalski")
                .coins(100)
                .build();

        user2 = User.builder()
                .id(2)
                .name("Anna")
                .surname("Nowak")
                .coins(50)
                .build();

        company = Company.builder()
                .id(1)
                .name("EkoPiekarnia")
                .build();

        coinAddition = CoinAddition.builder()
                .id(10)
                .user(user1)
                .company(company)
                .coinAmount(30)
                .date(LocalDate.of(2026, 9, 12))
                .build();
    }

    @Nested
    @DisplayName("Query Operations")
    class QueryOperations {

        @Test
        @DisplayName("getAllCoinAdditions returns mapped DTO list")
        void getAllCoinAdditions_returnsList() {
            when(coinAdditionRepository.findAll()).thenReturn(List.of(coinAddition));

            List<CoinAdditionResponseDto> result = coinAdditionService.getAllCoinAdditions();

            assertEquals(1, result.size());
            assertEquals(10, result.get(0).getId());
            assertEquals(30, result.get(0).getCoinAmount());
        }

        @Test
        @DisplayName("getCoinAdditionById returns DTO when found")
        void getCoinAdditionById_found() {
            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));

            CoinAdditionResponseDto result = coinAdditionService.getCoinAdditionById(10);

            assertNotNull(result);
            assertEquals(10, result.getId());
            assertEquals(1, result.getUserId());
            assertEquals(1, result.getCompanyId());
            assertEquals(30, result.getCoinAmount());
        }

        @Test
        @DisplayName("getCoinAdditionById throws ResourceNotFoundException when not found")
        void getCoinAdditionById_notFound() {
            when(coinAdditionRepository.findById(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> coinAdditionService.getCoinAdditionById(99));
        }

        @Test
        @DisplayName("getCoinAdditionsByUserId returns list for user")
        void getCoinAdditionsByUserId() {
            when(coinAdditionRepository.findByUserId(1)).thenReturn(List.of(coinAddition));

            List<CoinAdditionResponseDto> result = coinAdditionService.getCoinAdditionsByUserId(1);

            assertEquals(1, result.size());
            assertEquals(1, result.get(0).getUserId());
        }

        @Test
        @DisplayName("getCoinAdditionsByCompanyId returns list for company")
        void getCoinAdditionsByCompanyId() {
            when(coinAdditionRepository.findByCompanyId(1)).thenReturn(List.of(coinAddition));

            List<CoinAdditionResponseDto> result = coinAdditionService.getCoinAdditionsByCompanyId(1);

            assertEquals(1, result.size());
            assertEquals(1, result.get(0).getCompanyId());
        }
    }

    @Nested
    @DisplayName("Coin Change Validity: Creation")
    class CreationCoinValidity {

        @Test
        @DisplayName("createCoinAddition safely increments user balance by coinAmount")
        void createCoinAddition_incrementsUserCoins() {
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(50)
                    .date(LocalDate.now())
                    .build();

            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(coinAdditionRepository.save(any(CoinAddition.class))).thenAnswer(invocation -> {
                CoinAddition ca = invocation.getArgument(0);
                ca.setId(11);
                return ca;
            });

            int initialCoins = user1.getCoins(); // 100
            CoinAdditionResponseDto result = coinAdditionService.createCoinAddition(request);

            assertNotNull(result);
            assertEquals(initialCoins + 50, user1.getCoins()); // 150
            assertEquals(150, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
            verify(coinAdditionRepository, times(1)).save(any(CoinAddition.class));
        }

        @Test
        @DisplayName("createCoinAddition throws IllegalArgumentException when coinAmount is negative")
        void createCoinAddition_negativeAmount_throwsException() {
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(-10)
                    .date(LocalDate.now())
                    .build();

            assertThrows(IllegalArgumentException.class, () -> coinAdditionService.createCoinAddition(request));
            verify(userRepository, never()).findByIdWithLock(any());
            verify(coinAdditionRepository, never()).save(any());
        }

        @Test
        @DisplayName("createCoinAddition throws IllegalArgumentException when coinAmount is zero")
        void createCoinAddition_zeroAmount_throwsException() {
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(0)
                    .date(LocalDate.now())
                    .build();

            assertThrows(IllegalArgumentException.class, () -> coinAdditionService.createCoinAddition(request));
        }

        @Test
        @DisplayName("createCoinAddition throws ResourceNotFoundException when user does not exist")
        void createCoinAddition_userNotFound() {
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(99)
                    .companyId(1)
                    .coinAmount(20)
                    .date(LocalDate.now())
                    .build();

            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> coinAdditionService.createCoinAddition(request));
        }

        @Test
        @DisplayName("createCoinAddition throws ResourceNotFoundException when company does not exist")
        void createCoinAddition_companyNotFound() {
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(99)
                    .coinAmount(20)
                    .date(LocalDate.now())
                    .build();

            when(companyRepository.findById(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> coinAdditionService.createCoinAddition(request));
        }
    }

    @Nested
    @DisplayName("Coin Change Validity: Update")
    class UpdateCoinValidity {

        @Test
        @DisplayName("updateCoinAddition: increasing amount for same user adds delta to balance")
        void updateCoinAddition_sameUser_increaseAmount() {
            // Original: 30 coins. New: 50 coins. Delta: +20. User balance: 100 -> 120.
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(50)
                    .date(LocalDate.now())
                    .build();

            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(coinAdditionRepository.save(any(CoinAddition.class))).thenAnswer(i -> i.getArgument(0));

            CoinAdditionResponseDto result = coinAdditionService.updateCoinAddition(10, request);

            assertEquals(50, result.getCoinAmount());
            assertEquals(120, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
        }

        @Test
        @DisplayName("updateCoinAddition: decreasing amount for same user subtracts delta safely")
        void updateCoinAddition_sameUser_decreaseAmount_withinBalance() {
            // Original: 30 coins. New: 10 coins. Delta: -20. User balance: 100 -> 80.
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(10)
                    .date(LocalDate.now())
                    .build();

            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(coinAdditionRepository.save(any(CoinAddition.class))).thenAnswer(i -> i.getArgument(0));

            CoinAdditionResponseDto result = coinAdditionService.updateCoinAddition(10, request);

            assertEquals(10, result.getCoinAmount());
            assertEquals(80, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
        }

        @Test
        @DisplayName("updateCoinAddition: decreasing amount when reduction exceeds user balance throws InsufficientCoinsException")
        void updateCoinAddition_sameUser_decreaseAmount_exceedsBalance_throwsException() {
            // Original: 30 coins. New: 5 coins. Delta: -25.
            // But user currently only has 10 coins!
            user1.setCoins(10);

            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(5)
                    .date(LocalDate.now())
                    .build();

            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            InsufficientCoinsException ex = assertThrows(InsufficientCoinsException.class,
                    () -> coinAdditionService.updateCoinAddition(10, request));

            assertTrue(ex.getMessage().contains("user balance would become negative"));
            assertEquals(10, user1.getCoins()); // Unchanged
            verify(coinAdditionRepository, never()).save(any());
        }

        @Test
        @DisplayName("updateCoinAddition: decreasing amount resulting in exact zero balance succeeds")
        void updateCoinAddition_sameUser_exactZeroResult_succeeds() {
            // Original: 30 coins. New: 10 coins. Delta: -20. User balance: 20 -> 0.
            user1.setCoins(20);

            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(10)
                    .date(LocalDate.now())
                    .build();

            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(coinAdditionRepository.save(any(CoinAddition.class))).thenAnswer(i -> i.getArgument(0));

            CoinAdditionResponseDto result = coinAdditionService.updateCoinAddition(10, request);

            assertEquals(0, user1.getCoins());
            assertEquals(10, result.getCoinAmount());
        }

        @Test
        @DisplayName("updateCoinAddition: changing user safely reverts old user coins and credits new user")
        void updateCoinAddition_differentUser_bothValid_transfersSafely() {
            // Original user1 (100 coins) received 30 coins.
            // Transfer to user2 (50 coins) with new amount 40 coins.
            // Expect user1: 100 - 30 = 70.
            // Expect user2: 50 + 40 = 90.
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(2)
                    .companyId(1)
                    .coinAmount(40)
                    .date(LocalDate.now())
                    .build();

            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(userRepository.findByIdWithLock(2)).thenReturn(Optional.of(user2));
            when(coinAdditionRepository.save(any(CoinAddition.class))).thenAnswer(i -> i.getArgument(0));

            CoinAdditionResponseDto result = coinAdditionService.updateCoinAddition(10, request);

            assertEquals(70, user1.getCoins());
            assertEquals(90, user2.getCoins());
            assertEquals(2, result.getUserId());
            assertEquals(40, result.getCoinAmount());
            verify(userRepository, times(1)).save(user1);
            verify(userRepository, times(1)).save(user2);
        }

        @Test
        @DisplayName("updateCoinAddition: changing user when old user has insufficient coins throws InsufficientCoinsException")
        void updateCoinAddition_differentUser_oldUserInsufficient_throwsException() {
            // Original user1 received 30 coins, but now only has 15 coins left.
            user1.setCoins(15);

            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(2)
                    .companyId(1)
                    .coinAmount(40)
                    .date(LocalDate.now())
                    .build();

            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(companyRepository.findById(1)).thenReturn(Optional.of(company));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));
            when(userRepository.findByIdWithLock(2)).thenReturn(Optional.of(user2));

            InsufficientCoinsException ex = assertThrows(InsufficientCoinsException.class,
                    () -> coinAdditionService.updateCoinAddition(10, request));

            assertTrue(ex.getMessage().contains("previous user has insufficient coins to revert"));
            assertEquals(15, user1.getCoins());
            assertEquals(50, user2.getCoins());
            verify(coinAdditionRepository, never()).save(any());
        }

        @Test
        @DisplayName("updateCoinAddition throws IllegalArgumentException when updated amount is non-positive")
        void updateCoinAddition_invalidAmount_throwsException() {
            CoinAdditionRequestDto request = CoinAdditionRequestDto.builder()
                    .userId(1)
                    .companyId(1)
                    .coinAmount(0)
                    .date(LocalDate.now())
                    .build();

            assertThrows(IllegalArgumentException.class, () -> coinAdditionService.updateCoinAddition(10, request));
        }
    }

    @Nested
    @DisplayName("Coin Change Validity: Deletion")
    class DeletionCoinValidity {

        @Test
        @DisplayName("deleteCoinAddition: safely deducts previously added coins when balance is sufficient")
        void deleteCoinAddition_sufficientBalance_deductsCoinsAndDeletes() {
            // user1 has 100 coins, coinAddition is 30 coins.
            // After deletion: user1 has 70 coins.
            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            coinAdditionService.deleteCoinAddition(10);

            assertEquals(70, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
            verify(coinAdditionRepository, times(1)).delete(coinAddition);
        }

        @Test
        @DisplayName("deleteCoinAddition: deducts coins to exactly zero balance when coins equal amount")
        void deleteCoinAddition_exactBalance_deductsToZero() {
            // user1 has exactly 30 coins, coinAddition is 30 coins.
            user1.setCoins(30);
            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            coinAdditionService.deleteCoinAddition(10);

            assertEquals(0, user1.getCoins());
            verify(userRepository, times(1)).save(user1);
            verify(coinAdditionRepository, times(1)).delete(coinAddition);
        }

        @Test
        @DisplayName("deleteCoinAddition: throws InsufficientCoinsException when user balance is less than coinAddition amount")
        void deleteCoinAddition_insufficientBalance_throwsException() {
            // user1 only has 20 coins, but coinAddition was 30 coins.
            user1.setCoins(20);
            when(coinAdditionRepository.findById(10)).thenReturn(Optional.of(coinAddition));
            when(userRepository.findByIdWithLock(1)).thenReturn(Optional.of(user1));

            InsufficientCoinsException ex = assertThrows(InsufficientCoinsException.class,
                    () -> coinAdditionService.deleteCoinAddition(10));

            assertTrue(ex.getMessage().contains("user balance would become negative"));
            assertEquals(20, user1.getCoins()); // Balance not modified
            verify(coinAdditionRepository, never()).delete(any());
        }

        @Test
        @DisplayName("deleteCoinAddition: throws ResourceNotFoundException when coinAddition not found")
        void deleteCoinAddition_notFound() {
            when(coinAdditionRepository.findById(99)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> coinAdditionService.deleteCoinAddition(99));
            verify(userRepository, never()).findByIdWithLock(any());
        }
    }
}
