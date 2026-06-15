package com.neobank.controller;

import com.neobank.dto.ApiResponse;
import com.neobank.model.Account;
import com.neobank.model.User;
import com.neobank.repository.UserRepository;
import com.neobank.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final UserRepository userRepository;

    public AccountController(AccountService accountService, UserRepository userRepository) {
        this.accountService = accountService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Account>>> getMyAccounts(Authentication auth) {
        List<Account> accounts = accountService.getUserAccounts(auth.getName());
        return ResponseEntity.ok(ApiResponse.<List<Account>>builder()
                .success(true).data(accounts).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Account>> getAccount(@PathVariable String id) {
        Account account = accountService.getAccountById(id);
        return ResponseEntity.ok(ApiResponse.<Account>builder()
                .success(true).data(account).build());
    }

    @GetMapping("/lookup/{accountNumber}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> lookupAccount(@PathVariable String accountNumber) {
        try {
            Account account = accountService.findByAccountNumber(accountNumber);
            User owner = userRepository.findById(account.getUserId())
                    .orElse(null);

            Map<String, Object> data = new HashMap<>();
            data.put("account", account);
            data.put("ownerName", owner != null ? owner.getName() : "Unknown");
            data.put("ownerEmail", owner != null ? owner.getEmail() : "Unknown");

            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true).data(data).build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<Map<String, Object>>builder()
                            .success(false).message("Account not found.").build());
        }
    }
}
