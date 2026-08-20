import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccessTokenResponse, LoginRequest, TokenResponse } from '../../models/auth';
import { User } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private base = '/api/auth';
  login(body: LoginRequest) {
    return this.http.post<TokenResponse>(`${this.base}/login`, body)
  }
  refresh(refreshToken: string) {
    return this.http.post<AccessTokenResponse>(`${this.base}/refresh`, { refreshToken })
  }
  logout(refreshToken: string)
  {
    return this.http.post<void>(`${this.base}/logout`, { refreshToken });
  }
  me() {
    return this.http.get<User>(`${this.base}/me`);
  }

}
