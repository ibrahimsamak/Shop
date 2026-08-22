import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { parseArgs } from 'util';
import { Page } from '../../models/page';
import { Product, ProductCreate, ProductUpdate } from '../../models/product';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private http = inject(HttpClient);
  private base = '/api/products';

  list(page: number, size: number, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q)
    return this.http.get<Page<Product>>(`${this.base}`,{params})
  }
  get(id: number) { return this.http.get<Product>(`${this.base}/${id}`); }
  create(body: ProductCreate) { return this.http.post<Product>(this.base, body); }
  update(id: number, body: ProductUpdate) { return this.http.put<Product>(`${this.base}/${id}`, body); }
  remove(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
  uploadImage(id: number, file: File) {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<{url: string}>(`${this.base}/${id}/image`, fd)
  }
}
