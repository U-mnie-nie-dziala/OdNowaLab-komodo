package com.example.backend.controllers;

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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
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
