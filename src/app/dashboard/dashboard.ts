import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Business} from '../model/business.model';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {FormsModule} from '@angular/forms';
import {CreateBusinessDialog} from '../create-business-dialog/create-business-dialog';
import {MatButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
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
export class Dashboard {
  businesses: Business[] = [];
  selectedBusinessId: number | null = null;
  selectedBusiness: Business | null = null;

  constructor(private dialog: MatDialog) {}

  onSelectBusiness(businessId: number) {
    this.selectedBusiness = this.businesses.find(b => b.id === businessId) || null;
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateBusinessDialog);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.businesses.push(result);
        this.selectedBusinessId = result.id;
        this.selectedBusiness = result;
      }
    });
  }
}
