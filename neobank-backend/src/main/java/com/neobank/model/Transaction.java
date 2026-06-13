package com.neobank.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String fromAccountId;

    private String toAccountId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private Instant createdAt;

    private String beneficiaryName;

    @Column(nullable = false)
    private String category;

    public enum TransactionType { credit, debit, transfer }
    public enum TransactionStatus { completed, pending, failed, processing }

    public Transaction() {}

    public Transaction(String id, String fromAccountId, String toAccountId, String userId, TransactionType type,
                       Double amount, String currency, String description, TransactionStatus status,
                       String reference, Instant createdAt, String beneficiaryName, String category) {
        this.id = id; this.fromAccountId = fromAccountId; this.toAccountId = toAccountId; this.userId = userId;
        this.type = type; this.amount = amount; this.currency = currency; this.description = description;
        this.status = status; this.reference = reference; this.createdAt = createdAt;
        this.beneficiaryName = beneficiaryName; this.category = category;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(String fromAccountId) { this.fromAccountId = fromAccountId; }
    public String getToAccountId() { return toAccountId; }
    public void setToAccountId(String toAccountId) { this.toAccountId = toAccountId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String id; private String fromAccountId; private String toAccountId; private String userId;
        private TransactionType type; private Double amount; private String currency; private String description;
        private TransactionStatus status; private String reference; private Instant createdAt;
        private String beneficiaryName; private String category;

        public Builder id(String id) { this.id = id; return this; }
        public Builder fromAccountId(String fromAccountId) { this.fromAccountId = fromAccountId; return this; }
        public Builder toAccountId(String toAccountId) { this.toAccountId = toAccountId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder type(TransactionType type) { this.type = type; return this; }
        public Builder amount(Double amount) { this.amount = amount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(TransactionStatus status) { this.status = status; return this; }
        public Builder reference(String reference) { this.reference = reference; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder beneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Transaction build() { return new Transaction(id, fromAccountId, toAccountId, userId, type, amount, currency, description, status, reference, createdAt, beneficiaryName, category); }
    }
}
