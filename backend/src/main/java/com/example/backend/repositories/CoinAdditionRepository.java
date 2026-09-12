package com.example.backend.repositories;

import com.example.backend.models.CoinAddition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoinAdditionRepository extends JpaRepository<CoinAddition, Integer> {
    List<CoinAddition> findByUserId(Integer userId);
    List<CoinAddition> findByCompanyId(Integer companyId);
}
