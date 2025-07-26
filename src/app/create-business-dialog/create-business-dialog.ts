import { Component } from '@angular/core';
import {Business} from '../model/business.model';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';


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
  ],
  templateUrl: './create-business-dialog.html',
  standalone: true,
  styleUrl: './create-business-dialog.scss'
})
export class CreateBusinessDialog {
  business: Partial<Business> = {};

  constructor(
    private dialogRef: MatDialogRef<CreateBusinessDialog>
  ) {}

  onCreate() {
      this.dialogRef.close();
  }

  onCancel() {
    this.dialogRef.close();
  }
}
