package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Transaction;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @EntityGraph(attributePaths = {"account", "vendor", "splits", "splits.category"})
    List<Transaction> findByBusiness_IdOrderByPostedAtDescCreatedAtDesc(Long businessId);

    @EntityGraph(attributePaths = {"account", "vendor", "splits", "splits.category"})
    List<Transaction> findByAccount_IdAndBusiness_IdOrderByPostedAtDescCreatedAtDesc(Long accountId, Long businessId);

    void deleteByBusiness_Id(Long businessId);
}
