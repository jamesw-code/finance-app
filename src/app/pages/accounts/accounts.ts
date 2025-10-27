import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { finalize, Subscription } from 'rxjs';
import { Account } from '../../model/account.model';
import { Business } from '../../model/business.model';
import { AccountService } from '../../services/account.service';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
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
export class Accounts implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  accounts: Account[] = [];
  selectedBusiness: Business | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  formError: string | null = null;

  readonly accountForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    accountType: ['']
  });

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly accountService: AccountService,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sub = this.businessService.selectedBusiness$.subscribe((business) => {
      this.selectedBusiness = business;
      this.accounts = [];
      this.errorMessage = null;
      if (business?.id != null) {
        this.loadAccounts(business.id);
      }
      this.cdr.markForCheck();
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAccounts(businessId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    const sub = this.accountService
      .getAccountsForBusiness(businessId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
        },
        error: (error) => {
          console.error('Failed to load accounts', error);
          this.errorMessage = 'Unable to load accounts. Please try again later.';
        }
      });
    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (!this.selectedBusiness || this.selectedBusiness.id == null) {
      this.formError = 'Select a business before adding accounts.';
      this.cdr.markForCheck();
      return;
    }

    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const { name, accountType } = this.accountForm.getRawValue();
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.formError = 'Account name is required.';
      this.cdr.markForCheck();
      return;
    }

    const payload: { name: string; accountType?: string } = { name: trimmedName };
    if (accountType && accountType.trim().length > 0) {
      payload.accountType = accountType.trim();
    }

    this.isSaving = true;
    this.formError = null;
    this.cdr.markForCheck();

    const sub = this.accountService
      .createAccount(this.selectedBusiness.id, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (createdAccount) => {
          this.accountForm.reset({ name: '', accountType: '' });
          this.accounts = [...this.accounts, createdAccount];
        },
        error: (error) => {
          console.error('Failed to create account', error);
          if (error?.status === 409) {
            this.formError = error?.error?.message || 'An account with that name already exists.';
          } else {
            this.formError = 'Unable to create account. Please try again later.';
          }
        }
      });

    this.subscriptions.add(sub);
  }
}
