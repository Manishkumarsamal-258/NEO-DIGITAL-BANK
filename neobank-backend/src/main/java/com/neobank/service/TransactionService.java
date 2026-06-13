package com.neobank.service;

import com.neobank.dto.TransferRequest;
import com.neobank.model.Account;
import com.neobank.model.Beneficiary;
import com.neobank.model.Transaction;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.BeneficiaryRepository;
import com.neobank.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              BeneficiaryRepository beneficiaryRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
    }

    public List<Transaction> getUserTransactions(String userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Transaction> getFailedTransactions() {
        return transactionRepository.findByStatus(Transaction.TransactionStatus.failed);
    }

    @Transactional
    public Transaction transfer(String userId, TransferRequest request) {
        Account fromAccount = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        if (fromAccount.getStatus() != Account.AccountStatus.active) {
            throw new RuntimeException("Source account is not active.");
        }

        if (request.getAmount() > fromAccount.getBalance()) {
            throw new RuntimeException("Insufficient funds.");
        }

        if (request.getAmount() < 1) {
            throw new RuntimeException("Minimum transfer amount is $1.00");
        }

        String targetAccountNumber = null;
        String beneficiaryName = null;

        if (request.getToBeneficiaryId() != null && !request.getToBeneficiaryId().isEmpty()) {
            Beneficiary ben = beneficiaryRepository.findById(request.getToBeneficiaryId())
                    .orElseThrow(() -> new RuntimeException("Beneficiary not found"));
            targetAccountNumber = ben.getAccountNumber();
            beneficiaryName = ben.getName();
        } else if (request.getToAccountNumber() != null && !request.getToAccountNumber().isEmpty()) {
            targetAccountNumber = request.getToAccountNumber();
            beneficiaryName = request.getToAccountNumber();
        } else {
            throw new RuntimeException("No target account specified.");
        }

        fromAccount.setBalance(fromAccount.getBalance() - request.getAmount());
        accountRepository.save(fromAccount);

        String ref = "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4);

        Transaction tx = Transaction.builder()
                .fromAccountId(request.getFromAccountId())
                .toAccountId(targetAccountNumber)
                .userId(userId)
                .type(Transaction.TransactionType.transfer)
                .amount(request.getAmount())
                .currency("INR")
                .description(request.getDescription() != null ? request.getDescription() : "Fund transfer")
                .status(Transaction.TransactionStatus.completed)
                .reference(ref)
                .createdAt(Instant.now())
                .beneficiaryName(beneficiaryName)
                .category("Transfer")
                .build();

        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction createAccountTransaction(String userId, String accountId, Double amount, String description,
                                                Transaction.TransactionType type, Transaction.TransactionStatus status) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getStatus() != Account.AccountStatus.active) {
            throw new RuntimeException("Account is not active.");
        }

        if (type == Transaction.TransactionType.debit && amount > account.getBalance()) {
            throw new RuntimeException("Insufficient balance.");
        }

        if (type == Transaction.TransactionType.credit) {
            account.setBalance(account.getBalance() + amount);
        } else {
            account.setBalance(account.getBalance() - amount);
        }
        accountRepository.save(account);

        String ref = "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4);
        String desc = description != null ? description : (type == Transaction.TransactionType.credit ? "Deposit" : "Withdrawal");

        Transaction tx = Transaction.builder()
                .fromAccountId(account.getId())
                .userId(userId)
                .type(type)
                .amount(amount)
                .currency("INR")
                .description(desc)
                .status(status)
                .reference(ref)
                .createdAt(Instant.now())
                .category(type == Transaction.TransactionType.credit ? "Deposit" : "Withdrawal")
                .build();

        return transactionRepository.save(tx);
    }
}
