package com.jwctech.finance.services;

import com.jwctech.finance.dto.VendorDto;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.entities.Vendor;
import com.jwctech.finance.repositories.BusinessRepository;
import com.jwctech.finance.repositories.VendorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;
    private final BusinessRepository businessRepository;

    public VendorService(VendorRepository vendorRepository, BusinessRepository businessRepository) {
        this.vendorRepository = vendorRepository;
        this.businessRepository = businessRepository;
    }

    @Transactional(readOnly = true)
    public List<VendorDto> getVendors(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return vendorRepository.findByBusiness_IdOrderByNameAsc(businessId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VendorDto createVendor(Long businessId,
                                  String name,
                                  String contactName,
                                  String email,
                                  String phone,
                                  Boolean active) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = name != null ? name.trim() : null;
        if (trimmedName == null || trimmedName.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendor name is required.");
        }

        if (vendorRepository.existsByNameIgnoreCaseAndBusiness_Id(trimmedName, businessId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A vendor with that name already exists for this business.");
        }

        Vendor vendor = new Vendor();
        vendor.setBusiness(business);
        vendor.setName(trimmedName);
        vendor.setContactName(normalize(contactName));
        vendor.setEmail(normalize(email));
        vendor.setPhone(normalize(phone));
        vendor.setActive(active != null ? active : true);

        Vendor savedVendor = vendorRepository.save(vendor);
        return toDto(savedVendor);
    }

    private VendorDto toDto(Vendor vendor) {
        Long businessId = vendor.getBusiness() != null ? vendor.getBusiness().getId() : null;
        return new VendorDto(
                vendor.getId(),
                businessId,
                vendor.getName(),
                vendor.getContactName(),
                vendor.getEmail(),
                vendor.getPhone(),
                vendor.isActive(),
                vendor.getCreatedAt(),
                vendor.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
