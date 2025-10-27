package com.jwctech.finance.controllers;

import com.jwctech.finance.entities.Category;
import com.jwctech.finance.services.CategoryService;
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

import java.util.List;

@RestController
@RequestMapping("/api/businesses/{businessId}/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getCategories(@PathVariable Long businessId) {
        return categoryService.getCategories(businessId);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@PathVariable Long businessId,
                                                   @Valid @RequestBody CreateCategoryRequest request) {
        Category savedCategory = categoryService.createCategory(businessId,
                request.name(), request.description(), request.parentCategoryId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    public record CreateCategoryRequest(@NotBlank String name, String description, Long parentCategoryId) {
    }
}
