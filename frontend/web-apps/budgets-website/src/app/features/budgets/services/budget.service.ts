import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Budget,
  BudgetFileType,
  BudgetSaveRequest,
  QueueBudgetEmailResult
} from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly budgetUrl = `${environment.apiUrl}/Orcamento`;

  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.budgetUrl}/GetAll`);
  }

  getById(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.budgetUrl}/GetById/${id}`);
  }

  create(request: BudgetSaveRequest): Observable<Budget> {
    return this.http.post<Budget>(`${this.budgetUrl}/Create`, request);
  }

  update(id: string, request: BudgetSaveRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.budgetUrl}/Update/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.budgetUrl}/Delete/${id}`);
  }

  generateFile(id: string, fileType: BudgetFileType): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.budgetUrl}/GenerateFile/${id}/${fileType}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  sendByEmail(id: string): Observable<QueueBudgetEmailResult> {
    return this.http.post<QueueBudgetEmailResult>(`${this.budgetUrl}/SendByEmail/${id}`, {});
  }
}
