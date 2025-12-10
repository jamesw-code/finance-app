import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize, Subscription } from 'rxjs';
import { Business } from '../../model/business.model';
import { Transaction } from '../../model/transaction.model';
import { BusinessService } from '../../services/business.service';
import { TransactionService } from '../../services/transaction.service';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
  imports: [CommonModule, RouterModule, MatButtonModule, MatDialogModule, DatePipe, CurrencyPipe]
})
export class Transactions implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  selectedBusiness: Business | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  private readonly subscriptions = new Subscription();
  private readonly businessService = inject(BusinessService);
  private readonly transactionService = inject(TransactionService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const sub = this.businessService.selectedBusiness$.subscribe((business) => {
      this.selectedBusiness = business;
      this.transactions = [];
      this.errorMessage = null;
      if (business?.id != null) {
        this.loadTransactions(business.id);
      }
      this.cdr.markForCheck();
    });

    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openAddTransactionDialog(): void {
    if (!this.selectedBusiness || this.selectedBusiness.id == null) {
      return;
    }

    const dialogRef = this.dialog.open(TransactionFormComponent, {
      width: '720px',
      data: {
        businessId: this.selectedBusiness.id
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

  private loadTransactions(businessId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const sub = this.transactionService
      .getTransactionsForBusiness(businessId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
        },
        error: (error) => {
          console.error('Failed to load transactions', error);
          this.errorMessage = 'Unable to load transactions. Please try again later.';
        }
      });

    this.subscriptions.add(sub);
  }
}
