package com.neobank.controller;

import com.neobank.dto.ApiResponse;
import com.neobank.model.Account;
import com.neobank.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
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
}
