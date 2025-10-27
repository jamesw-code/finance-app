import { Routes } from '@angular/router';
import {Layout} from './layout/layout';
import {Dashboard} from './dashboard/dashboard';
import {Accounts} from './pages/accounts/accounts';
import {Categories} from './pages/categories/categories';
import {NotFound} from './pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      // { path: 'transactions', component: TransactionsComponent },
      { path: 'accounts', component: Accounts },
      { path: 'categories', component: Categories },
      // { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', component: NotFound },
];
