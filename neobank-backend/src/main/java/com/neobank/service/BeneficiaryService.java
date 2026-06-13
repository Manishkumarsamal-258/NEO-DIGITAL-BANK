package com.neobank.service;

import com.neobank.model.Beneficiary;
import com.neobank.repository.BeneficiaryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
    }

    public List<Beneficiary> getUserBeneficiaries(String userId) {
        return beneficiaryRepository.findByUserId(userId);
    }

    public Beneficiary createBeneficiary(String userId, Beneficiary request) {
        Beneficiary beneficiary = Beneficiary.builder()
                .userId(userId)
                .name(request.getName())
                .accountNumber(request.getAccountNumber())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .nickname(request.getNickname() != null ? request.getNickname() : request.getName())
                .addedAt(LocalDate.now())
                .build();
        return beneficiaryRepository.save(beneficiary);
    }

    public Beneficiary updateBeneficiary(String id, Beneficiary request) {
        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));
        if (request.getName() != null) beneficiary.setName(request.getName());
        if (request.getAccountNumber() != null) beneficiary.setAccountNumber(request.getAccountNumber());
        if (request.getBankName() != null) beneficiary.setBankName(request.getBankName());
        if (request.getIfscCode() != null) beneficiary.setIfscCode(request.getIfscCode());
        if (request.getNickname() != null) beneficiary.setNickname(request.getNickname());
        return beneficiaryRepository.save(beneficiary);
    }

    public void deleteBeneficiary(String id) {
        beneficiaryRepository.deleteById(id);
    }
}
