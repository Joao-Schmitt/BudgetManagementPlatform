import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaymentMethod, PaymentMethodUpsertRequest } from '../models/payment-method.model';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly http = inject(HttpClient);
  private readonly paymentMethodUrl = `${environment.apiUrl}/FormaPagamento`;

  getAll(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.paymentMethodUrl}/GetAll`);
  }

  getById(id: string): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.paymentMethodUrl}/GetById/${id}`);
  }

  create(request: PaymentMethodUpsertRequest): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.paymentMethodUrl}/Create`, request);
  }

  update(id: string, request: PaymentMethodUpsertRequest): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.paymentMethodUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.paymentMethodUrl}/Delete/${id}`);
  }
}
