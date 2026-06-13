import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Customer, CustomerUpsertRequest } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly customerUrl = `${environment.apiUrl}/Cliente`;

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.customerUrl}/GetAll`);
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.customerUrl}/GetById/${id}`);
  }

  create(request: CustomerUpsertRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.customerUrl}/Create`, request);
  }

  update(id: string, request: CustomerUpsertRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.customerUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.customerUrl}/Delete/${id}`);
  }
}
