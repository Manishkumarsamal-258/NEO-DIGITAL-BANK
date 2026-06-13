package com.neobank.account.controller;

import com.neobank.account.dto.CreateAccountRequest;
import com.neobank.account.dto.TellerTransactionRequest;
import com.neobank.account.model.Account;
import com.neobank.account.service.AccountService;
import com.neobank.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teller")
public class TellerController {

    private final AccountService accountService;

    public TellerController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<Account>>> getCustomersAccounts() {
        return ResponseEntity.ok(ApiResponse.ok(accountService.getAllAccounts()));
    }

    @GetMapping("/customers/{id}/accounts")
    public ResponseEntity<ApiResponse<List<Account>>> getCustomerAccounts(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.getUserAccounts(id)));
    }

    @PostMapping("/accounts")
    public ResponseEntity<ApiResponse<Account>> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Account created.", accountService.createAccount(request)));
    }

    @PostMapping("/transactions/deposit")
    public ResponseEntity<ApiResponse<Account>> deposit(@Valid @RequestBody TellerTransactionRequest request) {
        try {
            List<Account> accounts = accountService.getUserActiveAccounts(request.getUserId());
            if (accounts.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("No active account found."));
            }
            Account updated = accountService.deposit(accounts.get(0).getId(), request.getAmount());
            return ResponseEntity.ok(ApiResponse.ok("Deposit successful.", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/transactions/withdraw")
    public ResponseEntity<ApiResponse<Account>> withdraw(@Valid @RequestBody TellerTransactionRequest request) {
        try {
            List<Account> accounts = accountService.getUserActiveAccounts(request.getUserId());
            if (accounts.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("No active account found."));
            }
            Account updated = accountService.withdraw(accounts.get(0).getId(), request.getAmount());
            return ResponseEntity.ok(ApiResponse.ok("Withdrawal successful.", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/accounts/{id}/freeze")
    public ResponseEntity<ApiResponse<Account>> toggleFreeze(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Account status updated.", accountService.toggleFreeze(id)));
    }
}