package com.example.backend.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AuthenticationResultType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.InitiateAuthResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UpdateUserAttributesResponse;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
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

        // When User Pool has alias_attributes = ["email"], username cannot have email format.
        // A unique non-email username (UUID) is generated and email is linked as an alias attribute.
        String cognitoUsername = UUID.randomUUID().toString();

        // Phone number is input and verified separately via SMS, so not passed to Cognito at signup
        SignUpResponse signUpResponse = cognitoService.signUp(
                cognitoUsername,
                request.getEmail(),
                request.getPassword(),
                request.getName(),
                request.getSurname(),
                null
        );

        User user = User.builder()
                .email(request.getEmail())
                .cognitoUsername(cognitoUsername)
                .cognitoSub(signUpResponse.userSub())
                .name(request.getName())
                .surname(request.getSurname())
                .phoneNumber(request.getPhoneNumber())
                .isPhoneVerified(false)
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
        String usernameToConfirm = resolveCognitoUsername(request.getEmail());
        cognitoService.confirmSignUp(usernameToConfirm, request.getConfirmationCode());
        return MessageResponseDto.builder()
                .message("Email confirmed successfully. You can now log in.")
                .success(true)
                .build();
    }

    public MessageResponseDto resendConfirmationCode(String email) {
        String username = resolveCognitoUsername(email);
        cognitoService.resendConfirmationCode(username);
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
        String username = resolveCognitoUsername(request.getEmail());
        cognitoService.forgotPassword(username);
        return MessageResponseDto.builder()
                .message("Password reset code sent to your registered email address.")
                .success(true)
                .build();
    }

    public MessageResponseDto confirmForgotPassword(ConfirmForgotPasswordRequestDto request) {
        String username = resolveCognitoUsername(request.getEmail());
        cognitoService.confirmForgotPassword(username, request.getConfirmationCode(), request.getNewPassword());
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
    public MessageResponseDto requestPhoneVerification(PhoneVerificationRequestDto request, String authHeader) {
        String accessToken = resolveAccessToken(request.getAccessToken(), authHeader);
        String formattedPhone = cognitoService.formatPhoneNumber(request.getPhoneNumber());

        UpdateUserAttributesResponse updateResponse = cognitoService.updatePhoneNumber(accessToken, formattedPhone);

        if (updateResponse.codeDeliveryDetailsList() == null || updateResponse.codeDeliveryDetailsList().isEmpty()) {
            cognitoService.sendPhoneVerificationCode(accessToken);
        }

        User user = getUserByAccessToken(accessToken);
        if (user != null) {
            user.setPhoneNumber(request.getPhoneNumber());
            user.setIsPhoneVerified(false);
            userRepository.save(user);
        }

        return MessageResponseDto.builder()
                .message("Verification SMS sent to " + formattedPhone + ". Please verify with the code received.")
                .success(true)
                .build();
    }

    @Transactional
    public MessageResponseDto verifyPhone(ConfirmPhoneRequestDto request, String authHeader) {
        String accessToken = resolveAccessToken(request.getAccessToken(), authHeader);

        cognitoService.verifyPhoneNumber(accessToken, request.getCode());

        User user = getUserByAccessToken(accessToken);
        if (user != null) {
            if (request.getPhoneNumber() != null) {
                user.setPhoneNumber(request.getPhoneNumber());
            }
            user.setIsPhoneVerified(true);
            userRepository.save(user);
        }

        return MessageResponseDto.builder()
                .message("Phone number verified successfully via SMS.")
                .success(true)
                .build();
    }

    public MessageResponseDto resendPhoneVerificationCode(String tokenFromBody, String authHeader) {
        String accessToken = resolveAccessToken(tokenFromBody, authHeader);
        cognitoService.sendPhoneVerificationCode(accessToken);

        return MessageResponseDto.builder()
                .message("SMS verification code resent to your registered phone number.")
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
        if (userOptional.isEmpty() && userResponse.username() != null) {
            userOptional = userRepository.findByCognitoUsername(userResponse.username());
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

            boolean phoneVerified = Boolean.parseBoolean(attributes.getOrDefault("phone_number_verified", "false"));

            User newUser = User.builder()
                    .email(email != null ? email : userResponse.username())
                    .cognitoSub(sub)
                    .cognitoUsername(userResponse.username())
                    .name(attributes.getOrDefault("name", "User"))
                    .surname(attributes.getOrDefault("family_name", "Cognito"))
                    .phoneNumber(phone)
                    .isPhoneVerified(phoneVerified)
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

    private User getUserByAccessToken(String accessToken) {
        try {
            GetUserResponse userResponse = cognitoService.getUser(accessToken);
            String sub = userResponse.userAttributes().stream()
                    .filter(attr -> "sub".equals(attr.name()))
                    .map(AttributeType::value)
                    .findFirst()
                    .orElse(null);

            if (sub != null) {
                Optional<User> user = userRepository.findByCognitoSub(sub);
                if (user.isPresent()) {
                    return user.get();
                }
            }

            String email = userResponse.userAttributes().stream()
                    .filter(attr -> "email".equals(attr.name()))
                    .map(AttributeType::value)
                    .findFirst()
                    .orElse(null);

            if (email != null) {
                Optional<User> user = userRepository.findByEmail(email);
                if (user.isPresent()) {
                    return user.get();
                }
            }

            if (userResponse.username() != null) {
                return userRepository.findByCognitoUsername(userResponse.username()).orElse(null);
            }
        } catch (Exception e) {
            log.warn("Could not retrieve user by access token: {}", e.getMessage());
        }
        return null;
    }

    private String resolveAccessToken(String tokenFromBody, String authHeader) {
        if (tokenFromBody != null && !tokenFromBody.isBlank()) {
            return tokenFromBody.trim();
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        throw new IllegalArgumentException("Cognito access token must be provided via Bearer Authorization header or request body");
    }

    private String resolveCognitoUsername(String email) {
        if (email == null) {
            return null;
        }
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getCognitoUsername() != null && !user.get().getCognitoUsername().isBlank()) {
            return user.get().getCognitoUsername();
        }
        return email;
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

            Integer phone = null;
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

            boolean phoneVerified = Boolean.parseBoolean(attributes.getOrDefault("phone_number_verified", "false"));

            User newUser = User.builder()
                    .email(email)
                    .cognitoSub(sub)
                    .cognitoUsername(userResponse.username())
                    .name(attributes.getOrDefault("name", "User"))
                    .surname(attributes.getOrDefault("family_name", "Cognito"))
                    .phoneNumber(phone)
                    .isPhoneVerified(phoneVerified)
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
                    .phoneNumber(null)
                    .isPhoneVerified(false)
                    .coins(0)
                    .isDeleted(false)
                    .isOwner(false)
                    .build();
            return userRepository.save(newUser);
        }
    }
}
