import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, combineLatest, finalize } from 'rxjs';
import { Account } from '../../../model/account.model';
import { Business } from '../../../model/business.model';
import { AccountService } from '../../../services/account.service';
import { BusinessService } from '../../../services/business.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.scss',
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, NgIf]
})
export class AccountDetail implements OnInit, OnDestroy {
  account: Account | null = null;
  selectedBusiness: Business | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly accountService = inject(AccountService);
  private readonly businessService = inject(BusinessService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscriptions = new Subscription();
  private activeAccountRequest: Subscription | null = null;

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
        },
        error: (error) => {
          console.error('Failed to load account details', error);
          this.errorMessage = 'Unable to load account details. Please try again later.';
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

    this.account = null;
    this.errorMessage = message;
    this.isLoading = false;
    this.cdr.markForCheck();
  }
}
