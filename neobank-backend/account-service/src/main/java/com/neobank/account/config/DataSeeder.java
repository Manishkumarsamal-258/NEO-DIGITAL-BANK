package com.neobank.account.config;

import com.neobank.account.repository.AccountRepository;
import com.neobank.account.repository.BeneficiaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;

    public DataSeeder(AccountRepository accountRepository, BeneficiaryRepository beneficiaryRepository) {
        this.accountRepository = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
    }

    @Override
    public void run(String... args) {
        if (accountRepository.count() > 0) {
            log.info("Accounts database already seeded. Skipping...");
            return;
        }
        log.info("Accounts database is empty. Create accounts via the Teller API to generate data.");
        log.info("Seed data skipped - accounts are created on demand through teller and customer operations.");
    }
}