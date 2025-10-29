package com.jwctech.finance.services;

import com.jwctech.finance.dto.TransactionDto;
import com.jwctech.finance.dto.TransactionSplitDto;
import com.jwctech.finance.entities.Account;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.entities.Category;
import com.jwctech.finance.entities.Transaction;
import com.jwctech.finance.entities.TransactionSplit;
import com.jwctech.finance.entities.Vendor;
import com.jwctech.finance.repositories.AccountRepository;
import com.jwctech.finance.repositories.BusinessRepository;
import com.jwctech.finance.repositories.CategoryRepository;
import com.jwctech.finance.repositories.TransactionRepository;
import com.jwctech.finance.repositories.VendorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BusinessRepository businessRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              BusinessRepository businessRepository,
                              CategoryRepository categoryRepository,
                              VendorRepository vendorRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.businessRepository = businessRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactionsForBusiness(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return transactionRepository.findByBusiness_IdOrderByPostedAtDescCreatedAtDesc(businessId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactionsForAccount(Long businessId, Long accountId) {
        ensureAccountExistsForBusiness(accountId, businessId);
        return transactionRepository.findByAccount_IdAndBusiness_IdOrderByPostedAtDescCreatedAtDesc(accountId, businessId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionDto createTransaction(CreateTransactionRequest request) {
        if (!Objects.equals(request.businessId(), request.pathBusinessId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Business mismatch between path and payload.");
        }
        if (!Objects.equals(request.accountId(), request.pathAccountId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account mismatch between path and payload.");
        }
        if (request.amount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction amount is required.");
        }
        if (request.postedAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posted date is required.");
        }
        if (request.splits() == null || request.splits().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one split is required.");
        }

        String trimmedPayee = normalize(request.payee());
        if (trimmedPayee == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payee is required.");
        }

        Account account = accountRepository.findByIdAndBusiness_Id(request.accountId(), request.businessId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found for this business."));
        Business business = account.getBusiness();

        Vendor vendor = null;
        if (request.vendorId() != null) {
            vendor = vendorRepository.findByIdAndBusiness_Id(request.vendorId(), request.businessId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Vendor not found for this business."));
        }

        Transaction transaction = new Transaction();
        transaction.setBusiness(business);
        transaction.setAccount(account);
        transaction.setVendor(vendor);
        transaction.setPayee(trimmedPayee);
        transaction.setMemo(normalize(request.memo()));
        transaction.setPostedAt(request.postedAt());
        transaction.setAmount(request.amount());

        transaction.clearSplits();
        for (CreateTransactionSplitRequest splitRequest : request.splits()) {
            if (splitRequest.categoryId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Split category is required.");
            }
            if (splitRequest.amount() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Split amount is required.");
            }

            Category category = categoryRepository.findByIdAndBusiness_Id(splitRequest.categoryId(), request.businessId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Category not found for this business."));

            TransactionSplit split = new TransactionSplit();
            split.setCategory(category);
            split.setAmount(splitRequest.amount());
            split.setMemo(normalize(splitRequest.memo()));
            transaction.addSplit(split);
        }

        Transaction savedTransaction = transactionRepository.save(transaction);
        return toDto(savedTransaction);
    }

    private void ensureAccountExistsForBusiness(Long accountId, Long businessId) {
        if (!accountRepository.findByIdAndBusiness_Id(accountId, businessId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found for this business.");
        }
    }

    private TransactionDto toDto(Transaction transaction) {
        Long businessId = transaction.getBusiness() != null ? transaction.getBusiness().getId() : null;
        Long accountId = transaction.getAccount() != null ? transaction.getAccount().getId() : null;
        String accountName = transaction.getAccount() != null ? transaction.getAccount().getName() : null;
        Long vendorId = transaction.getVendor() != null ? transaction.getVendor().getId() : null;
        String vendorName = transaction.getVendor() != null ? transaction.getVendor().getName() : null;

        List<TransactionSplitDto> splits = transaction.getSplits()
                .stream()
                .sorted(Comparator.comparing(TransactionSplit::getId, Comparator.nullsLast(Long::compareTo)))
                .map(split -> new TransactionSplitDto(
                        split.getCategory() != null ? split.getCategory().getId() : null,
                        split.getAmount(),
                        split.getMemo()
                ))
                .collect(Collectors.toList());

        return new TransactionDto(
                transaction.getId(),
                businessId,
                accountId,
                accountName,
                transaction.getPayee(),
                transaction.getMemo(),
                transaction.getPostedAt(),
                transaction.getAmount(),
                vendorId,
                vendorName,
                splits,
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record CreateTransactionRequest(
            Long pathBusinessId,
            Long pathAccountId,
            Long businessId,
            Long accountId,
            String payee,
            String memo,
            java.time.LocalDate postedAt,
            BigDecimal amount,
            Long vendorId,
            List<CreateTransactionSplitRequest> splits
    ) {
    }

    public record CreateTransactionSplitRequest(
            Long categoryId,
            BigDecimal amount,
            String memo
    ) {
    }
}
