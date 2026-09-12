package com.example.backend.services;

import com.example.backend.dtos.UserRequestDto;
import com.example.backend.dtos.UserResponseDto;
import com.example.backend.exceptions.ResourceNotFoundException;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserByCognitoSub(String cognitoSub) {
        User user = userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with cognitoSub: " + cognitoSub));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponseDto createUser(UserRequestDto request) {
        User user = User.builder()
                .email(request.getEmail())
                .cognitoSub(request.getCognitoSub())
                .cognitoUsername(request.getCognitoUsername())
                .name(request.getName())
                .coins(request.getCoins() != null ? request.getCoins() : 0)
                .surname(request.getSurname())
                .phoneNumber(request.getPhoneNumber())
                .isPhoneVerified(request.getIsPhoneVerified() != null ? request.getIsPhoneVerified() : false)
                .isDeleted(request.getIsDeleted() != null ? request.getIsDeleted() : false)
                .isOwner(request.getIsOwner() != null ? request.getIsOwner() : false)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponseDto updateUser(Integer id, UserRequestDto request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getCognitoSub() != null) {
            user.setCognitoSub(request.getCognitoSub());
        }
        if (request.getCognitoUsername() != null) {
            user.setCognitoUsername(request.getCognitoUsername());
        }
        user.setName(request.getName());
        if (request.getCoins() != null) {
            user.setCoins(request.getCoins());
        }
        user.setSurname(request.getSurname());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getIsPhoneVerified() != null) {
            user.setIsPhoneVerified(request.getIsPhoneVerified());
        }
        if (request.getIsDeleted() != null) {
            user.setIsDeleted(request.getIsDeleted());
        }
        if (request.getIsOwner() != null) {
            user.setIsOwner(request.getIsOwner());
        }

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserResponseDto mapToResponse(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .cognitoSub(user.getCognitoSub())
                .cognitoUsername(user.getCognitoUsername())
                .name(user.getName())
                .coins(user.getCoins())
                .surname(user.getSurname())
                .phoneNumber(user.getPhoneNumber())
                .isPhoneVerified(user.getIsPhoneVerified())
                .isDeleted(user.getIsDeleted())
                .isOwner(user.getIsOwner())
                .build();
    }
}
