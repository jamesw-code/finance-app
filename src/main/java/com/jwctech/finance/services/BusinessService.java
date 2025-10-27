package com.jwctech.finance.services;

import com.jwctech.finance.entities.Business;
import com.jwctech.finance.repositories.BusinessRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;

    public BusinessService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    public List<Business> getBusinesses() {
        return businessRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
    }

    public Business createBusiness(String name, String taxId) {
        String trimmedName = name.trim();
        if (businessRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A business with that name already exists.");
        }

        Business business = new Business();
        business.setName(trimmedName);
        if (taxId != null && !taxId.isBlank()) {
            business.setTaxId(taxId.trim());
        } else {
            business.setTaxId(null);
        }

        return businessRepository.save(business);
    }
}
