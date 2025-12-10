import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../services/business.service';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  standalone: true,
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private readonly businessService = inject(BusinessService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly selectedBusiness = toSignal(this.businessService.selectedBusiness$, {
    initialValue: null
  });

  private readonly routeTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.getCurrentRouteTitle(this.route) ?? 'Dashboard')
    ),
    { initialValue: this.getCurrentRouteTitle(this.route) ?? 'Dashboard' }
  );

  readonly breadcrumbTitle = computed(() => this.buildTitle(this.routeTitle()));

  private getCurrentRouteTitle(route: ActivatedRoute): string | undefined {
    let child = route.firstChild;

    while (child?.firstChild) {
      child = child.firstChild;
    }

    return child?.snapshot?.data?.['title'];
  }

  private buildTitle(title: string): string {
    return `Finance Dashboard - ${title}`;
  }
}
