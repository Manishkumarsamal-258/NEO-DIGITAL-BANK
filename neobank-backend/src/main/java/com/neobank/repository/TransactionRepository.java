package com.neobank.repository;

import com.neobank.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT t FROM Transaction t ORDER BY t.createdAt DESC")
    List<Transaction> findAllByOrderByCreatedAtDesc();

    List<Transaction> findByStatus(Transaction.TransactionStatus status);
    List<Transaction> findByUserIdAndStatus(String userId, Transaction.TransactionStatus status);
}
