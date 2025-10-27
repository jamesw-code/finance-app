package com.jwctech.finance.services;

import com.jwctech.finance.entities.Business;
import com.jwctech.finance.entities.Category;
import com.jwctech.finance.repositories.BusinessRepository;
import com.jwctech.finance.repositories.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;

    public CategoryService(CategoryRepository categoryRepository, BusinessRepository businessRepository) {
        this.categoryRepository = categoryRepository;
        this.businessRepository = businessRepository;
    }

    public List<Category> getCategories(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return categoryRepository.findByBusinessIdOrderByNameAsc(businessId);
    }

    public Category createCategory(Long businessId, String name, String description) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = name.trim();
        if (categoryRepository.existsByNameIgnoreCaseAndBusinessId(trimmedName, businessId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A category with that name already exists for this business.");
        }

        Category category = new Category();
        category.setName(trimmedName);
        if (description != null && !description.isBlank()) {
            category.setDescription(description.trim());
        } else {
            category.setDescription(null);
        }
        category.setBusiness(business);

        return categoryRepository.save(category);
    }
}
