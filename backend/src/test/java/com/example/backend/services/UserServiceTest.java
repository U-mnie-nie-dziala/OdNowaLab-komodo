package com.example.backend.services;

import com.example.backend.dtos.UserRequestDto;
import com.example.backend.dtos.UserResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1)
                .email("jan.kowalski@example.com")
                .cognitoSub("sub-12345")
                .name("Jan")
                .surname("Kowalski")
                .coins(100)
                .phoneNumber(123456789)
                .isDeleted(false)
                .isOwner(false)
                .build();
    }

    @Test
    @DisplayName("getAllUsers returns mapped list of users")
    void getAllUsers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));

        List<UserResponseDto> result = userService.getAllUsers();

        assertEquals(1, result.size());
        assertEquals("Jan", result.get(0).getName());
        assertEquals("jan.kowalski@example.com", result.get(0).getEmail());
        assertEquals(100, result.get(0).getCoins());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getUserById returns user when found")
    void getUserById_found_returnsDto() {
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));

        UserResponseDto result = userService.getUserById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Jan", result.getName());
        assertEquals("jan.kowalski@example.com", result.getEmail());
        assertEquals(100, result.getCoins());
    }

    @Test
    @DisplayName("getUserByEmail returns user when found")
    void getUserByEmail_found_returnsDto() {
        when(userRepository.findByEmail("jan.kowalski@example.com")).thenReturn(Optional.of(sampleUser));

        UserResponseDto result = userService.getUserByEmail("jan.kowalski@example.com");

        assertNotNull(result);
        assertEquals("jan.kowalski@example.com", result.getEmail());
        assertEquals("Jan", result.getName());
    }

    @Test
    @DisplayName("getUserByCognitoSub returns user when found")
    void getUserByCognitoSub_found_returnsDto() {
        when(userRepository.findByCognitoSub("sub-12345")).thenReturn(Optional.of(sampleUser));

        UserResponseDto result = userService.getUserByCognitoSub("sub-12345");

        assertNotNull(result);
        assertEquals("sub-12345", result.getCognitoSub());
        assertEquals("Jan", result.getName());
    }

    @Test
    @DisplayName("getUserById throws ResourceNotFoundException when not found")
    void getUserById_notFound_throwsException() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99));
    }

    @Test
    @DisplayName("createUser saves and returns new user")
    void createUser_success() {
        UserRequestDto request = UserRequestDto.builder()
                .email("anna.nowak@example.com")
                .cognitoSub("sub-67890")
                .name("Anna")
                .surname("Nowak")
                .coins(50)
                .phoneNumber(987654321)
                .isDeleted(false)
                .isOwner(true)
                .build();

        User savedUser = User.builder()
                .id(2)
                .email("anna.nowak@example.com")
                .cognitoSub("sub-67890")
                .name("Anna")
                .surname("Nowak")
                .coins(50)
                .phoneNumber(987654321)
                .isDeleted(false)
                .isOwner(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponseDto result = userService.createUser(request);

        assertNotNull(result);
        assertEquals(2, result.getId());
        assertEquals("Anna", result.getName());
        assertEquals("anna.nowak@example.com", result.getEmail());
        assertEquals(50, result.getCoins());
        assertTrue(result.getIsOwner());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("updateUser updates fields and returns updated user")
    void updateUser_success() {
        UserRequestDto request = UserRequestDto.builder()
                .email("janusz@example.com")
                .name("Janusz")
                .surname("Kowalski")
                .coins(150)
                .phoneNumber(111222333)
                .isDeleted(false)
                .isOwner(true)
                .build();

        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDto result = userService.updateUser(1, request);

        assertEquals("Janusz", result.getName());
        assertEquals("janusz@example.com", result.getEmail());
        assertEquals(150, result.getCoins());
        assertEquals(111222333, result.getPhoneNumber());
        assertTrue(result.getIsOwner());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("updateUser throws ResourceNotFoundException when user not found")
    void updateUser_notFound_throwsException() {
        UserRequestDto request = UserRequestDto.builder().name("Test").coins(10).surname("User").phoneNumber(123).build();
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.updateUser(99, request));
    }

    @Test
    @DisplayName("deleteUser deletes user when user exists")
    void deleteUser_success() {
        when(userRepository.existsById(1)).thenReturn(true);

        userService.deleteUser(1);

        verify(userRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("deleteUser throws ResourceNotFoundException when user does not exist")
    void deleteUser_notFound_throwsException() {
        when(userRepository.existsById(99)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(99));
        verify(userRepository, never()).deleteById(any());
    }
}
