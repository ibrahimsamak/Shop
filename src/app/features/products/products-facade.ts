import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductsApi } from './products-api';
import { Product } from '../../models/product';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private api = inject(ProductsApi);
  private _products = signal<Product[]>([]);
  private _total = signal(0);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _search = signal('');

  readonly products = this._products.asReadonly();
  readonly total = this._total.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly search = this._search.asReadonly();
  readonly lowStock = computed(() => this._products().filter((p) => p.stock < 5).length);

   async load(page = 1, size = 50) {
    this._loading.set(true); this._error.set(null);
    try {
      const res = await firstValueFrom(this.api.list(page, size, this._search() || undefined));
      this._products.set(res.items); this._total.set(res.total);
    } catch { this._error.set('Failed to load products'); }
    finally { this._loading.set(false); }
  }
  setSearch(q: string) { this._search.set(q); this.load(); }
  async remove(id: number) {
    await firstValueFrom(this.api.remove(id));
    this._products.update((l) => l.filter((p) => p.id !== id));
  }
}
