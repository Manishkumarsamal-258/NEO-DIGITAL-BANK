package com.neobank.account.controller;

import com.neobank.account.model.Account;
import com.neobank.account.service.AccountService;
import com.neobank.common.ApiResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) { this.accountService = accountService; }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Account>>> getMyAccounts(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.getUserAccounts(auth.getName())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Account>> getAccount(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.getAccountById(id)));
    }
}