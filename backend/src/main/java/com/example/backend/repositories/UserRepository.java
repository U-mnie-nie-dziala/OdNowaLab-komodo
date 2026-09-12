package com.example.backend.repositories;

import com.example.backend.models.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    List<User> findByIsDeletedFalse();

    Optional<User> findByEmail(String email);

    Optional<User> findByCognitoSub(String cognitoSub);

    Optional<User> findByCognitoUsername(String cognitoUsername);

    Optional<User> findByPhoneNumber(Integer phoneNumber);

    boolean existsByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithLock(@Param("id") Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.phoneNumber = :phoneNumber")
    Optional<User> findByPhoneNumberWithLock(@Param("phoneNumber") Integer phoneNumber);
}
