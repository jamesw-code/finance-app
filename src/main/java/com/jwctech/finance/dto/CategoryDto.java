package com.jwctech.finance.dto;

public record CategoryDto(
        Long id,
        String name,
        String description,
        Long businessId,
        Long parentCategoryId
) {
}
