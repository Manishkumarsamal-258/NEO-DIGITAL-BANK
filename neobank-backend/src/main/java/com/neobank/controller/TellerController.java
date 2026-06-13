package com.neobank.controller;

import com.neobank.dto.*;
import com.neobank.model.Account;
import com.neobank.model.Transaction;
import com.neobank.model.User;
import com.neobank.service.AccountService;
import com.neobank.service.TransactionService;
import com.neobank.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teller")
public class TellerController {

    private final UserService userService;
    private final AccountService accountService;
    private final TransactionService transactionService;

    public TellerController(UserService userService, AccountService accountService,
                            TransactionService transactionService) {
        this.userService = userService;
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<User>>> getCustomers() {
        List<User> customers = userService.getAllUsers().stream()
                .filter(u -> u.getRole() == User.UserRole.customer)
                .toList();
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                .success(true).data(customers).build());
    }

    @GetMapping("/customers/{id}/accounts")
    public ResponseEntity<ApiResponse<List<Account>>> getCustomerAccounts(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.<List<Account>>builder()
                .success(true).data(accountService.getUserAccounts(id)).build());
    }

    @PostMapping("/accounts")
    public ResponseEntity<ApiResponse<Account>> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        Account account = accountService.createAccount(request);
        return ResponseEntity.ok(ApiResponse.<Account>builder()
                .success(true).message("Account created.").data(account).build());
    }

    @PostMapping("/transactions/deposit")
    public ResponseEntity<ApiResponse<Transaction>> deposit(@Valid @RequestBody TellerTransactionRequest request) {
        try {
            String accountId = request.getAccountId();
            if (accountId == null || accountId.isBlank()) {
                // Fallback to first active account
                List<Account> accounts = accountService.getUserActiveAccounts(request.getUserId());
                if (accounts.isEmpty()) {
                    return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                            .success(false).message("No active account found.").build());
                }
                accountId = accounts.get(0).getId();
            }
            accountService.deposit(accountId, request.getAmount());
            Transaction tx = transactionService.createAccountTransaction(
                    request.getUserId(), accountId, request.getAmount(), request.getDescription(),
                    com.neobank.model.Transaction.TransactionType.credit,
                    com.neobank.model.Transaction.TransactionStatus.completed);
            return ResponseEntity.ok(ApiResponse.<Transaction>builder()
                    .success(true).message("Deposit successful.").data(tx).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    @PostMapping("/transactions/withdraw")
    public ResponseEntity<ApiResponse<Transaction>> withdraw(@Valid @RequestBody TellerTransactionRequest request) {
        try {
            String accountId = request.getAccountId();
            if (accountId == null || accountId.isBlank()) {
                // Fallback to first active account
                List<Account> accounts = accountService.getUserActiveAccounts(request.getUserId());
                if (accounts.isEmpty()) {
                    return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                            .success(false).message("No active account found.").build());
                }
                accountId = accounts.get(0).getId();
            }
            accountService.withdraw(accountId, request.getAmount());
            Transaction tx = transactionService.createAccountTransaction(
                    request.getUserId(), accountId, request.getAmount(), request.getDescription(),
                    com.neobank.model.Transaction.TransactionType.debit,
                    com.neobank.model.Transaction.TransactionStatus.completed);
            return ResponseEntity.ok(ApiResponse.<Transaction>builder()
                    .success(true).message("Withdrawal successful.").data(tx).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Transaction>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    @PutMapping("/accounts/{id}/freeze")
    public ResponseEntity<ApiResponse<Account>> toggleFreeze(@PathVariable String id) {
        Account account = accountService.toggleFreeze(id);
        return ResponseEntity.ok(ApiResponse.<Account>builder()
                .success(true).message("Account status updated.").data(account).build());
    }
}
