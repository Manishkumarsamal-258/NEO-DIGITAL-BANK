package com.neobank.controller;

import com.neobank.dto.ApiResponse;
import com.neobank.model.KycDocument;
import com.neobank.model.User;
import com.neobank.model.Account;
import com.neobank.model.Transaction;
import com.neobank.service.AccountService;
import com.neobank.service.KycService;
import com.neobank.service.TransactionService;
import com.neobank.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final AccountService accountService;
    private final TransactionService transactionService;
    private final KycService kycService;

    public AdminController(UserService userService, AccountService accountService,
                           TransactionService transactionService, KycService kycService) {
        this.userService = userService;
        this.accountService = accountService;
        this.transactionService = transactionService;
        this.kycService = kycService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                .success(true).data(userService.getAllUsers()).build());
    }

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<Account>>> getAllAccounts() {
        return ResponseEntity.ok(ApiResponse.<List<Account>>builder()
                .success(true).data(accountService.getAllAccounts()).build());
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<Transaction>>> getAllTransactions() {
        return ResponseEntity.ok(ApiResponse.<List<Transaction>>builder()
                .success(true).data(transactionService.getAllTransactions()).build());
    }

    @GetMapping("/transactions/failed")
    public ResponseEntity<ApiResponse<List<Transaction>>> getFailedTransactions() {
        return ResponseEntity.ok(ApiResponse.<List<Transaction>>builder()
                .success(true).data(transactionService.getFailedTransactions()).build());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable String id) {
        User user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true).message("User status updated.").data(user).build());
    }

    // ── KYC Endpoints ──────────────────────────────────────────────────────

    @GetMapping("/kyc")
    public ResponseEntity<ApiResponse<List<KycDocument>>> getAllKyc() {
        return ResponseEntity.ok(ApiResponse.<List<KycDocument>>builder()
                .success(true).data(kycService.getAllKycDocuments()).build());
    }

    @GetMapping("/kyc/pending")
    public ResponseEntity<ApiResponse<List<KycDocument>>> getPendingKyc() {
        return ResponseEntity.ok(ApiResponse.<List<KycDocument>>builder()
                .success(true).data(kycService.getPendingKycDocuments()).build());
    }

    @GetMapping("/kyc/user/{userId}")
    public ResponseEntity<ApiResponse<List<KycDocument>>> getKycByUser(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.<List<KycDocument>>builder()
                .success(true).data(kycService.getKycByUser(userId)).build());
    }

    @GetMapping("/kyc/stats")
    public ResponseEntity<ApiResponse<KycService.StatusCount>> getKycStats() {
        return ResponseEntity.ok(ApiResponse.<KycService.StatusCount>builder()
                .success(true).data(kycService.getStatusCounts()).build());
    }

    @PostMapping("/kyc/verify/{kycId}")
    public ResponseEntity<ApiResponse<KycDocument>> verifyKyc(@PathVariable String kycId,
                                                                Authentication auth) {
        try {
            KycDocument doc = kycService.verifyKyc(kycId, auth.getName());
            return ResponseEntity.ok(ApiResponse.<KycDocument>builder()
                    .success(true).message("KYC document verified successfully.").data(doc).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<KycDocument>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    @PostMapping("/kyc/reject/{kycId}")
    public ResponseEntity<ApiResponse<KycDocument>> rejectKyc(@PathVariable String kycId,
                                                               @RequestBody(required = false) Map<String, String> body,
                                                               Authentication auth) {
        try {
            String remarks = (body != null) ? body.getOrDefault("remarks", "Rejected by admin") : "Rejected by admin";
            KycDocument doc = kycService.rejectKyc(kycId, auth.getName(), remarks);
            return ResponseEntity.ok(ApiResponse.<KycDocument>builder()
                    .success(true).message("KYC document rejected.").data(doc).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<KycDocument>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    @PostMapping("/kyc/submit")
    public ResponseEntity<ApiResponse<KycDocument>> submitKyc(@RequestBody Map<String, String> body) {
        try {
            String userId = body.get("userId");
            String documentType = body.get("documentType");
            String documentNumber = body.get("documentNumber");
            String documentImageUrl = body.get("documentImageUrl");

            if (userId == null || documentType == null || documentNumber == null) {
                return ResponseEntity.badRequest().body(ApiResponse.<KycDocument>builder()
                        .success(false).message("userId, documentType, and documentNumber are required.").build());
            }

            KycDocument doc = kycService.submitKyc(userId, documentType, documentNumber, documentImageUrl);
            return ResponseEntity.ok(ApiResponse.<KycDocument>builder()
                    .success(true).message("KYC document submitted for verification.").data(doc).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<KycDocument>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }
}
