package com.example.backend.controllers;

import com.example.backend.dtos.CoinAdditionRequestDto;
import com.example.backend.dtos.CoinAdditionResponseDto;
import com.example.backend.services.CoinAdditionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coin-additions")
@RequiredArgsConstructor
public class CoinAdditionController {

    private final CoinAdditionService coinAdditionService;

    @GetMapping
    public ResponseEntity<List<CoinAdditionResponseDto>> getAllCoinAdditions(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer companyId) {
        if (userId != null) {
            return ResponseEntity.ok(coinAdditionService.getCoinAdditionsByUserId(userId));
        }
        if (companyId != null) {
            return ResponseEntity.ok(coinAdditionService.getCoinAdditionsByCompanyId(companyId));
        }
        return ResponseEntity.ok(coinAdditionService.getAllCoinAdditions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoinAdditionResponseDto> getCoinAdditionById(@PathVariable Integer id) {
        return ResponseEntity.ok(coinAdditionService.getCoinAdditionById(id));
    }

    @PostMapping
    public ResponseEntity<CoinAdditionResponseDto> createCoinAddition(@Valid @RequestBody CoinAdditionRequestDto request) {
        CoinAdditionResponseDto created = coinAdditionService.createCoinAddition(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoinAdditionResponseDto> updateCoinAddition(
            @PathVariable Integer id,
            @Valid @RequestBody CoinAdditionRequestDto request) {
        return ResponseEntity.ok(coinAdditionService.updateCoinAddition(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoinAddition(@PathVariable Integer id) {
        coinAdditionService.deleteCoinAddition(id);
        return ResponseEntity.noContent().build();
    }
}
