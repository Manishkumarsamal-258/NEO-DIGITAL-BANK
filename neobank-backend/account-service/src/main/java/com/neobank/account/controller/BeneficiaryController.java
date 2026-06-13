package com.neobank.account.controller;

import com.neobank.account.model.Beneficiary;
import com.neobank.account.service.BeneficiaryService;
import com.neobank.common.ApiResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) { this.beneficiaryService = beneficiaryService; }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Beneficiary>>> getMyBeneficiaries(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(beneficiaryService.getUserBeneficiaries(auth.getName())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Beneficiary>> createBeneficiary(Authentication auth, @RequestBody Beneficiary request) {
        return ResponseEntity.ok(ApiResponse.ok("Beneficiary added.", beneficiaryService.createBeneficiary(auth.getName(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Beneficiary>> updateBeneficiary(@PathVariable String id, @RequestBody Beneficiary request) {
        return ResponseEntity.ok(ApiResponse.ok("Beneficiary updated.", beneficiaryService.updateBeneficiary(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(@PathVariable String id) {
        beneficiaryService.deleteBeneficiary(id);
        return ResponseEntity.ok(ApiResponse.ok("Beneficiary removed.", null));
    }
}