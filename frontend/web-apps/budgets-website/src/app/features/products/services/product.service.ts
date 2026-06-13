import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Product, ProductUpsertRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly productUrl = `${environment.apiUrl}/Produto`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.productUrl}/GetAll`);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.productUrl}/GetById/${id}`);
  }

  create(request: ProductUpsertRequest): Observable<Product> {
    return this.http.post<Product>(`${this.productUrl}/Create`, request);
  }

  update(id: string, request: ProductUpsertRequest): Observable<Product> {
    return this.http.put<Product>(`${this.productUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.productUrl}/Delete/${id}`);
  }
}
