package com.neobank.controller;

import com.neobank.dto.ApiResponse;
import com.neobank.model.Beneficiary;
import com.neobank.service.BeneficiaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Beneficiary>>> getMyBeneficiaries(Authentication auth) {
        List<Beneficiary> beneficiaries = beneficiaryService.getUserBeneficiaries(auth.getName());
        return ResponseEntity.ok(ApiResponse.<List<Beneficiary>>builder()
                .success(true).data(beneficiaries).build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Beneficiary>> createBeneficiary(Authentication auth,
                                                                       @RequestBody Beneficiary request) {
        Beneficiary beneficiary = beneficiaryService.createBeneficiary(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.<Beneficiary>builder()
                .success(true).message("Beneficiary added.").data(beneficiary).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Beneficiary>> updateBeneficiary(@PathVariable String id,
                                                                       @RequestBody Beneficiary request) {
        Beneficiary beneficiary = beneficiaryService.updateBeneficiary(id, request);
        return ResponseEntity.ok(ApiResponse.<Beneficiary>builder()
                .success(true).message("Beneficiary updated.").data(beneficiary).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(@PathVariable String id) {
        beneficiaryService.deleteBeneficiary(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Beneficiary removed.").build());
    }
}
