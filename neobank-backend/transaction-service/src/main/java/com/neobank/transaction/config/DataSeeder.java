package com.neobank.transaction.config;

import com.neobank.transaction.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final TransactionRepository transactionRepository;

    public DataSeeder(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public void run(String... args) {
        if (transactionRepository.count() > 0) {
            log.info("Transactions database already seeded. Skipping...");
            return;
        }
        log.info("Transactions database is empty. Create transactions via the API to generate data.");
        log.info("Seed data skipped - transactions are created on demand through teller and customer operations.");
    }
}