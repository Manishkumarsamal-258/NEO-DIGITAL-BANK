package com.neobank.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "beneficiaries")
public class Beneficiary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private String bankName;

    private String ifscCode;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private LocalDate addedAt;

    public Beneficiary() {}

    public Beneficiary(String id, String userId, String name, String accountNumber, String bankName,
                       String ifscCode, String nickname, LocalDate addedAt) {
        this.id = id; this.userId = userId; this.name = name; this.accountNumber = accountNumber;
        this.bankName = bankName; this.ifscCode = ifscCode; this.nickname = nickname; this.addedAt = addedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public LocalDate getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDate addedAt) { this.addedAt = addedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String id; private String userId; private String name; private String accountNumber;
        private String bankName; private String ifscCode; private String nickname; private LocalDate addedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder accountNumber(String accountNumber) { this.accountNumber = accountNumber; return this; }
        public Builder bankName(String bankName) { this.bankName = bankName; return this; }
        public Builder ifscCode(String ifscCode) { this.ifscCode = ifscCode; return this; }
        public Builder nickname(String nickname) { this.nickname = nickname; return this; }
        public Builder addedAt(LocalDate addedAt) { this.addedAt = addedAt; return this; }
        public Beneficiary build() { return new Beneficiary(id, userId, name, accountNumber, bankName, ifscCode, nickname, addedAt); }
    }
}
