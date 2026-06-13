import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Establishment, EstablishmentUpsertRequest } from '../models/establishment.model';

@Injectable({ providedIn: 'root' })
export class EstablishmentService {
  private readonly http = inject(HttpClient);
  private readonly establishmentUrl = `${environment.apiUrl}/Estabelecimento`;

  getAll(): Observable<Establishment[]> {
    return this.http.get<Establishment[]>(`${this.establishmentUrl}/GetAll`);
  }

  getById(id: string): Observable<Establishment> {
    return this.http.get<Establishment>(`${this.establishmentUrl}/GetById/${id}`);
  }

  create(request: EstablishmentUpsertRequest): Observable<Establishment> {
    return this.http.post<Establishment>(`${this.establishmentUrl}/Create`, request);
  }

  update(id: string, request: EstablishmentUpsertRequest): Observable<Establishment> {
    return this.http.put<Establishment>(`${this.establishmentUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.establishmentUrl}/Delete/${id}`);
  }
}
