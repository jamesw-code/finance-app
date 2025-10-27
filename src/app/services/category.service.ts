import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = '/api/businesses';

  constructor(private readonly http: HttpClient) {}

  getCategoriesForBusiness(businessId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/${businessId}/categories`);
  }

  createCategory(
    businessId: number,
    category: { name: string; description?: string; parentCategoryId?: number | null }
  ): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/${businessId}/categories`, category);
  }
}
