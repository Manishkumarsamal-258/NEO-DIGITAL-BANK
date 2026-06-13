package com.neobank.account.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(nullable = false)
    private String userId;
    @Column(nullable = false, unique = true)
    private String accountNumber;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountType accountType;
    @Column(nullable = false)
    private Double balance;
    @Column(nullable = false)
    private String currency;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountStatus status;
    @Column(nullable = false)
    private LocalDate createdAt;
    @Column(nullable = false)
    private Double interestRate;

    public enum AccountType { savings, checking, fixed_deposit }
    public enum AccountStatus { active, frozen, closed }

    public Account() {}

    public Account(String id, String userId, String accountNumber, AccountType accountType, Double balance, String currency, AccountStatus status, LocalDate createdAt, Double interestRate) {
        this.id = id; this.userId = userId; this.accountNumber = accountNumber; this.accountType = accountType;
        this.balance = balance; this.currency = currency; this.status = status; this.createdAt = createdAt; this.interestRate = interestRate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }
    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public Double getInterestRate() { return interestRate; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String id; private String userId; private String accountNumber; private AccountType accountType;
        private Double balance; private String currency; private AccountStatus status; private LocalDate createdAt; private Double interestRate;
        public Builder id(String id) { this.id = id; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder accountNumber(String accountNumber) { this.accountNumber = accountNumber; return this; }
        public Builder accountType(AccountType accountType) { this.accountType = accountType; return this; }
        public Builder balance(Double balance) { this.balance = balance; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder status(AccountStatus status) { this.status = status; return this; }
        public Builder createdAt(LocalDate createdAt) { this.createdAt = createdAt; return this; }
        public Builder interestRate(Double interestRate) { this.interestRate = interestRate; return this; }
        public Account build() { return new Account(id, userId, accountNumber, accountType, balance, currency, status, createdAt, interestRate); }
    }
}