package com.jwctech.finance.controllers;

import com.jwctech.finance.dto.TransactionDto;
import com.jwctech.finance.services.TransactionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/businesses/{businessId}")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/transactions")
    public List<TransactionDto> getTransactionsForBusiness(@PathVariable Long businessId) {
        return transactionService.getTransactionsForBusiness(businessId);
    }

    @GetMapping("/accounts/{accountId}/transactions")
    public List<TransactionDto> getTransactionsForAccount(@PathVariable Long businessId,
                                                           @PathVariable Long accountId) {
        return transactionService.getTransactionsForAccount(businessId, accountId);
    }

    @PostMapping("/accounts/{accountId}/transactions")
    public ResponseEntity<TransactionDto> createTransaction(@PathVariable Long businessId,
                                                            @PathVariable Long accountId,
                                                            @Valid @RequestBody CreateTransactionRequest request) {
        if (request.splits() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one split is required.");
        }

        TransactionDto savedTransaction = transactionService.createTransaction(new TransactionService.CreateTransactionRequest(
                businessId,
                accountId,
                request.businessId(),
                request.accountId(),
                request.payee(),
                request.memo(),
                request.postedAt(),
                request.amount(),
                request.vendorId(),
                request.splits().stream()
                        .map(split -> new TransactionService.CreateTransactionSplitRequest(
                                split.categoryId(),
                                split.amount(),
                                split.memo()
                        ))
                        .toList()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTransaction);
    }

    public record CreateTransactionRequest(
            @NotNull Long businessId,
            @NotNull Long accountId,
            @NotBlank String payee,
            String memo,
            @NotNull LocalDate postedAt,
            @NotNull BigDecimal amount,
            Long vendorId,
            @NotNull @Valid List<CreateTransactionSplitRequest> splits
    ) {
    }

    public record CreateTransactionSplitRequest(
            @NotNull Long categoryId,
            @NotNull BigDecimal amount,
            String memo
    ) {
    }
}
