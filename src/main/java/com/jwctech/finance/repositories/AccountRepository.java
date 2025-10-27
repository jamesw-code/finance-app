package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByBusinessIdOrderByNameAsc(Long businessId);

    boolean existsByNameIgnoreCaseAndBusinessId(String name, Long businessId);
}
