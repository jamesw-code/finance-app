package com.jwctech.finance.services;

import com.jwctech.finance.dto.CategoryDto;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.entities.Category;
import com.jwctech.finance.repositories.BusinessRepository;
import com.jwctech.finance.repositories.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;

    public CategoryService(CategoryRepository categoryRepository, BusinessRepository businessRepository) {
        this.categoryRepository = categoryRepository;
        this.businessRepository = businessRepository;
    }

    public List<CategoryDto> getCategories(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found.");
        }
        return categoryRepository.findByBusinessIdOrderByNameAsc(businessId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto createCategory(Long businessId, String name, String description, Long parentCategoryId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = name.trim();
        if (categoryRepository.existsByNameIgnoreCaseAndBusinessId(trimmedName, businessId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A category with that name already exists for this business.");
        }

        Category parentCategory = null;
        if (parentCategoryId != null) {
            parentCategory = categoryRepository.findByIdAndBusinessId(parentCategoryId, businessId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Parent category not found for this business."));
        }

        Category category = new Category();
        category.setName(trimmedName);
        if (description != null && !description.isBlank()) {
            category.setDescription(description.trim());
        } else {
            category.setDescription(null);
        }
        category.setBusiness(business);
        category.setParentCategory(parentCategory);

        Category savedCategory = categoryRepository.save(category);
        return toDto(savedCategory);
    }

    private CategoryDto toDto(Category category) {
        Long businessId = category.getBusinessId() != null
                ? category.getBusinessId()
                : (category.getBusiness() != null ? category.getBusiness().getId() : null);

        Long parentCategoryId = category.getParentCategoryId() != null
                ? category.getParentCategoryId()
                : (category.getParentCategory() != null ? category.getParentCategory().getId() : null);

        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                businessId,
                parentCategoryId
        );
    }
}
