import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BusinessService } from '../services/business.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  standalone: true,
  styleUrl: './layout.css',
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    AsyncPipe
  ]
})
export class Layout {
  readonly selectedBusiness$;

  constructor(private readonly businessService: BusinessService) {
    this.selectedBusiness$ = this.businessService.selectedBusiness$;
  }
}
