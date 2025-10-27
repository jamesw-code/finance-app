package com.jwctech.finance.controllers;

import com.jwctech.finance.entities.Business;
import com.jwctech.finance.repositories.BusinessRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class BusinessController {

    private final BusinessRepository businessRepository;

    public BusinessController(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    @GetMapping
    public List<Business> getBusinesses() {
        return businessRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
    }

    @PostMapping
    public ResponseEntity<Business> createBusiness(@Valid @RequestBody CreateBusinessRequest request) {
        String name = request.name().trim();
        if (businessRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A business with that name already exists.");
        }

        Business business = new Business();
        business.setName(name);
        if (request.taxId() != null && !request.taxId().isBlank()) {
            business.setTaxId(request.taxId().trim());
        } else {
            business.setTaxId(null);
        }

        Business savedBusiness = businessRepository.save(business);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBusiness);
    }

    public record CreateBusinessRequest(@NotBlank String name, String taxId) {
    }
}
