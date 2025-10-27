package com.jwctech.finance.services;

import com.jwctech.finance.entities.Account;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.repositories.AccountRepository;
import com.jwctech.finance.repositories.BusinessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final BusinessRepository businessRepository;

    public AccountService(AccountRepository accountRepository, BusinessRepository businessRepository) {
        this.accountRepository = accountRepository;
        this.businessRepository = businessRepository;
    }

    public List<Account> getAccounts(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return accountRepository.findByBusinessIdOrderByNameAsc(businessId);
    }

    public Account createAccount(Long businessId, String name, String accountType) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = name.trim();
        if (accountRepository.existsByNameIgnoreCaseAndBusinessId(trimmedName, businessId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with that name already exists for this business.");
        }

        Account account = new Account();
        account.setName(trimmedName);
        if (accountType != null && !accountType.isBlank()) {
            account.setAccountType(accountType.trim());
        } else {
            account.setAccountType(null);
        }
        account.setBusiness(business);

        return accountRepository.save(account);
    }
}
