package com.example.backend.services;

import com.example.backend.config.CognitoProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AuthFlowType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ChangePasswordRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ChangePasswordResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmForgotPasswordRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmForgotPasswordResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmSignUpRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmSignUpResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ForgotPasswordRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ForgotPasswordResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GlobalSignOutRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GlobalSignOutResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.InitiateAuthRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.InitiateAuthResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ResendConfirmationCodeRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ResendConfirmationCodeResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;
    private final CognitoProperties cognitoProperties;

    public SignUpResponse signUp(String email, String password, String name, String surname, Integer phoneNumber) {
        log.info("Registering user in AWS Cognito for email: {}", email);

        List<AttributeType> attributes = new ArrayList<>();
        attributes.add(AttributeType.builder().name("email").value(email).build());

        if (name != null && !name.isBlank()) {
            attributes.add(AttributeType.builder().name("name").value(name).build());
        }
        if (surname != null && !surname.isBlank()) {
            attributes.add(AttributeType.builder().name("family_name").value(surname).build());
        }
        if (phoneNumber != null) {
            String formattedPhone = formatPhoneNumber(phoneNumber);
            attributes.add(AttributeType.builder().name("phone_number").value(formattedPhone).build());
        }

        SignUpRequest request = SignUpRequest.builder()
                .clientId(cognitoProperties.getClientId())
                .username(email)
                .password(password)
                .userAttributes(attributes)
                .build();

        return cognitoClient.signUp(request);
    }

    public ConfirmSignUpResponse confirmSignUp(String email, String confirmationCode) {
        log.info("Confirming sign-up in AWS Cognito for email: {}", email);
        ConfirmSignUpRequest request = ConfirmSignUpRequest.builder()
                .clientId(cognitoProperties.getClientId())
                .username(email)
                .confirmationCode(confirmationCode)
                .build();

        return cognitoClient.confirmSignUp(request);
    }

    public ResendConfirmationCodeResponse resendConfirmationCode(String email) {
        log.info("Resending confirmation code in AWS Cognito for email: {}", email);
        ResendConfirmationCodeRequest request = ResendConfirmationCodeRequest.builder()
                .clientId(cognitoProperties.getClientId())
                .username(email)
                .build();

        return cognitoClient.resendConfirmationCode(request);
    }

    public InitiateAuthResponse login(String email, String password) {
        log.info("Authenticating user with AWS Cognito: {}", email);
        InitiateAuthRequest request = InitiateAuthRequest.builder()
                .authFlow(AuthFlowType.USER_PASSWORD_AUTH)
                .clientId(cognitoProperties.getClientId())
                .authParameters(Map.of(
                        "USERNAME", email,
                        "PASSWORD", password
                ))
                .build();

        return cognitoClient.initiateAuth(request);
    }

    public InitiateAuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing AWS Cognito tokens using refresh token");
        InitiateAuthRequest request = InitiateAuthRequest.builder()
                .authFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
                .clientId(cognitoProperties.getClientId())
                .authParameters(Map.of(
                        "REFRESH_TOKEN", refreshToken
                ))
                .build();

        return cognitoClient.initiateAuth(request);
    }

    public ForgotPasswordResponse forgotPassword(String email) {
        log.info("Initiating forgot password flow in AWS Cognito for email: {}", email);
        ForgotPasswordRequest request = ForgotPasswordRequest.builder()
                .clientId(cognitoProperties.getClientId())
                .username(email)
                .build();

        return cognitoClient.forgotPassword(request);
    }

    public ConfirmForgotPasswordResponse confirmForgotPassword(String email, String confirmationCode, String newPassword) {
        log.info("Confirming forgot password in AWS Cognito for email: {}", email);
        ConfirmForgotPasswordRequest request = ConfirmForgotPasswordRequest.builder()
                .clientId(cognitoProperties.getClientId())
                .username(email)
                .confirmationCode(confirmationCode)
                .password(newPassword)
                .build();

        return cognitoClient.confirmForgotPassword(request);
    }

    public ChangePasswordResponse changePassword(String accessToken, String previousPassword, String proposedPassword) {
        log.info("Changing password in AWS Cognito");
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .accessToken(accessToken)
                .previousPassword(previousPassword)
                .proposedPassword(proposedPassword)
                .build();

        return cognitoClient.changePassword(request);
    }

    public GetUserResponse getUser(String accessToken) {
        log.debug("Fetching user profile from AWS Cognito using access token");
        GetUserRequest request = GetUserRequest.builder()
                .accessToken(accessToken)
                .build();

        return cognitoClient.getUser(request);
    }

    public GlobalSignOutResponse globalSignOut(String accessToken) {
        log.info("Global sign-out user in AWS Cognito");
        GlobalSignOutRequest request = GlobalSignOutRequest.builder()
                .accessToken(accessToken)
                .build();

        return cognitoClient.globalSignOut(request);
    }

    public AdminCreateUserResponse adminCreateUser(String email, String temporaryPassword, String name, String surname, Integer phoneNumber) {
        log.info("Admin creating user in AWS Cognito for email: {}", email);
        List<AttributeType> attributes = new ArrayList<>();
        attributes.add(AttributeType.builder().name("email").value(email).build());
        attributes.add(AttributeType.builder().name("email_verified").value("true").build());

        if (name != null && !name.isBlank()) {
            attributes.add(AttributeType.builder().name("name").value(name).build());
        }
        if (surname != null && !surname.isBlank()) {
            attributes.add(AttributeType.builder().name("family_name").value(surname).build());
        }
        if (phoneNumber != null) {
            attributes.add(AttributeType.builder().name("phone_number").value(formatPhoneNumber(phoneNumber)).build());
        }

        AdminCreateUserRequest.Builder builder = AdminCreateUserRequest.builder()
                .userPoolId(cognitoProperties.getUserPoolId())
                .username(email)
                .userAttributes(attributes);

        if (temporaryPassword != null && !temporaryPassword.isBlank()) {
            builder.temporaryPassword(temporaryPassword);
        }

        return cognitoClient.adminCreateUser(builder.build());
    }

    private String formatPhoneNumber(Integer phoneNumber) {
        if (phoneNumber == null) {
            return null;
        }
        String str = String.valueOf(phoneNumber).trim();
        if (!str.startsWith("+")) {
            return "+48" + str;
        }
        return str;
    }
}
