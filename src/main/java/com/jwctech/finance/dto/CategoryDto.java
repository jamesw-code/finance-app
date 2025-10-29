package com.jwctech.finance.dto;

import com.jwctech.finance.entities.CategoryKind;

public record CategoryDto(
        Long id,
        String name,
        String description,
        Long businessId,
        Long parentCategoryId,
        CategoryKind kind,
        boolean active
) {
}
