package com.neobank.repository;

import com.neobank.model.KycDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KycDocumentRepository extends JpaRepository<KycDocument, String> {
    List<KycDocument> findByUserId(String userId);
    List<KycDocument> findByStatus(KycDocument.KycStatus status);
    List<KycDocument> findByUserIdAndStatus(String userId, KycDocument.KycStatus status);
    long countByStatus(KycDocument.KycStatus status);
}
