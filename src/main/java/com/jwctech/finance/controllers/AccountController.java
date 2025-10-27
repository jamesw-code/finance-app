package com.jwctech.finance.controllers;

import com.jwctech.finance.entities.Account;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.repositories.AccountRepository;
import com.jwctech.finance.repositories.BusinessRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/businesses/{businessId}/accounts")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class AccountController {

    private final AccountRepository accountRepository;
    private final BusinessRepository businessRepository;

    public AccountController(AccountRepository accountRepository, BusinessRepository businessRepository) {
        this.accountRepository = accountRepository;
        this.businessRepository = businessRepository;
    }

    @GetMapping
    public List<Account> getAccounts(@PathVariable Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return accountRepository.findByBusinessIdOrderByNameAsc(businessId);
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@PathVariable Long businessId,
                                                 @Valid @RequestBody CreateAccountRequest request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = request.name().trim();
        if (accountRepository.existsByNameIgnoreCaseAndBusinessId(trimmedName, businessId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with that name already exists for this business.");
        }

        Account account = new Account();
        account.setName(trimmedName);
        if (request.accountType() != null && !request.accountType().isBlank()) {
            account.setAccountType(request.accountType().trim());
        } else {
            account.setAccountType(null);
        }
        account.setBusiness(business);

        Account savedAccount = accountRepository.save(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAccount);
    }

    public record CreateAccountRequest(@NotBlank String name, String accountType) {
    }
}
