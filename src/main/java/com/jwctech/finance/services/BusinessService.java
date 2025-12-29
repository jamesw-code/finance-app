package com.jwctech.finance.services;

import com.jwctech.finance.dto.BusinessDto;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.entities.Category;
import com.jwctech.finance.entities.CategoryKind;
import com.jwctech.finance.repositories.AccountRepository;
import com.jwctech.finance.repositories.BusinessRepository;
import com.jwctech.finance.repositories.CategoryRepository;
import com.jwctech.finance.repositories.TransactionRepository;
import com.jwctech.finance.repositories.VendorRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final VendorRepository vendorRepository;
    private final TransactionRepository transactionRepository;

    public BusinessService(BusinessRepository businessRepository,
                           CategoryRepository categoryRepository,
                           AccountRepository accountRepository,
                           VendorRepository vendorRepository,
                           TransactionRepository transactionRepository) {
        this.businessRepository = businessRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.vendorRepository = vendorRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<BusinessDto> getBusinesses() {
        return businessRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BusinessDto createBusiness(String name, String taxId) {
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

        Business savedBusiness = businessRepository.save(business);
        createDefaultCategories(savedBusiness);
        return toDto(savedBusiness);
    }

    @Transactional
    public void deleteBusiness(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        transactionRepository.deleteByBusiness_Id(businessId);
        accountRepository.deleteByBusiness_Id(businessId);
        vendorRepository.deleteByBusiness_Id(businessId);
        categoryRepository.deleteByBusiness_Id(businessId);
        businessRepository.delete(business);
    }

    private void createDefaultCategories(Business business) {
        DEFAULT_CATEGORY_DEFINITIONS.forEach((name, kind) -> {
            Category category = new Category();
            category.setBusiness(business);
            category.setName(name);
            category.setKind(kind.name());
            categoryRepository.save(category);
        });
    }

    private BusinessDto toDto(Business business) {
        return new BusinessDto(
                business.getId(),
                business.getName(),
                business.getTaxId()
        );
    }

    private static final Map<String, CategoryKind> DEFAULT_CATEGORY_DEFINITIONS = Map.ofEntries(
            Map.entry("Sales", CategoryKind.INCOME),
            Map.entry("Service", CategoryKind.INCOME),
            Map.entry("Other Income", CategoryKind.INCOME),
            Map.entry("Advertising", CategoryKind.EXPENSE),
            Map.entry("Car and Truck", CategoryKind.EXPENSE),
            Map.entry("Commissions and Fees", CategoryKind.EXPENSE),
            Map.entry("Contract Labor", CategoryKind.EXPENSE),
            Map.entry("Depreciation", CategoryKind.EXPENSE),
            Map.entry("Employee Benefit Programs", CategoryKind.EXPENSE),
            Map.entry("Insurance", CategoryKind.EXPENSE),
            Map.entry("Interest - Mortgage", CategoryKind.EXPENSE),
            Map.entry("Interest - Other", CategoryKind.EXPENSE),
            Map.entry("Legal and Professional Services", CategoryKind.EXPENSE),
            Map.entry("Office Expense", CategoryKind.EXPENSE),
            Map.entry("Office Supplies", CategoryKind.EXPENSE),
            Map.entry("Communications", CategoryKind.EXPENSE),
            Map.entry("Supplies", CategoryKind.EXPENSE),
            Map.entry("Credit Card Fee", CategoryKind.EXPENSE),
            Map.entry("Taxes and Licenses", CategoryKind.EXPENSE),
            Map.entry("Utilities", CategoryKind.EXPENSE),
            Map.entry("Wages", CategoryKind.EXPENSE),
            Map.entry("Rent or Lease - Vehicles, Machinery, Equipment", CategoryKind.EXPENSE),
            Map.entry("Rent or Lease - Other Business Property", CategoryKind.EXPENSE),
            Map.entry("Repairs and Maintenance", CategoryKind.EXPENSE),
            Map.entry("Travel", CategoryKind.EXPENSE),
            Map.entry("Meals", CategoryKind.EXPENSE),
            Map.entry("Pension and Profit-Sharing Plans", CategoryKind.EXPENSE),
            Map.entry("Payroll Taxes", CategoryKind.EXPENSE),
            Map.entry("Other Expenses", CategoryKind.EXPENSE),
            Map.entry("Other", CategoryKind.EXPENSE)
    );
}
