package com.jwctech.finance.controllers;

import com.jwctech.finance.entities.Business;
import com.jwctech.finance.services.BusinessService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @GetMapping
    public List<Business> getBusinesses() {
        return businessService.getBusinesses();
    }

    @PostMapping
    public ResponseEntity<Business> createBusiness(@Valid @RequestBody CreateBusinessRequest request) {
        Business savedBusiness = businessService.createBusiness(request.name(), request.taxId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBusiness);
    }

    public record CreateBusinessRequest(@NotBlank String name, String taxId) {
    }
}
