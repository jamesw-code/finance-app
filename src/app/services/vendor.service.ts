import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from '../model/vendor.model';
import { BUSINESS_API } from '../api-domains';

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
  constructor(private readonly http: HttpClient) {}

  getVendorsForBusiness(businessId: number): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${BUSINESS_API}/${businessId}/vendors`);
  }

  createVendor(businessId: number, vendor: CreateVendorRequest): Observable<Vendor> {
    return this.http.post<Vendor>(`${BUSINESS_API}/${businessId}/vendors`, vendor);
  }
}
