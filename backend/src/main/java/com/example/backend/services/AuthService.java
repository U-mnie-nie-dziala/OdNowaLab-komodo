package com.example.backend.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.example.backend.dtos.UserResponseDto;
import com.example.backend.dtos.auth.AuthResponseDto;
import com.example.backend.dtos.auth.ChangePasswordRequestDto;
import com.example.backend.dtos.auth.ConfirmForgotPasswordRequestDto;
import com.example.backend.dtos.auth.ConfirmSignUpRequestDto;
import com.example.backend.dtos.auth.ForgotPasswordRequestDto;
import com.example.backend.dtos.auth.LoginRequestDto;
import com.example.backend.dtos.auth.MessageResponseDto;
import com.example.backend.dtos.auth.RefreshTokenRequestDto;
import com.example.backend.dtos.auth.RegisterRequestDto;
import com.example.backend.dtos.auth.RegisterResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AuthenticationResultType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.InitiateAuthResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final CognitoService cognitoService;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public RegisterResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists in the database");
        }

        SignUpResponse signUpResponse = cognitoService.signUp(
                request.getEmail(),
                request.getPassword(),
                request.getName(),
                request.getSurname(),
                request.getPhoneNumber()
        );

        User user = User.builder()
                .email(request.getEmail())
                .cognitoSub(signUpResponse.userSub())
                .name(request.getName())
                .surname(request.getSurname())
                .phoneNumber(request.getPhoneNumber())
                .coins(0)
                .isDeleted(false)
                .isOwner(request.getIsOwner() != null ? request.getIsOwner() : false)
                .build();

        User savedUser = userRepository.save(user);

        String message = Boolean.TRUE.equals(signUpResponse.userConfirmed())
                ? "User registered successfully and confirmed."
                : "User registered successfully. Please check your email for confirmation code.";

        return RegisterResponseDto.builder()
                .message(message)
                .userSub(signUpResponse.userSub())
                .email(request.getEmail())
                .isConfirmed(signUpResponse.userConfirmed())
                .user(userService.mapToResponse(savedUser))
                .build();
    }

    public MessageResponseDto confirmSignUp(ConfirmSignUpRequestDto request) {
        cognitoService.confirmSignUp(request.getEmail(), request.getConfirmationCode());
        return MessageResponseDto.builder()
                .message("Email confirmed successfully. You can now log in.")
                .success(true)
                .build();
    }

    public MessageResponseDto resendConfirmationCode(String email) {
        cognitoService.resendConfirmationCode(email);
        return MessageResponseDto.builder()
                .message("Confirmation code resent to: " + email)
                .success(true)
                .build();
    }

    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        InitiateAuthResponse authResponse = cognitoService.login(request.getEmail(), request.getPassword());
        AuthenticationResultType authResult = authResponse.authenticationResult();

        if (authResult == null) {
            String challenge = authResponse.challengeNameAsString();
            throw new IllegalStateException("Authentication challenge encountered: " + challenge);
        }

        String sub = extractSubFromIdToken(authResult.idToken());

        User user = userRepository.findByEmail(request.getEmail())
                .map(existing -> {
                    if (existing.getCognitoSub() == null && sub != null) {
                        existing.setCognitoSub(sub);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> syncUserFromCognito(authResult.accessToken(), request.getEmail(), sub));

        return AuthResponseDto.builder()
                .accessToken(authResult.accessToken())
                .idToken(authResult.idToken())
                .refreshToken(authResult.refreshToken())
                .expiresIn(authResult.expiresIn())
                .tokenType(authResult.tokenType() != null ? authResult.tokenType() : "Bearer")
                .user(userService.mapToResponse(user))
                .build();
    }

    public AuthResponseDto refreshToken(RefreshTokenRequestDto request) {
        InitiateAuthResponse authResponse = cognitoService.refreshToken(request.getRefreshToken());
        AuthenticationResultType authResult = authResponse.authenticationResult();

        if (authResult == null) {
            throw new IllegalStateException("Could not refresh token: authentication challenge received");
        }

        return AuthResponseDto.builder()
                .accessToken(authResult.accessToken())
                .idToken(authResult.idToken())
                .refreshToken(request.getRefreshToken())
                .expiresIn(authResult.expiresIn())
                .tokenType(authResult.tokenType() != null ? authResult.tokenType() : "Bearer")
                .build();
    }

    public MessageResponseDto forgotPassword(ForgotPasswordRequestDto request) {
        cognitoService.forgotPassword(request.getEmail());
        return MessageResponseDto.builder()
                .message("Password reset code sent to your registered email address.")
                .success(true)
                .build();
    }

    public MessageResponseDto confirmForgotPassword(ConfirmForgotPasswordRequestDto request) {
        cognitoService.confirmForgotPassword(request.getEmail(), request.getConfirmationCode(), request.getNewPassword());
        return MessageResponseDto.builder()
                .message("Password has been successfully reset. You can now log in.")
                .success(true)
                .build();
    }

    public MessageResponseDto changePassword(ChangePasswordRequestDto request, String authHeader) {
        String token = request.getAccessToken();
        if ((token == null || token.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Access token must be provided in request body or Authorization header");
        }

        cognitoService.changePassword(token, request.getPreviousPassword(), request.getProposedPassword());
        return MessageResponseDto.builder()
                .message("Password changed successfully.")
                .success(true)
                .build();
    }

    @Transactional
    public UserResponseDto getCurrentUser(String authHeader) {
        String token = extractBearerToken(authHeader);
        GetUserResponse userResponse = cognitoService.getUser(token);

        Map<String, String> attributes = userResponse.userAttributes().stream()
                .collect(Collectors.toMap(AttributeType::name, AttributeType::value, (k1, k2) -> k1));

        String sub = attributes.get("sub");
        String email = attributes.get("email");

        Optional<User> userOptional = Optional.empty();
        if (sub != null) {
            userOptional = userRepository.findByCognitoSub(sub);
        }
        if (userOptional.isEmpty() && email != null) {
            userOptional = userRepository.findByEmail(email);
        }

        User user = userOptional.orElseGet(() -> {
            Integer phone = null;
            if (attributes.containsKey("phone_number")) {
                try {
                    String cleanPhone = attributes.get("phone_number").replaceAll("[^0-9]", "");
                    if (cleanPhone.length() > 9) {
                        cleanPhone = cleanPhone.substring(cleanPhone.length() - 9);
                    }
                    phone = Integer.parseInt(cleanPhone);
                } catch (NumberFormatException ignored) {
                    phone = 0;
                }
            } else {
                phone = 0;
            }

            User newUser = User.builder()
                    .email(email != null ? email : userResponse.username())
                    .cognitoSub(sub)
                    .name(attributes.getOrDefault("name", "User"))
                    .surname(attributes.getOrDefault("family_name", "Cognito"))
                    .phoneNumber(phone)
                    .coins(0)
                    .isDeleted(false)
                    .isOwner(false)
                    .build();

            return userRepository.save(newUser);
        });

        return userService.mapToResponse(user);
    }

    public MessageResponseDto logout(String authHeader) {
        String token = extractBearerToken(authHeader);
        cognitoService.globalSignOut(token);
        return MessageResponseDto.builder()
                .message("Logged out successfully from all devices.")
                .success(true)
                .build();
    }

    private String extractBearerToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header must contain Bearer token");
        }
        return authHeader.substring(7).trim();
    }

    private String extractSubFromIdToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            return null;
        }
        try {
            DecodedJWT jwt = JWT.decode(idToken);
            return jwt.getSubject();
        } catch (Exception e) {
            log.warn("Could not decode ID token: {}", e.getMessage());
            return null;
        }
    }

    private User syncUserFromCognito(String accessToken, String email, String sub) {
        try {
            GetUserResponse userResponse = cognitoService.getUser(accessToken);
            Map<String, String> attributes = userResponse.userAttributes().stream()
                    .collect(Collectors.toMap(AttributeType::name, AttributeType::value, (k1, k2) -> k1));

            Integer phone = 0;
            if (attributes.containsKey("phone_number")) {
                try {
                    String clean = attributes.get("phone_number").replaceAll("[^0-9]", "");
                    if (clean.length() > 9) {
                        clean = clean.substring(clean.length() - 9);
                    }
                    phone = Integer.parseInt(clean);
                } catch (Exception ignored) {
                }
            }

            User newUser = User.builder()
                    .email(email)
                    .cognitoSub(sub)
                    .name(attributes.getOrDefault("name", "User"))
                    .surname(attributes.getOrDefault("family_name", "Cognito"))
                    .phoneNumber(phone)
                    .coins(0)
                    .isDeleted(false)
                    .isOwner(false)
                    .build();

            return userRepository.save(newUser);
        } catch (Exception e) {
            log.warn("Unable to fetch user attributes from Cognito for auto-sync: {}", e.getMessage());
            User newUser = User.builder()
                    .email(email)
                    .cognitoSub(sub)
                    .name("User")
                    .surname("Cognito")
                    .phoneNumber(0)
                    .coins(0)
                    .isDeleted(false)
                    .isOwner(false)
                    .build();
            return userRepository.save(newUser);
        }
    }
}
