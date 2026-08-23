import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OrdersApi } from './orders-api';
import { Order } from '../../models/order';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
  private api = inject(OrdersApi);

  private _orders = signal<Order[]>([]);
  private _total = signal(0);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _status = signal('');

  readonly orders = this._orders.asReadonly();
  readonly total = this._total.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly status = this._status.asReadonly();

  async load(page = 1, size = 50) {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await firstValueFrom(this.api.list(page, size, this._status() || undefined));
      this._orders.set(res.items);
      this._total.set(res.total);
    } catch {
      this._error.set('Failed to load orders');
    } finally {
      this._loading.set(false);
    }
  }

  setStatus(status: string) {
    this._status.set(status);
    this.load();
  }
}
