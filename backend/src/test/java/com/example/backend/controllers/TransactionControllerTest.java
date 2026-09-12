package com.example.backend.controllers;

import com.example.backend.dtos.ConsumeTransactionRequestDto;
import com.example.backend.dtos.TransactionByPhoneRequestDto;
import com.example.backend.dtos.TransactionRequestDto;
import com.example.backend.dtos.TransactionResponseDto;
import com.example.backend.services.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(transactionController).build();
    }

    @Test
    @DisplayName("GET /api/transactions/provider/{providerId} returns transactions for service provider")
    void getTransactionsByProvider_returnsList() throws Exception {
        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .providerId(2)
                .providerName("Coffee House")
                .serviceName("Espresso")
                .coinCost(15)
                .isValid(true)
                .isConsumed(false)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.getTransactionsByProviderId(2, null, null)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/transactions/provider/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].providerId").value(2))
                .andExpect(jsonPath("$[0].providerName").value("Coffee House"))
                .andExpect(jsonPath("$[0].isValid").value(true))
                .andExpect(jsonPath("$[0].isConsumed").value(false));
    }

    @Test
    @DisplayName("GET /api/transactions/provider/{providerId}?isValid=true filters valid transactions")
    void getTransactionsByProvider_withFilter_returnsList() throws Exception {
        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .providerId(2)
                .isValid(true)
                .isConsumed(false)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.getTransactionsByProviderId(2, true, null)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/transactions/provider/2?isValid=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].isValid").value(true));
    }

    @Test
    @DisplayName("POST /api/transactions/{id}/consume marks transaction as consumed")
    void consumeTransactionById_returnsOk() throws Exception {
        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .providerId(2)
                .isValid(false)
                .isConsumed(true)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.consumeTransaction(10, 2)).thenReturn(response);

        mockMvc.perform(post("/api/transactions/10/consume?providerId=2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.isValid").value(false))
                .andExpect(jsonPath("$.isConsumed").value(true));
    }

    @Test
    @DisplayName("POST /api/transactions/consume via payload marks transaction as consumed")
    void consumeTransaction_viaPayload_returnsOk() throws Exception {
        ConsumeTransactionRequestDto request = ConsumeTransactionRequestDto.builder()
                .transactionId(10)
                .providerId(2)
                .build();

        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .providerId(2)
                .isValid(false)
                .isConsumed(true)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.consumeTransaction(10, 2)).thenReturn(response);

        mockMvc.perform(post("/api/transactions/consume")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.isValid").value(false))
                .andExpect(jsonPath("$.isConsumed").value(true));
    }

    @Test
    @DisplayName("GET /api/transactions/provider/{providerId}?userId=1 returns transactions for specific user and provider")
    void getTransactionsByProviderAndUser_returnsList() throws Exception {
        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .providerId(2)
                .providerName("Coffee House")
                .serviceName("Espresso")
                .coinCost(15)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.getTransactionsByUserIdAndProviderId(1, 2, null, null)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/transactions/provider/2?userId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].userId").value(1))
                .andExpect(jsonPath("$[0].providerId").value(2));
    }

    @Test
    @DisplayName("GET /api/transactions/provider/{providerId}?phoneNumber=123456789 returns user transactions by phone")
    void getTransactionsByProviderAndPhone_returnsList() throws Exception {
        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .providerId(2)
                .providerName("Coffee House")
                .serviceName("Espresso")
                .coinCost(15)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.getTransactionsByUserPhoneAndProviderId(123456789, 2, null, null)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/transactions/provider/2?phoneNumber=123456789"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].userId").value(1))
                .andExpect(jsonPath("$[0].providerId").value(2));
    }

    @Test
    @DisplayName("GET /api/transactions/user/{userId}/provider/{providerId} returns user transactions for provider")
    void getUserTransactionsByProvider_returnsList() throws Exception {
        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .providerId(2)
                .providerName("Coffee House")
                .serviceName("Espresso")
                .coinCost(15)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.getTransactionsByUserIdAndProviderId(1, 2, null, null)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/transactions/user/1/provider/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].userId").value(1))
                .andExpect(jsonPath("$[0].providerId").value(2));
    }

    @Test
    @DisplayName("POST /api/transactions/by-phone creates transaction with user phone number")
    void createTransactionByPhone_success() throws Exception {
        TransactionByPhoneRequestDto request = TransactionByPhoneRequestDto.builder()
                .phoneNumber(123456789)
                .serviceId(1)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(10)
                .userId(1)
                .serviceId(1)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.createTransactionByPhone(any(TransactionByPhoneRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/transactions/by-phone")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.serviceId").value(1));
    }

    @Test
    @DisplayName("POST /api/transactions creates transaction with phoneNumber payload")
    void createTransaction_withPhoneInStandardEndpoint_success() throws Exception {
        TransactionRequestDto request = TransactionRequestDto.builder()
                .phoneNumber(123456789)
                .serviceId(1)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        TransactionResponseDto response = TransactionResponseDto.builder()
                .id(11)
                .userId(1)
                .serviceId(1)
                .date(LocalDate.of(2026, 9, 12))
                .build();

        when(transactionService.createTransaction(any(TransactionRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(11))
                .andExpect(jsonPath("$.userId").value(1));
    }
}
