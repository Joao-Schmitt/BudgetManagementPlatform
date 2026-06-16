import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  TemplateOrcamento,
  TemplateOrcamentoMacro,
  TemplateOrcamentoUpsertRequest,
} from '../models/template-orcamento.model';

@Injectable({ providedIn: 'root' })
export class TemplateOrcamentoService {
  private readonly http = inject(HttpClient);
  private readonly templateOrcamentoUrl = `${environment.apiUrl}/TemplateOrcamento`;

  getAll(): Observable<TemplateOrcamento[]> {
    return this.http.get<TemplateOrcamento[]>(`${this.templateOrcamentoUrl}/GetAll`);
  }

  getAllMacros(): Observable<TemplateOrcamentoMacro[]> {
    return this.http.get<TemplateOrcamentoMacro[]>(`${this.templateOrcamentoUrl}/GetAllMacros`);
  }

  getById(id: string): Observable<TemplateOrcamento> {
    return this.http.get<TemplateOrcamento>(`${this.templateOrcamentoUrl}/GetById/${id}`);
  }

  create(request: TemplateOrcamentoUpsertRequest): Observable<TemplateOrcamento> {
    return this.http.post<TemplateOrcamento>(`${this.templateOrcamentoUrl}/Create`, request);
  }

  update(id: string, request: TemplateOrcamentoUpsertRequest): Observable<TemplateOrcamento> {
    return this.http.put<TemplateOrcamento>(`${this.templateOrcamentoUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.templateOrcamentoUrl}/Delete/${id}`);
  }
}
