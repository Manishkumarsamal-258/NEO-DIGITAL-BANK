package com.neobank.config;

import com.neobank.model.*;
import com.neobank.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final KycDocumentRepository kycRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, AccountRepository accountRepository,
                      TransactionRepository transactionRepository, BeneficiaryRepository beneficiaryRepository,
                      KycDocumentRepository kycRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.kycRepository = kycRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }

        log.info("Seeding database with initial data...");

        User alice = saveUser("Alice Johnson", "alice@neobank.com", "password123",
                User.UserRole.customer, "+1 (555) 234-5678", "123 Maple Street, New York, NY 10001", "AJ");
        User bob = saveUser("Bob Martinez", "bob@neobank.com", "password123",
                User.UserRole.customer, "+1 (555) 345-6789", "456 Oak Avenue, Los Angeles, CA 90001", "BM");
        User sarah = saveUser("Sarah Chen", "teller@neobank.com", "teller123",
                User.UserRole.teller, "+1 (555) 456-7890", "789 Pine Road, Chicago, IL 60601", "SC");
        User michael = saveUser("Michael Brown", "admin@neobank.com", "admin123",
                User.UserRole.admin, "+1 (555) 567-8901", "321 Elm Street, Houston, TX 77001", "MB");
        User emma = saveUser("Emma Wilson", "emma@neobank.com", "password123",
                User.UserRole.customer, "+1 (555) 678-9012", "654 Birch Lane, Phoenix, AZ 85001", "EW");
        emma.setStatus(User.UserStatus.suspended);
        userRepository.save(emma);
        User akash = saveUser("Akash Kumar", "akash@neobank.com", "password123",
                User.UserRole.customer, "+1 (555) 789-0123", "987 Cedar Drive, San Francisco, CA 94101", "AK");

        Account acc1 = saveAccount(alice.getId(), "4521-8736-1092-3847",
                Account.AccountType.savings, 1850000.50, "INR", 3.5);
        Account acc2 = saveAccount(alice.getId(), "7834-2901-5647-8312",
                Account.AccountType.checking, 625000.75, "INR", 0.5);
        Account acc3 = saveAccount(bob.getId(), "1234-5678-9012-3456",
                Account.AccountType.savings, 1150000.00, "INR", 3.5);
        Account acc4 = saveAccount(emma.getId(), "9876-5432-1098-7654",
                Account.AccountType.checking, 95000.00, "INR", 0.5);
        acc4.setStatus(Account.AccountStatus.frozen);
        accountRepository.save(acc4);
        Account acc5 = saveAccount(akash.getId(), "9368-4350-2662-4153",
                Account.AccountType.savings, 5000.00, "INR", 3.5);

        saveBeneficiary(alice.getId(), "Bob Martinez", "1234-5678-9012-3456",
                "NeoBank", "NEOB0001234", "Bob");
        saveBeneficiary(alice.getId(), "Emma Wilson", "9876-5432-1098-7654",
                "NeoBank", "NEOB0005678", "Emma");
        saveBeneficiary(alice.getId(), "Chase Bank Rent", "4567-8901-2345-6789",
                "Chase Bank", "CHAS0009876", "Landlord");
        saveBeneficiary(bob.getId(), "Alice Johnson", "4521-8736-1092-3847",
                "NeoBank", "NEOB0001111", "Alice");

        saveTransaction(acc1.getId(), acc3.getId(), alice.getId(),
                Transaction.TransactionType.transfer, 75000.00, "Rent payment - June",
                Transaction.TransactionStatus.completed, "TXN20240601001",
                Instant.parse("2024-06-01T10:30:00Z"), "Bob Martinez", "Housing");
        saveTransaction(acc1.getId(), null, alice.getId(),
                Transaction.TransactionType.debit, 12500.80, "Grocery Store - Reliance Fresh",
                Transaction.TransactionStatus.completed, "TXN20240602001",
                Instant.parse("2024-06-02T14:20:00Z"), null, "Groceries");
        saveTransaction(null, acc1.getId(), alice.getId(),
                Transaction.TransactionType.credit, 350000.00, "Salary deposit - May 2024",
                Transaction.TransactionStatus.completed, "TXN20240605001",
                Instant.parse("2024-06-05T09:00:00Z"), null, "Income");
        saveTransaction(acc1.getId(), acc3.getId(), alice.getId(),
                Transaction.TransactionType.transfer, 50000.00, "Loan repayment",
                Transaction.TransactionStatus.failed, "TXN20240607001",
                Instant.parse("2024-06-07T16:45:00Z"), "Bob Martinez", "Finance");
        saveTransaction(acc1.getId(), null, alice.getId(),
                Transaction.TransactionType.debit, 6500.99, "Netflix subscription",
                Transaction.TransactionStatus.completed, "TXN20240608001",
                Instant.parse("2024-06-08T00:00:00Z"), null, "Entertainment");
        saveTransaction(acc1.getId(), acc4.getId(), alice.getId(),
                Transaction.TransactionType.transfer, 15000.00, "Gift for Emma",
                Transaction.TransactionStatus.processing, "TXN20240610001",
                Instant.parse("2024-06-10T11:15:00Z"), "Emma Wilson", "Personal");
        saveTransaction(acc3.getId(), acc1.getId(), bob.getId(),
                Transaction.TransactionType.transfer, 35000.00, "Shared expense reimbursement",
                Transaction.TransactionStatus.completed, "TXN20240609001",
                Instant.parse("2024-06-09T13:30:00Z"), "Alice Johnson", "Personal");
        saveTransaction(acc3.getId(), null, bob.getId(),
                Transaction.TransactionType.debit, 85000.00, "Laptop purchase - Amazon.in",
                Transaction.TransactionStatus.completed, "TXN20240611001",
                Instant.parse("2024-06-11T15:00:00Z"), null, "Electronics");
        saveTransaction(acc3.getId(), acc1.getId(), bob.getId(),
                Transaction.TransactionType.transfer, 60000.00, "Business payment",
                Transaction.TransactionStatus.failed, "TXN20240611002",
                Instant.parse("2024-06-11T17:30:00Z"), "Alice Johnson", "Business");
        saveTransaction(null, acc1.getId(), alice.getId(),
                Transaction.TransactionType.credit, 25000.00, "Freelance payment - Upwork",
                Transaction.TransactionStatus.completed, "TXN20240612001",
                Instant.parse("2024-06-12T08:45:00Z"), null, "Income");

        // ── Seed KYC documents ──────────────────────────────────────────────
        saveKyc(alice.getId(), KycDocument.DocumentType.AADHAR, "1234-5678-9012",
                KycDocument.KycStatus.verified, LocalDateTime.now().minusDays(30),
                michael.getId(), null);
        saveKyc(alice.getId(), KycDocument.DocumentType.PAN, "ABCDE1234F",
                KycDocument.KycStatus.verified, LocalDateTime.now().minusDays(25),
                michael.getId(), null);
        saveKyc(bob.getId(), KycDocument.DocumentType.AADHAR, "9876-5432-1098",
                KycDocument.KycStatus.pending, LocalDateTime.now().minusDays(5),
                null, null);
        saveKyc(bob.getId(), KycDocument.DocumentType.DRIVING_LICENSE, "DL-2024-987654",
                KycDocument.KycStatus.pending, LocalDateTime.now().minusDays(3),
                null, null);
        saveKyc(emma.getId(), KycDocument.DocumentType.PAN, "XYZPD8901G",
                KycDocument.KycStatus.rejected, LocalDateTime.now().minusDays(15),
                michael.getId(), "Document number does not match with government records. Please re-submit with correct PAN.");

        log.info("Database seeded successfully with {} users, {} accounts, {} beneficiaries, {} transactions, {} kyc docs.",
                userRepository.count(), accountRepository.count(),
                beneficiaryRepository.count(), transactionRepository.count(), kycRepository.count());
    }

    private User saveUser(String name, String email, String password,
                          User.UserRole role, String phone, String address, String initials) {
        return userRepository.save(User.builder()
                .name(name).email(email).password(passwordEncoder.encode(password))
                .role(role).phone(phone).address(address)
                .createdAt(LocalDate.now()).status(User.UserStatus.active)
                .avatarInitials(initials).build());
    }

    private Account saveAccount(String userId, String accountNumber,
                                Account.AccountType type, double balance, String currency, double interestRate) {
        return accountRepository.save(Account.builder()
                .userId(userId).accountNumber(accountNumber).accountType(type)
                .balance(balance).currency(currency).status(Account.AccountStatus.active)
                .createdAt(LocalDate.now()).interestRate(interestRate).build());
    }

    private Beneficiary saveBeneficiary(String userId, String name, String accountNumber,
                                        String bankName, String ifscCode, String nickname) {
        return beneficiaryRepository.save(Beneficiary.builder()
                .userId(userId).name(name).accountNumber(accountNumber)
                .bankName(bankName).ifscCode(ifscCode).nickname(nickname)
                .addedAt(LocalDate.now()).build());
    }

    private void saveKyc(String userId, KycDocument.DocumentType documentType, String documentNumber,
                           KycDocument.KycStatus status, LocalDateTime submittedAt,
                           String verifiedBy, String remarks) {
        kycRepository.save(KycDocument.builder()
                .userId(userId).documentType(documentType).documentNumber(documentNumber)
                .status(status).submittedAt(submittedAt)
                .verifiedAt(status != KycDocument.KycStatus.pending ? LocalDateTime.now() : null)
                .verifiedBy(verifiedBy).remarks(remarks)
                .documentImageUrl("/uploads/kyc/" + userId + "_" + documentType.name().toLowerCase() + ".jpg")
                .build());
    }

    private Transaction saveTransaction(String fromAccountId, String toAccountId, String userId,
                                        Transaction.TransactionType type, double amount, String description,
                                        Transaction.TransactionStatus status, String reference,
                                        Instant createdAt, String beneficiaryName, String category) {
        return transactionRepository.save(Transaction.builder()
                .fromAccountId(fromAccountId).toAccountId(toAccountId).userId(userId)
                .type(type).amount(amount).currency("INR").description(description)
                .status(status).reference(reference).createdAt(createdAt)
                .beneficiaryName(beneficiaryName).category(category).build());
    }
}
