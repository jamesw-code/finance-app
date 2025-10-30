import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { Business } from '../../model/business.model';
import { Category, CategoryKind } from '../../model/category.model';
import { Transaction } from '../../model/transaction.model';
import { BusinessService } from '../../services/business.service';
import { CategoryService } from '../../services/category.service';
import { TransactionService } from '../../services/transaction.service';

interface IncomeStatementCategoryTotal {
  categoryId: number;
  categoryName: string;
  total: number;
}

interface IncomeStatementMonthlyBreakdown {
  key: string;
  label: string;
  income: number;
  expenses: number;
  netIncome: number;
}

interface IncomeStatement {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  periodLabel: string | null;
  incomeByCategory: IncomeStatementCategoryTotal[];
  expensesByCategory: IncomeStatementCategoryTotal[];
  monthlyBreakdown: IncomeStatementMonthlyBreakdown[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Reports implements OnInit, OnDestroy {
  incomeStatement: IncomeStatement | null = null;
  selectedBusiness: Business | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  private readonly subscriptions = new Subscription();
  private readonly businessService = inject(BusinessService);
  private readonly categoryService = inject(CategoryService);
  private readonly transactionService = inject(TransactionService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const sub = this.businessService.selectedBusiness$.subscribe((business) => {
      this.selectedBusiness = business;
      this.incomeStatement = null;
      this.errorMessage = null;
      if (business?.id != null) {
        this.loadIncomeStatement(business.id);
      } else {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });

    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  trackByMonthKey(_index: number, breakdown: IncomeStatementMonthlyBreakdown): string {
    return breakdown.key;
  }

  private loadIncomeStatement(businessId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const sub = forkJoin({
      categories: this.categoryService.getCategoriesForBusiness(businessId),
      transactions: this.transactionService.getTransactionsForBusiness(businessId)
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ categories, transactions }) => {
          this.incomeStatement = this.buildIncomeStatement(categories, transactions);
        },
        error: (error) => {
          console.error('Failed to load income statement data', error);
          this.errorMessage = 'Unable to load report data. Please try again later.';
        }
      });

    this.subscriptions.add(sub);
  }

  private buildIncomeStatement(categories: Category[], transactions: Transaction[]): IncomeStatement | null {
    if (!categories.length || !transactions.length) {
      return null;
    }

    const categoryMap = new Map<number, Category>();
    categories.forEach((category) => {
      categoryMap.set(category.id, category);
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    const incomeByCategory = new Map<number, number>();
    const expensesByCategory = new Map<number, number>();
    const monthlyBreakdown = new Map<
      string,
      { income: number; expenses: number; date: Date }
    >();

    transactions.forEach((transaction) => {
      const transactionDate = transaction.postedAt ? new Date(transaction.postedAt) : null;
      if (!transactionDate || Number.isNaN(transactionDate.getTime())) {
        return;
      }

      const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      let monthly = monthlyBreakdown.get(monthKey);
      if (!monthly) {
        monthly = {
          income: 0,
          expenses: 0,
          date: new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1)
        };
        monthlyBreakdown.set(monthKey, monthly);
      }

      transaction.splits?.forEach((split) => {
        const category = split?.categoryId != null ? categoryMap.get(split.categoryId) : undefined;
        if (!category) {
          return;
        }

        const amount = Number(split.amount ?? 0);
        if (!Number.isFinite(amount) || amount === 0) {
          return;
        }

        if (category.kind === CategoryKind.INCOME) {
          totalIncome += amount;
          monthly.income += amount;
          incomeByCategory.set(category.id, (incomeByCategory.get(category.id) ?? 0) + amount);
        } else if (category.kind === CategoryKind.EXPENSE) {
          const expenseAmount = Math.abs(amount);
          totalExpenses += expenseAmount;
          monthly.expenses += expenseAmount;
          expensesByCategory.set(category.id, (expensesByCategory.get(category.id) ?? 0) + expenseAmount);
        }
      });
    });

    if (totalIncome === 0 && totalExpenses === 0) {
      return null;
    }

    const monthFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    });

    const monthly = Array.from(monthlyBreakdown.entries())
      .map(([key, value]) => ({
        key,
        label: monthFormatter.format(value.date),
        income: value.income,
        expenses: value.expenses,
        netIncome: value.income - value.expenses,
        sortDate: value.date
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ sortDate, ...rest }) => rest);

    const periodLabel = monthly.length
      ? monthly.length === 1
        ? monthly[0].label
        : `${monthly[0].label} – ${monthly[monthly.length - 1].label}`
      : null;

    const incomeCategories = Array.from(incomeByCategory.entries())
      .map(([categoryId, total]) => ({
        categoryId,
        categoryName: categoryMap.get(categoryId)?.name ?? 'Uncategorized',
        total
      }))
      .sort((a, b) => b.total - a.total);

    const expenseCategories = Array.from(expensesByCategory.entries())
      .map(([categoryId, total]) => ({
        categoryId,
        categoryName: categoryMap.get(categoryId)?.name ?? 'Uncategorized',
        total
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      periodLabel,
      incomeByCategory: incomeCategories,
      expensesByCategory: expenseCategories,
      monthlyBreakdown: monthly
    };
  }
}
