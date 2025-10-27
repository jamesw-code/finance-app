package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByBusinessIdOrderByNameAsc(Long businessId);

    boolean existsByNameIgnoreCaseAndBusinessId(String name, Long businessId);

    Optional<Category> findByIdAndBusinessId(Long id, Long businessId);
}
