package com.jwctech.finance.entities;

import java.util.Arrays;

public enum CategoryKind {
    INCOME,
    EXPENSE,
    ASSET,
    LIABILITY,
    EQUITY,
    TRANSFER,
    OTHER;

    public static CategoryKind fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Category kind must not be blank.");
        }
        return Arrays.stream(values())
                .filter(kind -> kind.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown category kind: " + value));
    }
}
