package com.neobank.transaction.controller;

import com.neobank.common.ApiResponse;
import com.neobank.transaction.dto.TransferRequest;
import com.neobank.transaction.model.Transaction;
import com.neobank.transaction.service.TransactionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) { this.transactionService = transactionService; }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Transaction>>> getMyTransactions(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getUserTransactions(auth.getName())));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Transaction>> transfer(Authentication auth, @Valid @RequestBody TransferRequest request) {
        try {
            Transaction tx = transactionService.transfer(auth.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Transfer completed.", tx));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}