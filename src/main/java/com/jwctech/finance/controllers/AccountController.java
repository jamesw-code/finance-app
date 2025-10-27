package com.jwctech.finance.controllers;

import com.jwctech.finance.dto.AccountDto;
import com.jwctech.finance.services.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/businesses/{businessId}/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public List<AccountDto> getAccounts(@PathVariable Long businessId) {
        return accountService.getAccounts(businessId);
    }

    @PostMapping
    public ResponseEntity<AccountDto> createAccount(@PathVariable Long businessId,
                                                    @Valid @RequestBody CreateAccountRequest request) {
        AccountDto savedAccount = accountService.createAccount(businessId, request.name(), request.accountType());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAccount);
    }

    public record CreateAccountRequest(@NotBlank String name, String accountType) {
    }
}
