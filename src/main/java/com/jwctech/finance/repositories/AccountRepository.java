package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByBusinessIdOrderByNameAsc(Long businessId);

    boolean existsByNameIgnoreCaseAndBusinessId(String name, Long businessId);
}
