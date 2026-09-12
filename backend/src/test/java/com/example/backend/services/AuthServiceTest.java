package com.example.backend.services;

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
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AuthenticationResultType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ChangePasswordResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.CodeDeliveryDetailsType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmForgotPasswordResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmSignUpResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ForgotPasswordResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserAttributeVerificationCodeResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GlobalSignOutResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.InitiateAuthResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ResendConfirmationCodeResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UpdateUserAttributesResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.VerifyUserAttributeResponse;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CognitoService cognitoService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private UserResponseDto sampleUserDto;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1)
                .email("test@example.com")
                .cognitoUsername("user-uuid-123")
                .cognitoSub("cognito-sub-123")
                .name("Jan")
                .surname("Kowalski")
                .coins(0)
                .phoneNumber(123456789)
                .isPhoneVerified(false)
                .isDeleted(false)
                .isOwner(false)
                .build();

        sampleUserDto = UserResponseDto.builder()
                .id(1)
                .email("test@example.com")
                .cognitoUsername("user-uuid-123")
                .cognitoSub("cognito-sub-123")
                .name("Jan")
                .surname("Kowalski")
                .coins(0)
                .phoneNumber(123456789)
                .isPhoneVerified(false)
                .isDeleted(false)
                .isOwner(false)
                .build();
    }

    @Test
    @DisplayName("register creates user in Cognito without phone number and local database")
    void register_success() {
        RegisterRequestDto request = RegisterRequestDto.builder()
                .email("test@example.com")
                .password("Password123")
                .name("Jan")
                .surname("Kowalski")
                .phoneNumber(123456789)
                .isOwner(false)
                .build();

        SignUpResponse signUpResponse = SignUpResponse.builder()
                .userSub("cognito-sub-123")
                .userConfirmed(false)
                .build();

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(cognitoService.signUp(anyString(), eq("test@example.com"), eq("Password123"), eq("Jan"), eq("Kowalski"), isNull()))
                .thenReturn(signUpResponse);
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(userService.mapToResponse(sampleUser)).thenReturn(sampleUserDto);

        RegisterResponseDto response = authService.register(request);

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("cognito-sub-123", response.getUserSub());
        assertFalse(response.getIsConfirmed());
        assertNotNull(response.getUser());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("register throws IllegalArgumentException when email already registered")
    void register_emailExists_throwsException() {
        RegisterRequestDto request = RegisterRequestDto.builder()
                .email("test@example.com")
                .password("Password123")
                .name("Jan")
                .surname("Kowalski")
                .phoneNumber(123456789)
                .build();

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(cognitoService, never()).signUp(anyString(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("requestPhoneVerification sends SMS and saves phone number")
    void requestPhoneVerification_success() {
        PhoneVerificationRequestDto request = PhoneVerificationRequestDto.builder()
                .phoneNumber(123456789)
                .accessToken("mock-token")
                .build();

        when(cognitoService.formatPhoneNumber(123456789)).thenReturn("+48123456789");
        when(cognitoService.updatePhoneNumber("mock-token", "+48123456789"))
                .thenReturn(UpdateUserAttributesResponse.builder()
                        .codeDeliveryDetailsList(List.of(CodeDeliveryDetailsType.builder().destination("+48123456789").build()))
                        .build());

        GetUserResponse getUserResponse = GetUserResponse.builder()
                .username("user-uuid-123")
                .userAttributes(AttributeType.builder().name("sub").value("cognito-sub-123").build())
                .build();
        when(cognitoService.getUser("mock-token")).thenReturn(getUserResponse);
        when(userRepository.findByCognitoSub("cognito-sub-123")).thenReturn(Optional.of(sampleUser));

        MessageResponseDto response = authService.requestPhoneVerification(request, null);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        assertTrue(response.getMessage().contains("Verification SMS sent"));
        verify(userRepository, times(1)).save(sampleUser);
        assertFalse(sampleUser.getIsPhoneVerified());
    }

    @Test
    @DisplayName("verifyPhone verifies code with Cognito and marks user phone verified")
    void verifyPhone_success() {
        ConfirmPhoneRequestDto request = ConfirmPhoneRequestDto.builder()
                .phoneNumber(123456789)
                .code("654321")
                .accessToken("mock-token")
                .build();

        when(cognitoService.verifyPhoneNumber("mock-token", "654321"))
                .thenReturn(VerifyUserAttributeResponse.builder().build());

        GetUserResponse getUserResponse = GetUserResponse.builder()
                .username("user-uuid-123")
                .userAttributes(AttributeType.builder().name("sub").value("cognito-sub-123").build())
                .build();
        when(cognitoService.getUser("mock-token")).thenReturn(getUserResponse);
        when(userRepository.findByCognitoSub("cognito-sub-123")).thenReturn(Optional.of(sampleUser));

        MessageResponseDto response = authService.verifyPhone(request, null);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        assertTrue(sampleUser.getIsPhoneVerified());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("resendPhoneVerificationCode sends SMS code again")
    void resendPhoneVerificationCode_success() {
        when(cognitoService.sendPhoneVerificationCode("mock-token"))
                .thenReturn(GetUserAttributeVerificationCodeResponse.builder().build());

        MessageResponseDto response = authService.resendPhoneVerificationCode("mock-token", null);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        verify(cognitoService, times(1)).sendPhoneVerificationCode("mock-token");
    }

    @Test
    @DisplayName("confirmSignUp calls cognitoService and returns success message")
    void confirmSignUp_success() {
        ConfirmSignUpRequestDto request = ConfirmSignUpRequestDto.builder()
                .email("test@example.com")
                .confirmationCode("123456")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(cognitoService.confirmSignUp("user-uuid-123", "123456"))
                .thenReturn(ConfirmSignUpResponse.builder().build());

        MessageResponseDto response = authService.confirmSignUp(request);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        verify(cognitoService, times(1)).confirmSignUp("user-uuid-123", "123456");
    }

    @Test
    @DisplayName("resendConfirmationCode calls cognitoService")
    void resendConfirmationCode_success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(cognitoService.resendConfirmationCode("user-uuid-123"))
                .thenReturn(ResendConfirmationCodeResponse.builder().build());

        MessageResponseDto response = authService.resendConfirmationCode("test@example.com");

        assertNotNull(response);
        assertTrue(response.getSuccess());
        verify(cognitoService, times(1)).resendConfirmationCode("user-uuid-123");
    }

    @Test
    @DisplayName("login returns tokens and user profile")
    void login_success() {
        LoginRequestDto request = LoginRequestDto.builder()
                .email("test@example.com")
                .password("Password123")
                .build();

        AuthenticationResultType authResult = AuthenticationResultType.builder()
                .accessToken("mock-access-token")
                .idToken("mock-id-token")
                .refreshToken("mock-refresh-token")
                .expiresIn(3600)
                .tokenType("Bearer")
                .build();

        InitiateAuthResponse authResponse = InitiateAuthResponse.builder()
                .authenticationResult(authResult)
                .build();

        when(cognitoService.login("test@example.com", "Password123")).thenReturn(authResponse);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(userService.mapToResponse(sampleUser)).thenReturn(sampleUserDto);

        AuthResponseDto response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-access-token", response.getAccessToken());
        assertEquals("mock-id-token", response.getIdToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertEquals(3600, response.getExpiresIn());
        assertEquals(sampleUserDto, response.getUser());
    }

    @Test
    @DisplayName("refreshToken returns refreshed tokens")
    void refreshToken_success() {
        RefreshTokenRequestDto request = RefreshTokenRequestDto.builder()
                .refreshToken("mock-refresh-token")
                .build();

        AuthenticationResultType authResult = AuthenticationResultType.builder()
                .accessToken("new-access-token")
                .idToken("new-id-token")
                .expiresIn(3600)
                .tokenType("Bearer")
                .build();

        InitiateAuthResponse authResponse = InitiateAuthResponse.builder()
                .authenticationResult(authResult)
                .build();

        when(cognitoService.refreshToken("mock-refresh-token")).thenReturn(authResponse);

        AuthResponseDto response = authService.refreshToken(request);

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("new-id-token", response.getIdToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
    }

    @Test
    @DisplayName("forgotPassword sends reset request")
    void forgotPassword_success() {
        ForgotPasswordRequestDto request = ForgotPasswordRequestDto.builder()
                .email("test@example.com")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(cognitoService.forgotPassword("user-uuid-123"))
                .thenReturn(ForgotPasswordResponse.builder().build());

        MessageResponseDto response = authService.forgotPassword(request);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        verify(cognitoService, times(1)).forgotPassword("user-uuid-123");
    }

    @Test
    @DisplayName("confirmForgotPassword resets password")
    void confirmForgotPassword_success() {
        ConfirmForgotPasswordRequestDto request = ConfirmForgotPasswordRequestDto.builder()
                .email("test@example.com")
                .confirmationCode("123456")
                .newPassword("NewPassword123")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(cognitoService.confirmForgotPassword("user-uuid-123", "123456", "NewPassword123"))
                .thenReturn(ConfirmForgotPasswordResponse.builder().build());

        MessageResponseDto response = authService.confirmForgotPassword(request);

        assertNotNull(response);
        assertTrue(response.getSuccess());
        verify(cognitoService, times(1)).confirmForgotPassword("user-uuid-123", "123456", "NewPassword123");
    }

    @Test
    @DisplayName("changePassword changes password with access token")
    void changePassword_success() {
        ChangePasswordRequestDto request = ChangePasswordRequestDto.builder()
                .accessToken("mock-token")
                .previousPassword("OldPassword123")
                .proposedPassword("NewPassword123")
                .build();

        when(cognitoService.changePassword("mock-token", "OldPassword123", "NewPassword123"))
                .thenReturn(ChangePasswordResponse.builder().build());

        MessageResponseDto response = authService.changePassword(request, null);

        assertNotNull(response);
        assertTrue(response.getSuccess());
    }

    @Test
    @DisplayName("getCurrentUser fetches Cognito user and returns local user profile")
    void getCurrentUser_success() {
        GetUserResponse getUserResponse = GetUserResponse.builder()
                .username("user-uuid-123")
                .userAttributes(
                        AttributeType.builder().name("sub").value("cognito-sub-123").build(),
                        AttributeType.builder().name("email").value("test@example.com").build(),
                        AttributeType.builder().name("name").value("Jan").build(),
                        AttributeType.builder().name("family_name").value("Kowalski").build()
                )
                .build();

        when(cognitoService.getUser("mock-access-token")).thenReturn(getUserResponse);
        when(userRepository.findByCognitoSub("cognito-sub-123")).thenReturn(Optional.of(sampleUser));
        when(userService.mapToResponse(sampleUser)).thenReturn(sampleUserDto);

        UserResponseDto response = authService.getCurrentUser("Bearer mock-access-token");

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Jan", response.getName());
    }

    @Test
    @DisplayName("logout calls globalSignOut with Bearer token")
    void logout_success() {
        when(cognitoService.globalSignOut("mock-token"))
                .thenReturn(GlobalSignOutResponse.builder().build());

        MessageResponseDto response = authService.logout("Bearer mock-token");

        assertNotNull(response);
        assertTrue(response.getSuccess());
        verify(cognitoService, times(1)).globalSignOut("mock-token");
    }
}
