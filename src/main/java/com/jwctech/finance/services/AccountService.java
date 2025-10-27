package com.jwctech.finance.services;

import com.jwctech.finance.dto.AccountDto;
import com.jwctech.finance.entities.Account;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.repositories.AccountRepository;
import com.jwctech.finance.repositories.BusinessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final BusinessRepository businessRepository;

    public AccountService(AccountRepository accountRepository, BusinessRepository businessRepository) {
        this.accountRepository = accountRepository;
        this.businessRepository = businessRepository;
    }

    public List<AccountDto> getAccounts(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return accountRepository.findByBusiness_IdOrderByNameAsc(businessId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AccountDto createAccount(Long businessId, String name, String accountType) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = name.trim();
        if (accountRepository.existsByNameIgnoreCaseAndBusiness_Id(trimmedName, businessId)) {
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

        Account savedAccount = accountRepository.save(account);
        return toDto(savedAccount);
    }

    private AccountDto toDto(Account account) {
        Long businessId = account.getBusiness() != null ? account.getBusiness().getId() : null;
        return new AccountDto(
                account.getId(),
                account.getName(),
                account.getAccountType(),
                businessId
        );
    }
}
