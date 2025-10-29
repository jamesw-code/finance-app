package com.jwctech.finance.dto;

import java.time.Instant;

public record VendorDto(
        Long id,
        Long businessId,
        String name,
        String contactName,
        String email,
        String phone,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
