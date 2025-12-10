import { Routes } from '@angular/router';
import {Layout} from './layout/layout';
import {Dashboard} from './dashboard/dashboard';
import {Accounts} from './pages/accounts/accounts';
import {AccountDetail} from './pages/accounts/account-detail/account-detail';
import {Categories} from './pages/categories/categories';
import {Transactions} from './pages/transactions/transactions';
import {Vendors} from './pages/vendors/vendors';
import {NotFound} from './pages/not-found/not-found';
import {Reports} from './pages/reports/reports';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard, data: { title: 'Dashboard' } },
      { path: 'transactions', component: Transactions, data: { title: 'Transactions' } },
      { path: 'vendors', component: Vendors, data: { title: 'Vendors' } },
      { path: 'accounts/:accountId', component: AccountDetail, data: { title: 'Account Details' } },
      { path: 'accounts', component: Accounts, data: { title: 'Accounts' } },
      { path: 'categories', component: Categories, data: { title: 'Categories' } },
      { path: 'reports', component: Reports, data: { title: 'Reports' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', component: NotFound },
];
