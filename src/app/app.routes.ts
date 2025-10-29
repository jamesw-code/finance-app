import { Routes } from '@angular/router';
import {Layout} from './layout/layout';
import {Dashboard} from './dashboard/dashboard';
import {Accounts} from './pages/accounts/accounts';
import {AccountDetail} from './pages/accounts/account-detail/account-detail';
import {Categories} from './pages/categories/categories';
import {Transactions} from './pages/transactions/transactions';
import {Vendors} from './pages/vendors/vendors';
import {NotFound} from './pages/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'transactions', component: Transactions },
      { path: 'vendors', component: Vendors },
      { path: 'accounts/:accountId', component: AccountDetail },
      { path: 'accounts', component: Accounts },
      { path: 'categories', component: Categories },
      // { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', component: NotFound },
];
