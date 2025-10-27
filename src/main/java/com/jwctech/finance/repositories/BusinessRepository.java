package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Business;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Long> {
    boolean existsByNameIgnoreCase(String name);
}
