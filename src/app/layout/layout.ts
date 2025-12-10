import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../services/business.service';
import { filter} from 'rxjs';

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
    CommonModule
  ]
})
export class Layout {
  readonly selectedBusiness$;
  breadcrumbTitle = this.buildTitle('Dashboard');

  constructor(
    private readonly businessService: BusinessService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.selectedBusiness$ = this.businessService.selectedBusiness$;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const title = this.getCurrentRouteTitle(this.route) ?? 'Dashboard';
        this.breadcrumbTitle = this.buildTitle(title);
      });
  }

  private getCurrentRouteTitle(route: ActivatedRoute): string | undefined {
    let child = route.firstChild;

    while (child?.firstChild) {
      child = child.firstChild;
    }

    return child?.snapshot.data?.['title'];
  }

  private buildTitle(title: string): string {
    return `Finance Dashboard - ${title}`;
  }
}
