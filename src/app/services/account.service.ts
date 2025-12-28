import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../model/account.model';
import { BUSINESS_API } from '../api-domains';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private readonly http: HttpClient) {}

  getAccountsForBusiness(businessId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${BUSINESS_API}/${businessId}/accounts`);
  }

  createAccount(businessId: number, account: { name: string; accountType?: string }): Observable<Account> {
    return this.http.post<Account>(`${BUSINESS_API}/${businessId}/accounts`, account);
  }

  getAccount(businessId: number, accountId: number): Observable<Account> {
    return this.http.get<Account>(`${BUSINESS_API}/${businessId}/accounts/${accountId}`);
  }
}
