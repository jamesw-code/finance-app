import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryKind } from '../model/category.model';
import { BUSINESS_API } from '../api-domains';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private readonly http: HttpClient) {}

  getCategoriesForBusiness(businessId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${BUSINESS_API}/${businessId}/categories`);
  }

  createCategory(
    businessId: number,
    category: {
      name: string;
      description?: string;
      parentCategoryId?: number | null;
      kind: CategoryKind;
      active: boolean;
    }
  ): Observable<Category> {
    return this.http.post<Category>(`${BUSINESS_API}/${businessId}/categories`, category);
  }
}
