package com.jwctech.finance.dto;

public record AccountDto(
        Long id,
        String name,
        String accountType,
        Long businessId
) {
}
