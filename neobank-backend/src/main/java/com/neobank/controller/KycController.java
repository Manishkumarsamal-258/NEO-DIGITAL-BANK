package com.neobank.controller;

import com.neobank.dto.ApiResponse;
import com.neobank.model.KycDocument;
import com.neobank.service.KycService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kyc")
public class KycController {

    private final KycService kycService;

    public KycController(KycService kycService) {
        this.kycService = kycService;
    }

    /**
     * Customer-facing KYC submission with auto-verification.
     * When a customer uploads a document, it's automatically verified and marked as completed.
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<KycDocument>> submitKyc(@RequestBody Map<String, String> body,
                                                                Authentication auth) {
        try {
            String userId = auth.getName();
            String documentType = body.get("documentType");
            String documentNumber = body.get("documentNumber");
            String documentImageUrl = body.get("documentImageUrl");

            if (documentType == null || documentNumber == null) {
                return ResponseEntity.badRequest().body(ApiResponse.<KycDocument>builder()
                        .success(false).message("documentType and documentNumber are required.").build());
            }

            KycDocument doc = kycService.submitKyc(userId, documentType, documentNumber, documentImageUrl);
            return ResponseEntity.ok(ApiResponse.<KycDocument>builder()
                    .success(true).message("KYC submitted successfully! Your identity has been verified.").data(doc).build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<KycDocument>builder()
                    .success(false).message(e.getMessage()).build());
        }
    }

    /**
     * Get all KYC documents for the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<KycDocument>>> getMyKyc(Authentication auth) {
        List<KycDocument> docs = kycService.getKycByUser(auth.getName());
        return ResponseEntity.ok(ApiResponse.<List<KycDocument>>builder()
                .success(true).data(docs).build());
    }

    /**
     * Get KYC verification status for the authenticated user.
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getKycStatus(Authentication auth) {
        List<KycDocument> docs = kycService.getKycByUser(auth.getName());
        boolean verified = docs.stream().anyMatch(d -> d.getStatus() == KycDocument.KycStatus.verified);
        boolean pending = docs.stream().anyMatch(d -> d.getStatus() == KycDocument.KycStatus.pending);
        boolean rejected = docs.stream().anyMatch(d -> d.getStatus() == KycDocument.KycStatus.rejected);
        long docCount = docs.size();

        // Find rejection reason if any document was rejected
        String rejectionReason = docs.stream()
                .filter(d -> d.getStatus() == KycDocument.KycStatus.rejected)
                .findFirst()
                .map(KycDocument::getRemarks)
                .orElse(null);

        String statusLabel;
        if (verified) {
            statusLabel = "verified";
        } else if (pending) {
            statusLabel = "pending";
        } else if (rejected) {
            statusLabel = "rejected";
        } else {
            statusLabel = "not_submitted";
        }

        Map<String, Object> status = new HashMap<>(Map.of(
                "verified", verified,
                "pending", pending,
                "rejected", rejected,
                "documentsCount", docCount,
                "status", statusLabel
        ));
        if (rejectionReason != null) {
            status.put("rejectionReason", rejectionReason);
        }

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true).data(status).build());
    }
}
