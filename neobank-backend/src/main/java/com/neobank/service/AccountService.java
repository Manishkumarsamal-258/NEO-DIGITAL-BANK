package com.neobank.service;

import com.neobank.dto.CreateAccountRequest;
import com.neobank.model.Account;
import com.neobank.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<Account> getUserAccounts(String userId) {
        return accountRepository.findByUserId(userId);
    }

    public List<Account> getUserActiveAccounts(String userId) {
        return accountRepository.findByUserIdAndStatus(userId, Account.AccountStatus.active);
    }

    public Account getAccountById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public Account createAccount(CreateAccountRequest request) {
        Random rand = new Random();
        String accountNumber = String.format("%04d-%04d-%04d-%04d",
                rand.nextInt(10000), rand.nextInt(10000),
                rand.nextInt(10000), rand.nextInt(10000));

        Account.AccountType type = Account.AccountType.valueOf(request.getAccountType());
        double interestRate;
        switch (type) {
            case savings: interestRate = 3.5; break;
            case checking: interestRate = 0.5; break;
            case fixed_deposit: interestRate = 5.0; break;
            default: interestRate = 0.5;
        }

        Account account = Account.builder()
                .userId(request.getUserId())
                .accountNumber(accountNumber)
                .accountType(type)
                .balance(request.getInitialDeposit() != null ? request.getInitialDeposit() : 0)
                .currency("INR")
                .status(Account.AccountStatus.active)
                .createdAt(LocalDate.now())
                .interestRate(interestRate)
                .build();

        return accountRepository.save(account);
    }

    public Account toggleFreeze(String accountId) {
        Account account = getAccountById(accountId);
        account.setStatus(account.getStatus() == Account.AccountStatus.active
                ? Account.AccountStatus.frozen
                : Account.AccountStatus.active);
        return accountRepository.save(account);
    }

    public Account deposit(String accountId, Double amount) {
        Account account = getAccountById(accountId);
        account.setBalance(account.getBalance() + amount);
        return accountRepository.save(account);
    }

    public Account withdraw(String accountId, Double amount) {
        Account account = getAccountById(accountId);
        if (amount > account.getBalance()) {
            throw new RuntimeException("Insufficient balance.");
        }
        account.setBalance(account.getBalance() - amount);
        return accountRepository.save(account);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found with number: " + accountNumber));
    }
}
