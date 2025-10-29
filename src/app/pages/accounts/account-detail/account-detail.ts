import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription, combineLatest, finalize } from 'rxjs';
import { Account } from '../../../model/account.model';
import { Business } from '../../../model/business.model';
import { AccountService } from '../../../services/account.service';
import { BusinessService } from '../../../services/business.service';
import { Transaction } from '../../../model/transaction.model';
import { TransactionService } from '../../../services/transaction.service';
import { TransactionFormComponent } from '../../transactions/transaction-form/transaction-form.component';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.scss',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    DatePipe,
    CurrencyPipe
  ]
})
export class AccountDetail implements OnInit, OnDestroy {
  account: Account | null = null;
  selectedBusiness: Business | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  transactions: Transaction[] = [];
  transactionsLoading = false;
  transactionsError: string | null = null;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly accountService = inject(AccountService);
  private readonly businessService = inject(BusinessService);
  private readonly transactionService = inject(TransactionService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscriptions = new Subscription();
  private activeAccountRequest: Subscription | null = null;
  private activeTransactionsRequest: Subscription | null = null;

  ngOnInit(): void {
    const sub = combineLatest([this.route.paramMap, this.businessService.selectedBusiness$]).subscribe(
      ([params, business]) => {
        this.selectedBusiness = business;

        const accountIdParam = params.get('accountId');
        const accountId = accountIdParam ? Number(accountIdParam) : NaN;

        if (!accountIdParam || Number.isNaN(accountId)) {
          this.resetState('Account not found.');
          return;
        }

        if (!business || business.id == null) {
          this.resetState('Select a business to view account details.');
          return;
        }

        this.loadAccount(business.id, accountId);
      }
    );

    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    if (this.activeAccountRequest) {
      this.activeAccountRequest.unsubscribe();
    }
    if (this.activeTransactionsRequest) {
      this.activeTransactionsRequest.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  private loadAccount(businessId: number, accountId: number): void {
    if (this.activeAccountRequest) {
      this.activeAccountRequest.unsubscribe();
    }

    this.account = null;
    this.errorMessage = null;
    this.isLoading = true;
    this.transactions = [];
    this.transactionsError = null;
    this.transactionsLoading = false;
    this.cdr.markForCheck();

    const sub = this.accountService
      .getAccount(businessId, accountId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (account) => {
          this.account = account;
          this.loadTransactions(businessId, accountId);
        },
        error: (error) => {
          console.error('Failed to load account details', error);
          this.errorMessage = 'Unable to load account details. Please try again later.';
          this.transactions = [];
          this.transactionsError = null;
        }
      });

    this.activeAccountRequest = sub;
    this.subscriptions.add(sub);
  }

  private resetState(message: string): void {
    if (this.activeAccountRequest) {
      this.activeAccountRequest.unsubscribe();
      this.activeAccountRequest = null;
    }
    if (this.activeTransactionsRequest) {
      this.activeTransactionsRequest.unsubscribe();
      this.activeTransactionsRequest = null;
    }

    this.account = null;
    this.errorMessage = message;
    this.isLoading = false;
    this.transactions = [];
    this.transactionsError = null;
    this.transactionsLoading = false;
    this.cdr.markForCheck();
  }

  openAddTransactionDialog(): void {
    if (!this.selectedBusiness || this.selectedBusiness.id == null || !this.account) {
      return;
    }

    const dialogRef = this.dialog.open(TransactionFormComponent, {
      width: '720px',
      data: {
        businessId: this.selectedBusiness.id,
        account: this.account
      }
    });

    const dialogSub = dialogRef.afterClosed().subscribe((created?: Transaction) => {
      if (created) {
        this.transactions = [created, ...this.transactions];
        this.cdr.markForCheck();
      }
    });

    this.subscriptions.add(dialogSub);
  }

  trackByTransactionId(_index: number, transaction: Transaction): number {
    return transaction.id;
  }

  private loadTransactions(businessId: number, accountId: number): void {
    if (this.activeTransactionsRequest) {
      this.activeTransactionsRequest.unsubscribe();
      this.activeTransactionsRequest = null;
    }

    this.transactionsLoading = true;
    this.transactionsError = null;
    this.cdr.markForCheck();

    const sub = this.transactionService
      .getTransactionsForAccount(businessId, accountId)
      .pipe(
        finalize(() => {
          this.transactionsLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
        },
        error: (error) => {
          console.error('Failed to load account transactions', error);
          this.transactionsError = 'Unable to load transactions for this account.';
          this.transactions = [];
        }
      });

    this.activeTransactionsRequest = sub;
    this.subscriptions.add(sub);
  }
}
