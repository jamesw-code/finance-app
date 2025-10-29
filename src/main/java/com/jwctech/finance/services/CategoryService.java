package com.jwctech.finance.services;

import com.jwctech.finance.dto.CategoryDto;
import com.jwctech.finance.entities.Business;
import com.jwctech.finance.entities.Category;
import com.jwctech.finance.entities.CategoryKind;
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
        return categoryRepository.findByBusiness_IdOrderByNameAsc(businessId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto createCategory(Long businessId,
                                      String name,
                                      String description,
                                      Long parentCategoryId,
                                      CategoryKind kind,
                                      Boolean active) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business not found."));

        String trimmedName = name.trim();
        if (kind == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category kind is required.");
        }
        if (categoryRepository.existsByNameIgnoreCaseAndBusiness_Id(trimmedName, businessId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A category with that name already exists for this business.");
        }

        Category parentCategory = null;
        if (parentCategoryId != null) {
            parentCategory = categoryRepository.findByIdAndBusiness_Id(parentCategoryId, businessId)
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
        category.setKind(kind.name());
        category.setActive(active != null ? active : true);

        Category savedCategory = categoryRepository.save(category);
        return toDto(savedCategory);
    }

    private CategoryDto toDto(Category category) {
        Long businessId = category.getBusiness() != null ? category.getBusiness().getId() : null;

        Long parentCategoryId = category.getParentCategory() != null
                ? category.getParentCategory().getId()
                : null;

        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                businessId,
                parentCategoryId,
                category.getKind() != null ? CategoryKind.fromString(category.getKind()) : CategoryKind.OTHER,
                category.isActive()
        );
    }
}
