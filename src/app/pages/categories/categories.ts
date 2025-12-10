import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { finalize, Subscription } from 'rxjs';
import { Category, CategoryKind } from '../../model/category.model';
import { Business } from '../../model/business.model';
import { CategoryService } from '../../services/category.service';
import { BusinessService } from '../../services/business.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

interface CategoryNode extends Category {
  subcategories: CategoryNode[];
}

interface CategoryOption {
  id: number;
  name: string;
  depth: number;
  label: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    MatListModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule
  ]
})
export class Categories implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  flatCategories: Category[] = [];
  categoryTree: CategoryNode[] = [];
  parentCategoryOptions: CategoryOption[] = [];
  selectedBusiness: Business | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  formError: string | null = null;
  readonly categoryKinds = Object.values(CategoryKind);
  readonly categoryKindOptions = this.categoryKinds.map((kind) => ({
    value: kind,
    label: kind
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }));

  readonly categoryForm = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.control(''),
    parentCategoryId: this.fb.control<number | null>(null),
    kind: this.fb.control<CategoryKind | null>(null, { validators: [Validators.required] }),
    active: this.fb.nonNullable.control(true)
  });

  private readonly subscriptions = new Subscription();
  private dialogRef: MatDialogRef<unknown> | null = null;

  @ViewChild('addCategoryDialog')
  private addCategoryDialog?: TemplateRef<unknown>;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const sub = this.businessService.selectedBusiness$.subscribe((business) => {
      this.selectedBusiness = business;
      this.flatCategories = [];
      this.categoryTree = [];
      this.parentCategoryOptions = [];
      this.errorMessage = null;
      if (!business) {
        this.closeAddCategoryDialog();
      }
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

  openAddCategoryDialog(): void {
    if (!this.selectedBusiness || !this.addCategoryDialog) {
      return;
    }

    this.formError = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      parentCategoryId: null,
      kind: null,
      active: true
    });
    this.categoryForm.markAsPristine();
    this.categoryForm.markAsUntouched();

    const dialogRef = this.dialog.open(this.addCategoryDialog, {
      width: '520px'
    });
    this.dialogRef = dialogRef;

    const dialogSub = dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.formError = null;
      this.categoryForm.reset({
        name: '',
        description: '',
        parentCategoryId: null,
        kind: null,
        active: true
      });
    });
    this.subscriptions.add(dialogSub);
  }

  closeAddCategoryDialog(): void {
    this.dialogRef?.close();
    this.dialogRef = null;
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
          this.updateCategoryStructures(categories);
        },
        error: (error) => {
          console.error('Failed to load categories', error);
          this.errorMessage = 'Unable to load categories. Please try again later.';
          this.flatCategories = [];
          this.categoryTree = [];
          this.parentCategoryOptions = [];
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

    const { name, description, parentCategoryId, kind, active } = this.categoryForm.getRawValue();
    const trimmedName = (name ?? '').trim();
    if (!trimmedName) {
      this.formError = 'Category name is required.';
      this.cdr.markForCheck();
      return;
    }

    if (!kind) {
      this.formError = 'Select a category kind.';
      this.cdr.markForCheck();
      return;
    }

    const payload: {
      name: string;
      description?: string;
      parentCategoryId?: number | null;
      kind: CategoryKind;
      active: boolean;
    } = {
      name: trimmedName,
      kind,
      active: active ?? true
    };
    if (description && description.trim().length > 0) {
      payload.description = description.trim();
    }
    payload.parentCategoryId = parentCategoryId ?? null;

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
          this.categoryForm.reset({
            name: '',
            description: '',
            parentCategoryId: null,
            kind: null,
            active: true
          });
          this.updateCategoryStructures([...this.flatCategories, createdCategory]);
          this.closeAddCategoryDialog();
        },
        error: (error) => {
          console.error('Failed to create category', error);
          if (error?.status === 409) {
            this.formError = error?.error?.message || 'A category with that name already exists.';
          } else if (error?.status === 400) {
            this.formError = error?.error?.message || 'Unable to create category. Please try again later.';
          } else {
            this.formError = 'Unable to create category. Please try again later.';
          }
        }
      });

    this.subscriptions.add(sub);
  }

  private updateCategoryStructures(categories: Category[]): void {
    this.flatCategories = [...categories];
    this.categoryTree = this.buildCategoryTree(this.flatCategories);
    this.parentCategoryOptions = this.buildParentCategoryOptions(this.categoryTree);
  }

  private buildCategoryTree(categories: Category[]): CategoryNode[] {
    const nodeMap = new Map<number, CategoryNode>();
    categories.forEach((category) => {
      nodeMap.set(category.id, {
        ...category,
        subcategories: []
      });
    });

    nodeMap.forEach((node) => {
      if (node.parentCategoryId != null) {
        const parent = nodeMap.get(node.parentCategoryId);
        if (parent) {
          parent.subcategories.push(node);
        }
      }
    });

    const roots: CategoryNode[] = [];
    nodeMap.forEach((node) => {
      if (node.parentCategoryId == null || !nodeMap.has(node.parentCategoryId)) {
        roots.push(node);
      }
    });

    this.sortCategoryNodes(roots);
    return roots;
  }

  private sortCategoryNodes(nodes: CategoryNode[]): void {
    nodes.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    nodes.forEach((child) => {
      if (child.subcategories.length > 0) {
        this.sortCategoryNodes(child.subcategories);
      }
    });
  }

  private buildParentCategoryOptions(nodes: CategoryNode[]): CategoryOption[] {
    const options: CategoryOption[] = [];

    const traverse = (currentNodes: CategoryNode[], depth: number) => {
      currentNodes.forEach((node) => {
        options.push({
          id: node.id,
          name: node.name,
          depth,
          label: `${depth > 0 ? '— '.repeat(depth) : ''}${node.name}`
        });
        if (node.subcategories.length > 0) {
          traverse(node.subcategories, depth + 1);
        }
      });
    };

    traverse(nodes, 0);
    return options;
  }

  getKindLabel(kind: CategoryKind): string {
    const match = this.categoryKindOptions.find((option) => option.value === kind);
    return match?.label ?? kind;
  }
}
