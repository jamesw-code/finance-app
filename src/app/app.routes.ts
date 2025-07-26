import { Routes } from '@angular/router';
import {Layout} from './layout/layout';
import {Dashboard} from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      // { path: 'transactions', component: TransactionsComponent },
      // { path: 'accounts', component: AccountsComponent },
      // { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
