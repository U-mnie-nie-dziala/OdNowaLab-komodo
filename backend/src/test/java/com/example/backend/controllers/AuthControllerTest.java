package com.example.backend.controllers;

import com.example.backend.dtos.UserResponseDto;
import com.example.backend.dtos.auth.AuthResponseDto;
import com.example.backend.dtos.auth.ChangePasswordRequestDto;
import com.example.backend.dtos.auth.ConfirmForgotPasswordRequestDto;
import com.example.backend.dtos.auth.ConfirmPhoneRequestDto;
import com.example.backend.dtos.auth.ConfirmSignUpRequestDto;
import com.example.backend.dtos.auth.ForgotPasswordRequestDto;
import com.example.backend.dtos.auth.LoginRequestDto;
import com.example.backend.dtos.auth.MessageResponseDto;
import com.example.backend.dtos.auth.PhoneVerificationRequestDto;
import com.example.backend.dtos.auth.RefreshTokenRequestDto;
import com.example.backend.dtos.auth.RegisterRequestDto;
import com.example.backend.dtos.auth.RegisterResponseDto;
import com.example.backend.dtos.auth.ResendCodeRequestDto;
import com.example.backend.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("POST /api/auth/register returns 201 Created")
    void register_returnsCreated() throws Exception {
        RegisterRequestDto request = RegisterRequestDto.builder()
                .email("test@example.com")
                .password("Password123")
                .name("Jan")
                .surname("Kowalski")
                .phoneNumber(123456789)
                .build();

        RegisterResponseDto response = RegisterResponseDto.builder()
                .message("User registered successfully.")
                .userSub("sub-123")
                .email("test@example.com")
                .isConfirmed(false)
                .build();

        when(authService.register(any(RegisterRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.userSub").value("sub-123"));
    }

    @Test
    @DisplayName("POST /api/auth/login returns 200 OK with tokens")
    void login_returnsOk() throws Exception {
        LoginRequestDto request = LoginRequestDto.builder()
                .email("test@example.com")
                .password("Password123")
                .build();

        AuthResponseDto response = AuthResponseDto.builder()
                .accessToken("acc-token")
                .idToken("id-token")
                .refreshToken("ref-token")
                .expiresIn(3600)
                .tokenType("Bearer")
                .build();

        when(authService.login(any(LoginRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("acc-token"))
                .andExpect(jsonPath("$.idToken").value("id-token"));
    }

    @Test
    @DisplayName("POST /api/auth/confirm returns 200 OK")
    void confirmSignUp_returnsOk() throws Exception {
        ConfirmSignUpRequestDto request = ConfirmSignUpRequestDto.builder()
                .email("test@example.com")
                .confirmationCode("123456")
                .build();

        when(authService.confirmSignUp(any(ConfirmSignUpRequestDto.class)))
                .thenReturn(MessageResponseDto.builder().message("Confirmed").success(true).build());

        mockMvc.perform(post("/api/auth/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Confirmed"));
    }

    @Test
    @DisplayName("POST /api/auth/resend-code returns 200 OK")
    void resendCode_returnsOk() throws Exception {
        ResendCodeRequestDto request = ResendCodeRequestDto.builder()
                .email("test@example.com")
                .build();

        when(authService.resendConfirmationCode("test@example.com"))
                .thenReturn(MessageResponseDto.builder().message("Resent").success(true).build());

        mockMvc.perform(post("/api/auth/resend-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Resent"));
    }

    @Test
    @DisplayName("POST /api/auth/refresh returns 200 OK")
    void refresh_returnsOk() throws Exception {
        RefreshTokenRequestDto request = RefreshTokenRequestDto.builder()
                .refreshToken("ref-token")
                .build();

        AuthResponseDto response = AuthResponseDto.builder()
                .accessToken("new-acc-token")
                .expiresIn(3600)
                .build();

        when(authService.refreshToken(any(RefreshTokenRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-acc-token"));
    }

    @Test
    @DisplayName("POST /api/auth/phone/send-code returns 200 OK")
    void sendPhoneVerificationCode_returnsOk() throws Exception {
        PhoneVerificationRequestDto request = PhoneVerificationRequestDto.builder()
                .phoneNumber(123456789)
                .build();

        when(authService.requestPhoneVerification(any(PhoneVerificationRequestDto.class), any()))
                .thenReturn(MessageResponseDto.builder().message("SMS sent").success(true).build());

        mockMvc.perform(post("/api/auth/phone/send-code")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("SMS sent"));
    }

    @Test
    @DisplayName("POST /api/auth/phone/verify returns 200 OK")
    void verifyPhone_returnsOk() throws Exception {
        ConfirmPhoneRequestDto request = ConfirmPhoneRequestDto.builder()
                .code("123456")
                .phoneNumber(123456789)
                .build();

        when(authService.verifyPhone(any(ConfirmPhoneRequestDto.class), any()))
                .thenReturn(MessageResponseDto.builder().message("Phone verified").success(true).build());

        mockMvc.perform(post("/api/auth/phone/verify")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Phone verified"));
    }

    @Test
    @DisplayName("POST /api/auth/phone/resend-code returns 200 OK")
    void resendPhoneCode_returnsOk() throws Exception {
        when(authService.resendPhoneVerificationCode(any(), any()))
                .thenReturn(MessageResponseDto.builder().message("Code resent").success(true).build());

        mockMvc.perform(post("/api/auth/phone/resend-code")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Code resent"));
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password returns 200 OK")
    void forgotPassword_returnsOk() throws Exception {
        ForgotPasswordRequestDto request = ForgotPasswordRequestDto.builder()
                .email("test@example.com")
                .build();

        when(authService.forgotPassword(any(ForgotPasswordRequestDto.class)))
                .thenReturn(MessageResponseDto.builder().message("Code sent").success(true).build());

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Code sent"));
    }

    @Test
    @DisplayName("POST /api/auth/confirm-forgot-password returns 200 OK")
    void confirmForgotPassword_returnsOk() throws Exception {
        ConfirmForgotPasswordRequestDto request = ConfirmForgotPasswordRequestDto.builder()
                .email("test@example.com")
                .confirmationCode("123456")
                .newPassword("NewPassword123")
                .build();

        when(authService.confirmForgotPassword(any(ConfirmForgotPasswordRequestDto.class)))
                .thenReturn(MessageResponseDto.builder().message("Password reset").success(true).build());

        mockMvc.perform(post("/api/auth/confirm-forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset"));
    }

    @Test
    @DisplayName("POST /api/auth/change-password returns 200 OK")
    void changePassword_returnsOk() throws Exception {
        ChangePasswordRequestDto request = ChangePasswordRequestDto.builder()
                .accessToken("mock-token")
                .previousPassword("OldPassword123")
                .proposedPassword("NewPassword123")
                .build();

        when(authService.changePassword(any(ChangePasswordRequestDto.class), any()))
                .thenReturn(MessageResponseDto.builder().message("Changed").success(true).build());

        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Changed"));
    }

    @Test
    @DisplayName("GET /api/auth/me returns 200 OK with profile")
    void getCurrentUser_returnsOk() throws Exception {
        UserResponseDto userDto = UserResponseDto.builder()
                .id(1)
                .email("test@example.com")
                .name("Jan")
                .surname("Kowalski")
                .coins(100)
                .build();

        when(authService.getCurrentUser("Bearer valid-token")).thenReturn(userDto);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Jan"));
    }

    @Test
    @DisplayName("POST /api/auth/logout returns 200 OK")
    void logout_returnsOk() throws Exception {
        when(authService.logout("Bearer valid-token"))
                .thenReturn(MessageResponseDto.builder().message("Logged out").success(true).build());

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out"));
    }
}
