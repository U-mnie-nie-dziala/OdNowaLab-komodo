package com.example.backend.repositories;

import com.example.backend.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByUserId(Integer userId);

    List<Transaction> findByServiceId(Integer serviceId);

    List<Transaction> findByService_Provider_Id(Integer providerId);

    List<Transaction> findByService_Provider_IdAndIsValid(Integer providerId, Boolean isValid);

    List<Transaction> findByService_Provider_IdAndIsConsumed(Integer providerId, Boolean isConsumed);

    List<Transaction> findByUserIdAndService_Provider_Id(Integer userId, Integer providerId);

    List<Transaction> findByUserIdAndService_Provider_IdAndIsValid(Integer userId, Integer providerId, Boolean isValid);

    List<Transaction> findByUserIdAndService_Provider_IdAndIsConsumed(Integer userId, Integer providerId, Boolean isConsumed);
}
