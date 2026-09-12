package com.example.backend.controllers;

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
import com.example.backend.dtos.auth.ResendCodeRequestDto;
import com.example.backend.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication and creation via AWS Cognito")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register user", description = "Registers a new user account with AWS Cognito and creates a corresponding local profile.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User successfully registered in Cognito and local database"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or weak password"),
            @ApiResponse(responseCode = "409", description = "User with this email already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        RegisterResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Confirm registration", description = "Confirms a newly registered user account using the verification code sent to their email.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email confirmed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired confirmation code")
    })
    @PostMapping("/confirm")
    public ResponseEntity<MessageResponseDto> confirmSignUp(@Valid @RequestBody ConfirmSignUpRequestDto request) {
        return ResponseEntity.ok(authService.confirmSignUp(request));
    }

    @Operation(summary = "Resend confirmation code", description = "Resends the email confirmation code for an unconfirmed account.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Confirmation code resent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid email or user already confirmed")
    })
    @PostMapping("/resend-code")
    public ResponseEntity<MessageResponseDto> resendConfirmationCode(@Valid @RequestBody ResendCodeRequestDto request) {
        return ResponseEntity.ok(authService.resendConfirmationCode(request.getEmail()));
    }

    @Operation(summary = "Log in", description = "Authenticates user credentials against AWS Cognito and returns JWT tokens (AccessToken, IdToken, RefreshToken) along with user profile.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication successful"),
            @ApiResponse(responseCode = "401", description = "Incorrect username or password"),
            @ApiResponse(responseCode = "403", description = "User account not confirmed")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Refresh tokens", description = "Issues a new AccessToken and IdToken using a valid Cognito RefreshToken.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tokens refreshed successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @Operation(summary = "Forgot password", description = "Requests a password reset code sent to the user's verified email.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset code sent"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @Operation(summary = "Confirm forgot password", description = "Resets user password using the verification code received via email.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password successfully reset"),
            @ApiResponse(responseCode = "400", description = "Invalid confirmation code or password policy violation")
    })
    @PostMapping("/confirm-forgot-password")
    public ResponseEntity<MessageResponseDto> confirmForgotPassword(@Valid @RequestBody ConfirmForgotPasswordRequestDto request) {
        return ResponseEntity.ok(authService.confirmForgotPassword(request));
    }

    @Operation(
            summary = "Change password",
            description = "Changes the password for an authenticated user using their current AccessToken.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid previous password or new password does not meet policy requirements"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid access token")
    })
    @PostMapping("/change-password")
    public ResponseEntity<MessageResponseDto> changePassword(
            @Valid @RequestBody ChangePasswordRequestDto request,
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, description = "Bearer access token", required = false)
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(authService.changePassword(request, authHeader));
    }

    @Operation(
            summary = "Get current user profile",
            description = "Retrieves the currently authenticated user's profile from the database matching the Bearer AccessToken.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired access token")
    })
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, description = "Bearer access token", required = true)
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.getCurrentUser(authHeader));
    }

    @Operation(
            summary = "Log out",
            description = "Signs out the user globally from all devices and invalidates all issued Cognito refresh tokens.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully logged out"),
            @ApiResponse(responseCode = "401", description = "Invalid access token")
    })
    @PostMapping("/logout")
    public ResponseEntity<MessageResponseDto> logout(
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, description = "Bearer access token", required = true)
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.logout(authHeader));
    }
}
