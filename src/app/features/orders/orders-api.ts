import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Page } from '../../models/page';
import { Order } from '../../models/order';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private http = inject(HttpClient);
  private base = '/api/orders';

  list(page: number, size: number, status?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<Order>>(this.base, { params });
  }

  get(id: number) {
    return this.http.get<Order>(`${this.base}/${id}`);
  }
}
