import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Business } from '../model/business.model';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { CreateBusinessDialog } from '../create-business-dialog/create-business-dialog';
import { MatButton } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { BusinessService } from '../services/business.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatDialogModule,
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    MatButton,
    MatLabel,
    NgForOf,
    NgIf
  ],
  templateUrl: './dashboard.html',
  standalone: true,
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  businesses: Business[] = [];
  selectedBusinessId: number | null = null;
  selectedBusiness: Business | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private readonly dialog: MatDialog,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBusinesses();
  }

  private loadBusinesses() {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    this.businessService
      .getBusinesses()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (businesses) => {
          this.businesses = businesses;
          if (this.selectedBusinessId != null) {
            this.selectedBusiness = this.businesses.find(b => b.id === this.selectedBusinessId) || null;
          } else if (this.businesses.length > 0) {
            this.selectedBusinessId = this.businesses[0].id;
            this.selectedBusiness = this.businesses[0];
          } else {
            this.selectedBusiness = null;
          }
        },
        error: (error) => {
          console.error('Failed to load businesses', error);
          this.errorMessage = 'Unable to load businesses. Please try again later.';
        }
      });
  }

  onSelectBusiness(businessId: number) {
    this.selectedBusiness = this.businesses.find(b => b.id === businessId) || null;
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateBusinessDialog);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.errorMessage = null;
        this.selectedBusinessId = result.id;
        this.selectedBusiness = result;
        this.loadBusinesses();
      }
    });
  }
}
