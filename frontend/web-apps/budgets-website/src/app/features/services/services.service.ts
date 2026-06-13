import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ServiceItem, ServiceUpsertRequest } from './models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private readonly http = inject(HttpClient);
  private readonly serviceUrl = `${environment.apiUrl}/Servico`;

  getAll(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.serviceUrl}/GetAll`);
  }

  getById(id: string): Observable<ServiceItem> {
    return this.http.get<ServiceItem>(`${this.serviceUrl}/GetById/${id}`);
  }

  create(request: ServiceUpsertRequest): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(`${this.serviceUrl}/Create`, request);
  }

  update(id: string, request: ServiceUpsertRequest): Observable<ServiceItem> {
    return this.http.put<ServiceItem>(`${this.serviceUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.serviceUrl}/Delete/${id}`);
  }
}
