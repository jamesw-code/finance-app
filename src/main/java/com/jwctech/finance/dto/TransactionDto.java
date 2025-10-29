package com.jwctech.finance.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record TransactionDto(
        Long id,
        Long businessId,
        Long accountId,
        String accountName,
        String payee,
        String memo,
        LocalDate postedAt,
        BigDecimal amount,
        Long vendorId,
        String vendorName,
        List<TransactionSplitDto> splits,
        Instant createdAt,
        Instant updatedAt
) {
}
