package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByBusiness_IdOrderByNameAsc(Long businessId);

    boolean existsByNameIgnoreCaseAndBusiness_Id(String name, Long businessId);

    Optional<Account> findByIdAndBusiness_Id(Long accountId, Long businessId);
}
