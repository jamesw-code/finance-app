import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Business } from '../model/business.model';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { CreateBusinessDialog } from '../create-business-dialog/create-business-dialog';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../services/business.service';
import { finalize } from 'rxjs/operators';
import { EditBusinessDialog } from '../edit-business-dialog/edit-business-dialog';

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
    CommonModule
  ],
  templateUrl: './dashboard.html',
  standalone: true,
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  businesses: Business[] = [];
  selectedBusinessId: number | null = null;
  selectedBusiness: Business | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  deletingBusinessId: number | null = null;

  constructor(
    private readonly dialog: MatDialog,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const existingSelection = this.businessService.getSelectedBusiness();
    if (existingSelection) {
      this.selectedBusinessId = existingSelection.id;
      this.selectedBusiness = existingSelection;
    }
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
          const existingSelection = this.selectedBusinessId != null
            ? this.businesses.find(b => b.id === this.selectedBusinessId) || null
            : null;

          if (existingSelection) {
            this.selectedBusiness = existingSelection;
          } else if (this.businesses.length > 0) {
            this.selectedBusinessId = this.businesses[0].id;
            this.selectedBusiness = this.businesses[0];
          } else {
            this.selectedBusinessId = null;
            this.selectedBusiness = null;
          }
          this.businessService.setSelectedBusiness(this.selectedBusiness);
        },
        error: (error) => {
          console.error('Failed to load businesses', error);
          this.errorMessage = 'Unable to load businesses. Please try again later.';
        }
      });
  }

  onSelectBusiness(businessId: number) {
    this.selectedBusinessId = businessId;
    this.selectedBusiness = this.businesses.find(b => b.id === businessId) || null;
    this.businessService.setSelectedBusiness(this.selectedBusiness);
  }

  openEditDialog(business: Business) {
    const dialogRef = this.dialog.open(EditBusinessDialog, {
      data: business
    });

    dialogRef.afterClosed().subscribe((result: Business | undefined) => {
      if (result) {
        this.errorMessage = null;
        this.selectedBusinessId = result.id;
        this.selectedBusiness = result;
        this.businessService.setSelectedBusiness(this.selectedBusiness);
        this.loadBusinesses();
      }
    });
  }

  deleteBusiness(business: Business) {
    const confirmed = confirm(`Delete ${business.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    this.deletingBusinessId = business.id;
    this.errorMessage = null;
    this.businessService
      .deleteBusiness(business.id)
      .pipe(finalize(() => {
        this.deletingBusinessId = null;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.businesses = this.businesses.filter(b => b.id !== business.id);
          if (this.selectedBusinessId === business.id) {
            const nextBusiness = this.businesses[0] || null;
            this.selectedBusinessId = nextBusiness?.id ?? null;
            this.selectedBusiness = nextBusiness;
          }
          this.businessService.setSelectedBusiness(this.selectedBusiness);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to delete business', error);
          this.errorMessage = 'Unable to delete business. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  isDeleting(businessId: number): boolean {
    return this.deletingBusinessId === businessId;
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateBusinessDialog);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.errorMessage = null;
        this.selectedBusinessId = result.id;
        this.selectedBusiness = result;
        this.businessService.setSelectedBusiness(this.selectedBusiness);
        this.loadBusinesses();
      }
    });
  }
}
