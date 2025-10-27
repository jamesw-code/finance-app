import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Business } from '../model/business.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private readonly baseUrl = '/api/businesses';
  private readonly selectedBusinessSubject = new BehaviorSubject<Business | null>(null);
  readonly selectedBusiness$ = this.selectedBusinessSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(this.baseUrl);
  }

  createBusiness(business: Partial<Business>): Observable<Business> {
    return this.http.post<Business>(this.baseUrl, business);
  }

  setSelectedBusiness(business: Business | null): void {
    this.selectedBusinessSubject.next(business);
  }

  getSelectedBusiness(): Business | null {
    return this.selectedBusinessSubject.value;
  }
}
