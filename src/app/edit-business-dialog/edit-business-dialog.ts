import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Business } from '../model/business.model';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../services/business.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-business-dialog',
  standalone: true,
  imports: [
    MatLabel,
    MatFormField,
    FormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatInput,
    MatDialogActions,
    MatButton,
    CommonModule
  ],
  templateUrl: './edit-business-dialog.html',
  styleUrl: './edit-business-dialog.css'
})
export class EditBusinessDialog {
  business: Business;
  isSaving = false;
  errorMessage: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) existingBusiness: Business,
    private readonly dialogRef: MatDialogRef<EditBusinessDialog>,
    private readonly businessService: BusinessService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.business = { ...existingBusiness };
  }

  onSave() {
    const trimmedName = this.business.name?.trim();
    if (!trimmedName) {
      this.errorMessage = 'Business name is required.';
      this.cdr.markForCheck();
      return;
    }

    this.errorMessage = null;
    this.isSaving = true;
    this.cdr.markForCheck();
    this.businessService
      .updateBusiness(this.business.id, {
        name: trimmedName,
        taxId: this.business.taxId?.trim() || undefined
      })
      .pipe(finalize(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (updatedBusiness) => {
          this.dialogRef.close(updatedBusiness);
        },
        error: (error) => {
          console.error('Failed to update business', error);
          this.errorMessage = error?.error?.message || 'Failed to update business. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
