package com.jwctech.finance.dto;

import java.math.BigDecimal;

public record TransactionSplitDto(
        Long categoryId,
        BigDecimal amount,
        String memo
) {
}
