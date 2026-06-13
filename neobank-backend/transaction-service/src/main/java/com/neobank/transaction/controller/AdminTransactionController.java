package com.neobank.transaction.controller;

import com.neobank.common.ApiResponse;
import com.neobank.transaction.model.Transaction;
import com.neobank.transaction.service.TransactionService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminTransactionController {

    private final TransactionService transactionService;

    public AdminTransactionController(TransactionService transactionService) { this.transactionService = transactionService; }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<Transaction>>> getAllTransactions() {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getAllTransactions()));
    }

    @GetMapping("/transactions/failed")
    public ResponseEntity<ApiResponse<List<Transaction>>> getFailedTransactions() {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getFailedTransactions()));
    }
}