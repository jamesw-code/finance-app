import { ChangeDetectorRef, Component } from '@angular/core';
import { Business } from '../model/business.model';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { BusinessService } from '../services/business.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-business-dialog',
  imports: [
    MatLabel,
    MatFormField,
    FormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatInput,
    MatDialogActions,
    MatButton,
    NgIf,
  ],
  templateUrl: './create-business-dialog.html',
  standalone: true,
  styleUrl: './create-business-dialog.scss'
})
export class CreateBusinessDialog {
  business: Partial<Business> = {};
  isSaving = false;
  errorMessage: string | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<CreateBusinessDialog>,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  onCreate() {
    const trimmedName = this.business.name?.trim();
    if (!trimmedName) {
      this.errorMessage = 'Business name is required.';
      this.cdr.markForCheck();
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;
    this.cdr.markForCheck();
    this.businessService.createBusiness({
      name: trimmedName,
      taxId: this.business.taxId?.trim() || undefined
    })
      .pipe(finalize(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (createdBusiness) => {
          this.dialogRef.close(createdBusiness);
        },
        error: (error) => {
          console.error('Failed to create business', error);
          this.errorMessage = error?.error?.message || 'Failed to create business. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
