package com.neobank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_documents")
public class KycDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    @Column(nullable = false)
    private String documentNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private KycStatus status;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime verifiedAt;

    private String verifiedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String documentImageUrl;

    public enum DocumentType {
        AADHAR, PAN, VOTER_ID, DRIVING_LICENSE, PASSPORT
    }

    public enum KycStatus {
        pending, verified, rejected
    }

    public KycDocument() {}

    public KycDocument(String id, String userId, DocumentType documentType, String documentNumber,
                       String documentImageUrl, KycStatus status, LocalDateTime submittedAt,
                       LocalDateTime verifiedAt, String verifiedBy, String remarks) {
        this.id = id;
        this.userId = userId;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.documentImageUrl = documentImageUrl;
        this.status = status;
        this.submittedAt = submittedAt;
        this.verifiedAt = verifiedAt;
        this.verifiedBy = verifiedBy;
        this.remarks = remarks;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public String getDocumentImageUrl() { return documentImageUrl; }
    public void setDocumentImageUrl(String documentImageUrl) { this.documentImageUrl = documentImageUrl; }
    public KycStatus getStatus() { return status; }
    public void setStatus(KycStatus status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String userId;
        private DocumentType documentType;
        private String documentNumber;
        private String documentImageUrl;
        private KycStatus status;
        private LocalDateTime submittedAt;
        private LocalDateTime verifiedAt;
        private String verifiedBy;
        private String remarks;

        public Builder id(String id) { this.id = id; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder documentType(DocumentType documentType) { this.documentType = documentType; return this; }
        public Builder documentNumber(String documentNumber) { this.documentNumber = documentNumber; return this; }
        public Builder documentImageUrl(String documentImageUrl) { this.documentImageUrl = documentImageUrl; return this; }
        public Builder status(KycStatus status) { this.status = status; return this; }
        public Builder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public Builder verifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; return this; }
        public Builder verifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }
        public KycDocument build() {
            return new KycDocument(id, userId, documentType, documentNumber, documentImageUrl,
                    status, submittedAt, verifiedAt, verifiedBy, remarks);
        }
    }
}
