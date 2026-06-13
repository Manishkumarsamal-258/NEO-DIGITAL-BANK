package com.neobank.controller;

import com.neobank.dto.ApiResponse;
import com.neobank.dto.SelfTransactionRequest;
import com.neobank.dto.TransferRequest;
import com.neobank.model.Transaction;
import com.neobank.service.AccountService;
import com.neobank.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final AccountService accountService;

    public TransactionController(TransactionService transactionService, AccountService accountService) {
        this.transactionService = transactionService;
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Transaction>>> getMyTransactions(Authentication auth) {
        List<Transaction> txns = transactionService.getUserTransactions(auth.getName());
        return ResponseEntity.ok(ApiResponse.<List<Transaction>>builder()
                .success(true).data(txns).build());
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<Transaction>> transfer(Authentication auth,
                                                              @Valid @RequestBody TransferRequest request) {
        try {
            Transaction tx = transactionService.transfer(auth.getName(), request);
            return ResponseEntity.ok(ApiResponse.<Transaction>builder()
                    .success(true).message("Transfer completed.").data(tx).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<Transaction>> deposit(Authentication auth,
                                                             @Valid @RequestBody SelfTransactionRequest request) {
        try {
            var account = accountService.getAccountById(request.getAccountId());
            if (!account.getUserId().equals(auth.getName())) {
                return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                        .success(false).message("Account does not belong to you.").build());
            }
            Transaction tx = transactionService.createAccountTransaction(
                    auth.getName(), request.getAccountId(), request.getAmount(),
                    request.getDescription() != null ? request.getDescription() : "Self deposit",
                    com.neobank.model.Transaction.TransactionType.credit,
                    com.neobank.model.Transaction.TransactionStatus.completed
            );
            return ResponseEntity.ok(ApiResponse.<Transaction>builder()
                    .success(true).message("Deposit completed.").data(tx).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Transaction>> withdraw(Authentication auth,
                                                              @Valid @RequestBody SelfTransactionRequest request) {
        try {
            var account = accountService.getAccountById(request.getAccountId());
            if (!account.getUserId().equals(auth.getName())) {
                return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                        .success(false).message("Account does not belong to you.").build());
            }
            Transaction tx = transactionService.createAccountTransaction(
                    auth.getName(), request.getAccountId(), request.getAmount(),
                    request.getDescription() != null ? request.getDescription() : "Self withdrawal",
                    com.neobank.model.Transaction.TransactionType.debit,
                    com.neobank.model.Transaction.TransactionStatus.completed
            );
            return ResponseEntity.ok(ApiResponse.<Transaction>builder()
                    .success(true).message("Withdrawal completed.").data(tx).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }
}
