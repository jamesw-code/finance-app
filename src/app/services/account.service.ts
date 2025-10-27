import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../model/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly baseUrl = '/api/businesses';

  constructor(private readonly http: HttpClient) {}

  getAccountsForBusiness(businessId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/${businessId}/accounts`);
  }

  createAccount(businessId: number, account: { name: string; accountType?: string }): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/${businessId}/accounts`, account);
  }

  getAccount(businessId: number, accountId: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${businessId}/accounts/${accountId}`);
  }
}
