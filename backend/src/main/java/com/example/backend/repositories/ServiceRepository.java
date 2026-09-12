package com.example.backend.repositories;

import com.example.backend.models.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Integer> {
    List<Service> findByProviderId(Integer providerId);
}
