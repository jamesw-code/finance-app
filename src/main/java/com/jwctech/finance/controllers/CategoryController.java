package com.jwctech.finance.controllers;

import com.jwctech.finance.entities.Business;
import com.jwctech.finance.entities.Category;
import com.jwctech.finance.repositories.BusinessRepository;
import com.jwctech.finance.repositories.CategoryRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/businesses/{businessId}/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;

    public CategoryController(CategoryRepository categoryRepository, BusinessRepository businessRepository) {
        this.categoryRepository = categoryRepository;
        this.businessRepository = businessRepository;
    }

    @GetMapping
    public List<Category> getCategories(@PathVariable Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return categoryRepository.findByBusinessIdOrderByNameAsc(businessId);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@PathVariable Long businessId,
                                                   @Valid @RequestBody CreateCategoryRequest request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndBusinessId(trimmedName, businessId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A category with that name already exists for this business.");
        }

        Category category = new Category();
        category.setName(trimmedName);
        if (request.description() != null && !request.description().isBlank()) {
            category.setDescription(request.description().trim());
        } else {
            category.setDescription(null);
        }
        category.setBusiness(business);

        Category savedCategory = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    public record CreateCategoryRequest(@NotBlank String name, String description) {
    }
}
