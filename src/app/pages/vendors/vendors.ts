import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { finalize, Subscription } from 'rxjs';
import { Vendor } from '../../model/vendor.model';
import { Business } from '../../model/business.model';
import { VendorService } from '../../services/vendor.service';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  templateUrl: './vendors.html',
  styleUrl: './vendors.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    MatCheckboxModule
  ]
})
export class Vendors implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  vendors: Vendor[] = [];
  selectedBusiness: Business | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  formError: string | null = null;

  @ViewChild('vendorNameInput', { read: MatInput })
  private readonly vendorNameInput?: MatInput;

  readonly vendorForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    contactName: [''],
    email: ['', Validators.email],
    phone: [''],
    active: [true]
  });

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly vendorService: VendorService,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sub = this.businessService.selectedBusiness$.subscribe((business) => {
      this.selectedBusiness = business;
      this.vendors = [];
      this.errorMessage = null;
      if (business?.id != null) {
        this.loadVendors(business.id);
      }
      this.cdr.markForCheck();
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  focusVendorForm(): void {
    if (!this.selectedBusiness) {
      return;
    }

    this.vendorNameInput?.focus();
  }

  onSubmit(): void {
    if (!this.selectedBusiness || this.selectedBusiness.id == null) {
      this.formError = 'Select a business before adding vendors.';
      this.cdr.markForCheck();
      return;
    }

    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }

    const { name, contactName, email, phone, active } = this.vendorForm.getRawValue();
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.formError = 'Vendor name is required.';
      this.cdr.markForCheck();
      return;
    }

    const payload = {
      name: trimmedName,
      contactName: contactName?.trim() || undefined,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      active: !!active
    };

    this.isSaving = true;
    this.formError = null;
    this.cdr.markForCheck();

    const sub = this.vendorService
      .createVendor(this.selectedBusiness.id, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (createdVendor) => {
          this.vendorForm.reset({
            name: '',
            contactName: '',
            email: '',
            phone: '',
            active: true
          });
          this.vendors = [...this.vendors, createdVendor];
        },
        error: (error) => {
          console.error('Failed to create vendor', error);
          if (error?.status === 409) {
            this.formError = error?.error?.message || 'A vendor with that name already exists.';
          } else {
            this.formError = 'Unable to create vendor. Please try again later.';
          }
        }
      });

    this.subscriptions.add(sub);
  }

  private loadVendors(businessId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const sub = this.vendorService
      .getVendorsForBusiness(businessId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (vendors) => {
          this.vendors = vendors;
        },
        error: (error) => {
          console.error('Failed to load vendors', error);
          this.errorMessage = 'Unable to load vendors. Please try again later.';
        }
      });

    this.subscriptions.add(sub);
  }
}
