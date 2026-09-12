package com.example.backend.repositories;

import com.example.backend.models.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
    List<Company> findByOwnerId(Integer ownerId);
    List<Company> findByIsInRevitalizationZone(Boolean isInRevitalizationZone);
}
