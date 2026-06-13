import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  UpdateUserEmailRequest,
  UpdateUserNameRequest,
  UpdateUserPasswordRequest,
  UserProfile
} from '../models/user-settings.model';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private readonly http = inject(HttpClient);
  private readonly userUrl = `${environment.apiUrl}/Usuario`;
  private readonly authUrl = `${environment.apiUrl}/Auth`;

  updateName(request: UpdateUserNameRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.userUrl}/UpdateName`, request);
  }

  updateEmail(request: UpdateUserEmailRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.userUrl}/UpdateEmail`, request);
  }

  updatePassword(request: UpdateUserPasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.userUrl}/UpdatePassword`, request);
  }

  disableTwoFactor(code: string): Observable<void> {
    const params = new HttpParams().set('code', code);

    return this.http.post<void>(`${this.authUrl}/DisableTwoFactor`, {}, { params });
  }
}
