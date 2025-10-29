import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from '../model/vendor.model';

export interface CreateVendorRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly baseUrl = '/api/businesses';

  constructor(private readonly http: HttpClient) {}

  getVendorsForBusiness(businessId: number): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.baseUrl}/${businessId}/vendors`);
  }

  createVendor(businessId: number, vendor: CreateVendorRequest): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.baseUrl}/${businessId}/vendors`, vendor);
  }
}
