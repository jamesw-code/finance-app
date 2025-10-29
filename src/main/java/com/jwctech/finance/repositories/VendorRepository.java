package com.jwctech.finance.repositories;

import com.jwctech.finance.entities.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByBusiness_IdOrderByNameAsc(Long businessId);

    boolean existsByNameIgnoreCaseAndBusiness_Id(String name, Long businessId);

    Optional<Vendor> findByIdAndBusiness_Id(Long vendorId, Long businessId);
}
