import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Vendor, VendorUpsertRequest } from '../models/vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly http = inject(HttpClient);
  private readonly vendorUrl = `${environment.apiUrl}/Vendedor`;

  getAll(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.vendorUrl}/GetAll`);
  }

  getById(id: string): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.vendorUrl}/GetById/${id}`);
  }

  create(request: VendorUpsertRequest): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.vendorUrl}/Create`, request);
  }

  update(id: string, request: VendorUpsertRequest): Observable<Vendor> {
    return this.http.put<Vendor>(`${this.vendorUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.vendorUrl}/Delete/${id}`);
  }
}
