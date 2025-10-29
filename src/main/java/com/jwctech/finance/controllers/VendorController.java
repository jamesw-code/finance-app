package com.jwctech.finance.controllers;

import com.jwctech.finance.dto.VendorDto;
import com.jwctech.finance.services.VendorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/businesses/{businessId}/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    public List<VendorDto> getVendors(@PathVariable Long businessId) {
        return vendorService.getVendors(businessId);
    }

    @PostMapping
    public ResponseEntity<VendorDto> createVendor(@PathVariable Long businessId,
                                                  @Valid @RequestBody CreateVendorRequest request) {
        VendorDto savedVendor = vendorService.createVendor(
                businessId,
                request.name(),
                request.contactName(),
                request.email(),
                request.phone(),
                request.active()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVendor);
    }

    public record CreateVendorRequest(
            @NotBlank String name,
            String contactName,
            String email,
            String phone,
            @NotNull Boolean active
    ) {
    }
}
