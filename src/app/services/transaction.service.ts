import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTransactionRequest, Transaction } from '../model/transaction.model';
import { BUSINESS_API } from '../api-domains';

export type CreateTransactionPayload = Omit<CreateTransactionRequest, 'businessId' | 'accountId'>;

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private readonly http: HttpClient) {}

  getTransactionsForBusiness(businessId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${BUSINESS_API}/${businessId}/transactions`);
  }

  getTransactionsForAccount(businessId: number, accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${BUSINESS_API}/${businessId}/accounts/${accountId}/transactions`);
  }

  createTransaction(
    businessId: number,
    accountId: number,
    transaction: CreateTransactionPayload
  ): Observable<Transaction> {
    const payload: CreateTransactionRequest = { ...transaction, businessId, accountId };
    return this.http.post<Transaction>(
      `${BUSINESS_API}/${businessId}/accounts/${accountId}/transactions`,
      payload
    );
  }
}
