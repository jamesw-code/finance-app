package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByBusiness_IdOrderByNameAsc(Long businessId);

    boolean existsByNameIgnoreCaseAndBusiness_Id(String name, Long businessId);

    Optional<Category> findByIdAndBusiness_Id(Long id, Long businessId);
}
