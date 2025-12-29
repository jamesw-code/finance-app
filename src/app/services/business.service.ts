import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Business } from '../model/business.model';
import { BUSINESS_API } from '../api-domains';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private readonly storageKey = 'selectedBusiness';
  private readonly selectedBusinessSubject = new BehaviorSubject<Business | null>(null);
  readonly selectedBusiness$ = this.selectedBusinessSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    const storedBusiness = this.loadSelectedBusiness();
    if (storedBusiness) {
      this.selectedBusinessSubject.next(storedBusiness);
    }
  }

  getBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(BUSINESS_API);
  }

  createBusiness(business: Partial<Business>): Observable<Business> {
    return this.http.post<Business>(BUSINESS_API, business);
  }

  updateBusiness(id: number, updates: Partial<Business>): Observable<Business> {
    return this.http.put<Business>(`${BUSINESS_API}/${id}`, updates);
  }

  deleteBusiness(id: number): Observable<void> {
    return this.http.delete<void>(`${BUSINESS_API}/${id}`);
  }

  setSelectedBusiness(business: Business | null): void {
    this.selectedBusinessSubject.next(business);
    this.persistSelectedBusiness(business);
  }

  getSelectedBusiness(): Business | null {
    return this.selectedBusinessSubject.value;
  }

  private loadSelectedBusiness(): Business | null {
    if (!this.hasStorage()) {
      return null;
    }

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as Business;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private persistSelectedBusiness(business: Business | null): void {
    if (!this.hasStorage()) {
      return;
    }

    if (!business) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(business));
  }

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
