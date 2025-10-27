import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { finalize, Subscription } from 'rxjs';
import { Category } from '../../model/category.model';
import { Business } from '../../model/business.model';
import { CategoryService } from '../../services/category.service';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    MatListModule,
    NgIf,
    NgForOf
  ]
})
export class Categories implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  categories: Category[] = [];
  selectedBusiness: Business | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  formError: string | null = null;

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['']
  });

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly categoryService: CategoryService,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sub = this.businessService.selectedBusiness$.subscribe((business) => {
      this.selectedBusiness = business;
      this.categories = [];
      this.errorMessage = null;
      if (business?.id != null) {
        this.loadCategories(business.id);
      }
      this.cdr.markForCheck();
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadCategories(businessId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    const sub = this.categoryService
      .getCategoriesForBusiness(businessId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Failed to load categories', error);
          this.errorMessage = 'Unable to load categories. Please try again later.';
        }
      });
    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (!this.selectedBusiness || this.selectedBusiness.id == null) {
      this.formError = 'Select a business before adding categories.';
      this.cdr.markForCheck();
      return;
    }

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const { name, description } = this.categoryForm.getRawValue();
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.formError = 'Category name is required.';
      this.cdr.markForCheck();
      return;
    }

    const payload: { name: string; description?: string } = { name: trimmedName };
    if (description && description.trim().length > 0) {
      payload.description = description.trim();
    }

    this.isSaving = true;
    this.formError = null;
    this.cdr.markForCheck();

    const sub = this.categoryService
      .createCategory(this.selectedBusiness.id, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (createdCategory) => {
          this.categoryForm.reset({ name: '', description: '' });
          this.categories = [...this.categories, createdCategory].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          );
        },
        error: (error) => {
          console.error('Failed to create category', error);
          if (error?.status === 409) {
            this.formError = error?.error?.message || 'A category with that name already exists.';
          } else {
            this.formError = 'Unable to create category. Please try again later.';
          }
        }
      });

    this.subscriptions.add(sub);
  }
}
