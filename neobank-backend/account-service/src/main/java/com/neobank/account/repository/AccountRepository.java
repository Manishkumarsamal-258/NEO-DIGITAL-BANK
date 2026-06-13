package com.neobank.account.repository;

import com.neobank.account.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountRepository extends JpaRepository<Account, String> {
    List<Account> findByUserId(String userId);
    List<Account> findByUserIdAndStatus(String userId, Account.AccountStatus status);
}