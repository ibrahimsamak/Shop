import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Page } from '../../models/page';
import { User, UserCreate, UserUpdate } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private base = '/api/users';
  list(page: number, size: number, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get<Page<User>>(this.base, { params });
  }
  get(id: number) { return this.http.get<User>(`${this.base}/${id}`); }
  create(body: UserCreate) { return this.http.post<User>(this.base, body); }
  update(id: number, body: UserUpdate) { return this.http.put<User>(`${this.base}/${id}`, body); }
  remove(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
