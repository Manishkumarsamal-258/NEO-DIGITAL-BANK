package com.neobank.transaction.repository;

import com.neobank.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Transaction> findAllByOrderByCreatedAtDesc();
    List<Transaction> findByStatus(Transaction.TransactionStatus status);
}