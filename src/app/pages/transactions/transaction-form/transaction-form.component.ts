import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { finalize, forkJoin, of, Subscription } from 'rxjs';
import { Account } from '../../../model/account.model';
import { Category } from '../../../model/category.model';
import { Vendor } from '../../../model/vendor.model';
import { AccountService } from '../../../services/account.service';
import { CategoryService } from '../../../services/category.service';
import { VendorService } from '../../../services/vendor.service';
import { TransactionService, CreateTransactionPayload } from '../../../services/transaction.service';
import { Transaction, TransactionSplit } from '../../../model/transaction.model';

interface TransactionFormDialogData {
  businessId: number;
  account?: Account | null;
  accountId?: number | null;
}

interface TransactionSplitForm {
  categoryId: FormControl<number | null>;
  amount: FormControl<number | null>;
  memo: FormControl<string>;
}

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TransactionFormComponent>);
  private readonly data = inject<TransactionFormDialogData>(MAT_DIALOG_DATA);
  private readonly accountService = inject(AccountService);
  private readonly categoryService = inject(CategoryService);
  private readonly vendorService = inject(VendorService);
  private readonly transactionService = inject(TransactionService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly subscriptions = new Subscription();

  readonly transactionForm = this.fb.group({
    accountId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    postedAt: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    payee: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    memo: this.fb.control(''),
    amount: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    vendorId: this.fb.control<number | null>(null),
    splits: this.fb.array<FormGroup<TransactionSplitForm>>([
      this.createSplitGroup()
    ])
  });

  accounts: Account[] = [];
  categories: Category[] = [];
  vendors: Vendor[] = [];

  isInitializing = false;
  isSaving = false;
  loadError: string | null = null;
  formError: string | null = null;

  readonly lockedAccountId: number | null =
    this.data?.account?.id ?? this.data?.accountId ?? null;
  readonly lockedAccountName: string | null = this.data?.account?.name ?? null;
  readonly isAccountLocked = this.lockedAccountId != null;

  ngOnInit(): void {
    this.transactionForm.controls.postedAt.setValue(new Date());

    if (this.isAccountLocked) {
      this.transactionForm.controls.accountId.setValue(this.lockedAccountId);
      this.transactionForm.controls.accountId.disable();
    }

    if (!this.data?.businessId) {
      this.loadError = 'Business context is required to create a transaction.';
      this.transactionForm.disable();
      return;
    }

    this.loadReferenceData(this.data.businessId);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get splits(): FormArray<FormGroup<TransactionSplitForm>> {
    return this.transactionForm.controls.splits;
  }

  addSplit(): void {
    this.splits.push(this.createSplitGroup());
    this.cdr.markForCheck();
  }

  removeSplit(index: number): void {
    if (this.splits.length === 1) {
      return;
    }
    this.splits.removeAt(index);
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const businessId = this.data?.businessId;
    if (!businessId) {
      this.formError = 'Business context is missing.';
      this.cdr.markForCheck();
      return;
    }

    const rawValue = this.transactionForm.getRawValue();
    const postedAt = rawValue.postedAt;
    if (!postedAt) {
      this.formError = 'Posted date is required.';
      this.cdr.markForCheck();
      return;
    }
    const accountId = rawValue.accountId;
    if (accountId == null) {
      this.formError = 'Select an account for the transaction.';
      this.cdr.markForCheck();
      return;
    }

    if (!rawValue.splits.length) {
      this.formError = 'Add at least one split for the transaction.';
      this.cdr.markForCheck();
      return;
    }

    const trimmedPayee = rawValue.payee.trim();
    if (!trimmedPayee) {
      this.formError = 'Payee is required.';
      this.cdr.markForCheck();
      return;
    }

    for (let i = 0; i < rawValue.splits.length; i += 1) {
      const split = rawValue.splits[i];
      if (split.categoryId == null) {
        this.formError = `Select a category for split ${i + 1}.`;
        this.cdr.markForCheck();
        return;
      }
      if (split.amount == null) {
        this.formError = `Enter an amount for split ${i + 1}.`;
        this.cdr.markForCheck();
        return;
      }
    }

    const splits: TransactionSplit[] = rawValue.splits.map((split) => {
      const memo = split.memo?.trim();
      return {
        categoryId: split.categoryId!,
        amount: Number(split.amount),
        memo: memo?.length ? memo : null
      };
    });

    const payload: CreateTransactionPayload = {
      payee: trimmedPayee,
      postedAt: this.formatDate(postedAt),
      amount: Number(rawValue.amount),
      memo: rawValue.memo?.trim() || undefined,
      vendorId: rawValue.vendorId ?? undefined,
      splits
    };

    this.isSaving = true;
    this.formError = null;
    this.transactionForm.disable();
    this.cdr.markForCheck();

    const sub = this.transactionService
      .createTransaction(businessId, accountId, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.transactionForm.enable();
          if (this.isAccountLocked) {
            this.transactionForm.controls.accountId.disable();
          }
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (transaction: Transaction) => {
          this.dialogRef.close(transaction);
        },
        error: (error) => {
          console.error('Failed to create transaction', error);
          this.formError =
            error?.error?.message || 'Unable to create transaction. Please try again later.';
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.add(sub);
  }

  trackBySplitIndex(_index: number, _item: unknown): number {
    return _index;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private createSplitGroup(): FormGroup<TransactionSplitForm> {
    return this.fb.group({
      categoryId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      amount: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      memo: this.fb.nonNullable.control('')
    });
  }

  private loadReferenceData(businessId: number): void {
    this.isInitializing = true;
    this.loadError = null;
    this.formError = null;
    this.cdr.markForCheck();

    const requests = {
      categories: this.categoryService.getCategoriesForBusiness(businessId),
      vendors: this.vendorService.getVendorsForBusiness(businessId),
      accounts: this.isAccountLocked
        ? of([] as Account[])
        : this.accountService.getAccountsForBusiness(businessId)
    };

    const sub = forkJoin(requests)
      .pipe(
        finalize(() => {
          this.isInitializing = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ categories, vendors, accounts }) => {
          this.categories = categories.filter((category) => category.active !== false);
          this.vendors = vendors.filter((vendor) => vendor.active !== false);
          if (!this.isAccountLocked) {
            this.accounts = accounts;
          }
          if (!this.isAccountLocked && !this.accounts.length) {
            this.formError = 'Create an account before recording transactions.';
          }
        },
        error: (error) => {
          console.error('Failed to load reference data for transaction form', error);
          this.loadError = 'Unable to load data for the transaction form. Please try again later.';
          this.transactionForm.disable();
          this.cdr.markForCheck();
        }
      });

    this.subscriptions.add(sub);
  }
}
