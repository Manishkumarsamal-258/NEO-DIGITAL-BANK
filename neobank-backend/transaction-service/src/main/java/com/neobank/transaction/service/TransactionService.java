package com.neobank.transaction.service;

import com.neobank.transaction.dto.TransferRequest;
import com.neobank.transaction.model.Transaction;
import com.neobank.transaction.repository.TransactionRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
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
        if (request.getAmount() < 1) {
            throw new RuntimeException("Minimum transfer amount is $1.00");
        }

        String ref = "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4);

        Transaction tx = Transaction.builder()
                .fromAccountId(request.getFromAccountId())
                .toAccountId(request.getToAccountNumber() != null ? request.getToAccountNumber() : request.getToBeneficiaryId())
                .userId(userId)
                .type(Transaction.TransactionType.transfer)
                .amount(request.getAmount())
                .currency("USD")
                .description(request.getDescription() != null ? request.getDescription() : "Fund transfer")
                .status(Transaction.TransactionStatus.completed)
                .reference(ref)
                .createdAt(Instant.now())
                .category("Transfer")
                .build();

        return transactionRepository.save(tx);
    }

    public Transaction createRecord(String userId, String fromAccountId, String type, Double amount, String description) {
        String ref = "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4);
        Transaction tx = Transaction.builder()
                .fromAccountId(fromAccountId)
                .userId(userId)
                .type(type.equals("deposit") ? Transaction.TransactionType.credit : Transaction.TransactionType.debit)
                .amount(amount)
                .currency("USD")
                .description(description != null ? description : (type.equals("deposit") ? "Deposit" : "Withdrawal"))
                .status(Transaction.TransactionStatus.completed)
                .reference(ref)
                .createdAt(Instant.now())
                .category(type.equals("deposit") ? "Deposit" : "Withdrawal")
                .build();
        return transactionRepository.save(tx);
    }
}