package com.example.backend.config;

import com.example.backend.models.CoinAddition;
import com.example.backend.models.Company;
import com.example.backend.models.Service;
import com.example.backend.models.Transaction;
import com.example.backend.models.User;
import com.example.backend.repositories.CoinAdditionRepository;
import com.example.backend.repositories.CompanyRepository;
import com.example.backend.repositories.ServiceRepository;
import com.example.backend.repositories.TransactionRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final ServiceRepository serviceRepository;
    private final TransactionRepository transactionRepository;
    private final CoinAdditionRepository coinAdditionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains data, skipping data seeding.");
            return;
        }

        log.info("Starting initial database seeding...");

        // 1. Seed Users (Business Owners and Regular Residents)
        User ownerJan = User.builder()
                .name("Jan")
                .surname("Kowalski")
                .phoneNumber(501111222)
                .coins(250)
                .isOwner(true)
                .isDeleted(false)
                .build();

        User ownerAnna = User.builder()
                .name("Anna")
                .surname("Nowak")
                .phoneNumber(502222333)
                .coins(300)
                .isOwner(true)
                .isDeleted(false)
                .build();

        User ownerPiotr = User.builder()
                .name("Piotr")
                .surname("Wiśniewski")
                .phoneNumber(503333444)
                .coins(150)
                .isOwner(true)
                .isDeleted(false)
                .build();

        User userMaria = User.builder()
                .name("Maria")
                .surname("Zielińska")
                .phoneNumber(601111222)
                .coins(120)
                .isOwner(false)
                .isDeleted(false)
                .build();

        User userTomasz = User.builder()
                .name("Tomasz")
                .surname("Lewandowski")
                .phoneNumber(602222333)
                .coins(85)
                .isOwner(false)
                .isDeleted(false)
                .build();

        User userZofia = User.builder()
                .name("Zofia")
                .surname("Dąbrowska")
                .phoneNumber(603333444)
                .coins(60)
                .isOwner(false)
                .isDeleted(false)
                .build();

        userRepository.saveAll(List.of(ownerJan, ownerAnna, ownerPiotr, userMaria, userTomasz, userZofia));
        log.info("Seeded {} users.", userRepository.count());

        // 2. Seed Companies
        Company piekarnia = Company.builder()
                .name("EkoPiekarnia")
                .locationX(new BigDecimal("52.23"))
                .locationY(new BigDecimal("21.01"))
                .description("Tradycyjna piekarnia z pieczywem na zakwasie z lokalnych mąk.")
                .owner(ownerJan)
                .isInRevitalizationZone(true)
                .picture("/uploads/companies/seed_piekarnia.jpg")
                .build();

        Company kawiarnia = Company.builder()
                .name("Kawiarnia Retro")
                .locationX(new BigDecimal("52.24"))
                .locationY(new BigDecimal("21.02"))
                .description("Klimatyczna kawiarnia w sercu zrewitalizowanej kamienicy.")
                .owner(ownerAnna)
                .isInRevitalizationZone(true)
                .picture("/uploads/companies/seed_kawiarnia.jpg")
                .build();

        Company warsztat = Company.builder()
                .name("Rowerowy Warsztat")
                .locationX(new BigDecimal("52.22"))
                .locationY(new BigDecimal("21.00"))
                .description("Serwis, naprawa oraz wypożyczalnia rowerów miejskich.")
                .owner(ownerPiotr)
                .isInRevitalizationZone(false)
                .picture(null)
                .build();

        Company zielarnia = Company.builder()
                .name("Zielarnia OdNowa")
                .locationX(new BigDecimal("52.25"))
                .locationY(new BigDecimal("21.03"))
                .description("Naturalne zioła, miody z miejskich pasiek i kosmetyki ekologiczne.")
                .owner(ownerAnna)
                .isInRevitalizationZone(true)
                .picture(null)
                .build();

        companyRepository.saveAll(List.of(piekarnia, kawiarnia, warsztat, zielarnia));
        log.info("Seeded {} companies.", companyRepository.count());

        // 3. Seed Services (both company-provided and municipal/null provider)
        Service kawa = Service.builder()
                .name("Kawa espresso")
                .coinCost(10)
                .provider(kawiarnia)
                .build();

        Service ciastko = Service.builder()
                .name("Ciastko domowe")
                .coinCost(15)
                .provider(kawiarnia)
                .build();

        Service chleb = Service.builder()
                .name("Chleb żytni")
                .coinCost(12)
                .provider(piekarnia)
                .build();

        Service drozdzowka = Service.builder()
                .name("Drożdżówka")
                .coinCost(6)
                .provider(piekarnia)
                .build();

        Service przegladRoweru = Service.builder()
                .name("Przegląd roweru")
                .coinCost(50)
                .provider(warsztat)
                .build();

        Service regulacjaHamulcow = Service.builder()
                .name("Regulacja hamulców")
                .coinCost(20)
                .provider(warsztat)
                .build();

        Service herbataZiolowa = Service.builder()
                .name("Herbata ziołowa")
                .coinCost(8)
                .provider(zielarnia)
                .build();

        Service biletTeatr = Service.builder()
                .name("Bilet do teatru")
                .coinCost(40)
                .provider(null)
                .build();

        serviceRepository.saveAll(List.of(
                kawa, ciastko, chleb, drozdzowka,
                przegladRoweru, regulacjaHamulcow, herbataZiolowa, biletTeatr
        ));
        log.info("Seeded {} services.", serviceRepository.count());

        // 4. Seed CoinAdditions (Coins earned/rewarded by companies)
        CoinAddition ca1 = CoinAddition.builder()
                .user(userMaria)
                .company(piekarnia)
                .coinAmount(30)
                .date(LocalDate.of(2026, 9, 1))
                .build();

        CoinAddition ca2 = CoinAddition.builder()
                .user(userTomasz)
                .company(kawiarnia)
                .coinAmount(50)
                .date(LocalDate.of(2026, 9, 3))
                .build();

        CoinAddition ca3 = CoinAddition.builder()
                .user(userZofia)
                .company(zielarnia)
                .coinAmount(25)
                .date(LocalDate.of(2026, 9, 5))
                .build();

        CoinAddition ca4 = CoinAddition.builder()
                .user(userMaria)
                .company(warsztat)
                .coinAmount(40)
                .date(LocalDate.of(2026, 9, 8))
                .build();

        coinAdditionRepository.saveAll(List.of(ca1, ca2, ca3, ca4));
        log.info("Seeded {} coin additions.", coinAdditionRepository.count());

        // 5. Seed Transactions (Coins spent on services)
        Transaction t1 = Transaction.builder()
                .user(userMaria)
                .service(kawa)
                .date(LocalDate.of(2026, 9, 2))
                .build();

        Transaction t2 = Transaction.builder()
                .user(userMaria)
                .service(chleb)
                .date(LocalDate.of(2026, 9, 4))
                .build();

        Transaction t3 = Transaction.builder()
                .user(userTomasz)
                .service(regulacjaHamulcow)
                .date(LocalDate.of(2026, 9, 6))
                .build();

        Transaction t4 = Transaction.builder()
                .user(userZofia)
                .service(herbataZiolowa)
                .date(LocalDate.of(2026, 9, 7))
                .build();

        Transaction t5 = Transaction.builder()
                .user(userTomasz)
                .service(ciastko)
                .date(LocalDate.of(2026, 9, 9))
                .build();

        transactionRepository.saveAll(List.of(t1, t2, t3, t4, t5));
        log.info("Seeded {} transactions.", transactionRepository.count());

        log.info("Database seeding completed successfully.");
    }
}
