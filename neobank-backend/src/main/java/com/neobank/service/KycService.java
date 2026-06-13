package com.neobank.service;

import com.neobank.model.KycDocument;
import com.neobank.model.User;
import com.neobank.repository.KycDocumentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class KycService {

    private final KycDocumentRepository kycRepository;
    private final UserService userService;

    public KycService(KycDocumentRepository kycRepository, UserService userService) {
        this.kycRepository = kycRepository;
        this.userService = userService;
    }

    public List<KycDocument> getAllKycDocuments() {
        return kycRepository.findAll();
    }

    public List<KycDocument> getPendingKycDocuments() {
        return kycRepository.findByStatus(KycDocument.KycStatus.pending);
    }

    public List<KycDocument> getKycByUser(String userId) {
        return kycRepository.findByUserId(userId);
    }

    public KycDocument verifyKyc(String kycId, String adminUserId) {
        KycDocument doc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC document not found"));

        if (doc.getStatus() != KycDocument.KycStatus.pending) {
            throw new RuntimeException("Only pending KYC documents can be verified.");
        }

        doc.setStatus(KycDocument.KycStatus.verified);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setVerifiedBy(adminUserId);
        return kycRepository.save(doc);
    }

    public KycDocument rejectKyc(String kycId, String adminUserId, String remarks) {
        KycDocument doc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC document not found"));

        if (doc.getStatus() != KycDocument.KycStatus.pending) {
            throw new RuntimeException("Only pending KYC documents can be rejected.");
        }

        doc.setStatus(KycDocument.KycStatus.rejected);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setVerifiedBy(adminUserId);
        doc.setRemarks(remarks != null ? remarks : "Rejected by admin");
        return kycRepository.save(doc);
    }

    public KycDocument submitKyc(String userId, String documentType, String documentNumber,
                                  String documentImageUrl) {
        // Check if user exists
        userService.getUserById(userId);

        KycDocument.DocumentType type;
        try {
            type = KycDocument.DocumentType.valueOf(documentType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid document type. Valid types: AADHAR, PAN, VOTER_ID, DRIVING_LICENSE, PASSPORT");
        }

        // New submission — set to pending for admin review
        KycDocument doc = KycDocument.builder()
                .userId(userId)
                .documentType(type)
                .documentNumber(documentNumber)
                .documentImageUrl(documentImageUrl)
                .status(KycDocument.KycStatus.pending)
                .submittedAt(LocalDateTime.now())
                .build();

        return kycRepository.save(doc);
    }

    public StatusCount getStatusCounts() {
        return new StatusCount(
                kycRepository.countByStatus(KycDocument.KycStatus.pending),
                kycRepository.countByStatus(KycDocument.KycStatus.verified),
                kycRepository.countByStatus(KycDocument.KycStatus.rejected)
        );
    }

    public static class StatusCount {
        private long pending;
        private long verified;
        private long rejected;

        public StatusCount(long pending, long verified, long rejected) {
            this.pending = pending;
            this.verified = verified;
            this.rejected = rejected;
        }

        public long getPending() { return pending; }
        public long getVerified() { return verified; }
        public long getRejected() { return rejected; }
    }
}
