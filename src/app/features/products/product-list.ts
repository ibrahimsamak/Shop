import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductsFacade } from './products-facade';
import { AuthStore } from '../../core/auth/auth-store';
import { EmptyState } from '../../shared/ui/empty-state';
import { Product } from '../../models/product';
import { HasRole } from '../../shared/directives/has-role';

@Component({
  selector: 'app-product-list',
  imports: [
    HasRole,
    ScrollingModule, CurrencyPipe, RouterLink, MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatChipsModule, MatProgressBarModule, MatTooltipModule, EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="list-header">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search">
        <mat-label>Search products</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [value]="facade.search()"
               (input)="facade.setSearch($any($event.target).value)" placeholder="Name…" />
      </mat-form-field>
      <span class="spacer"></span>
      <span class="low" [class.warn]="facade.lowStock() > 0">{{ facade.lowStock() }} low-stock</span>
      <span class="total">{{ facade.total() }} total</span>
        <a *appHasRole="['admin']" mat-flat-button color="primary" routerLink="/products/new">
          <mat-icon>add</mat-icon> New product
        </a>
    </header>

    @if (facade.loading()) { <mat-progress-bar mode="indeterminate" /> }

    @if (facade.error()) {
      <app-empty-state [message]="facade.error()!" />
    } @else if (!facade.loading() && facade.products().length === 0) {
      <app-empty-state message="No products found." />
    } @else {
      <div class="row head">
        <span></span><span>Name</span><span>Price</span><span>Stock</span><span>Category</span>
        <span class="actions-col">Actions</span>
      </div>
      <cdk-virtual-scroll-viewport itemSize="64" class="viewport">
        <div *cdkVirtualFor="let p of facade.products(); trackBy: trackById" class="row">
          <span class="thumb">
            @if (p.imageUrl) { <img [src]="p.imageUrl" [alt]="p.name" /> }
            @else { <mat-icon>image</mat-icon> }
          </span>
          <span class="name">{{ p.name }}</span>
          <span>{{ p.price | currency }}</span>
          <span>
            <mat-chip [highlighted]="p.stock < 5" [color]="p.stock < 5 ? 'warn' : undefined">
              {{ p.stock }}
            </mat-chip>
          </span>
          <span class="muted">{{ p.category }}</span>
          <span class="actions-col">
            @if (auth.hasRole('admin','manager')) {
              <a mat-icon-button [routerLink]="['/products', p.id, 'edit']" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </a>
            }
            @if (auth.hasRole('admin')) {
              <button mat-icon-button color="warn" matTooltip="Delete" (click)="confirmDelete(p)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </span>
        </div>
      </cdk-virtual-scroll-viewport>
    }
  `,
  styles: [`
    .list-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: .5rem; }
    .search { width: min(360px, 100%); }
    .spacer { flex: 1 1 auto; }
    .total, .low { color: var(--mat-sys-on-surface-variant); }
    .low.warn { color: var(--mat-sys-error); font-weight: 600; }
    .viewport { height: 65vh; border: 1px solid var(--mat-sys-outline-variant); border-radius: .5rem; }
    .row { display: grid; grid-template-columns: 48px 2fr 1fr 1fr 1.2fr 110px; align-items: center;
           gap: 1rem; padding: 0 1rem; height: 64px; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .row.head { height: 44px; font-weight: 600; color: var(--mat-sys-on-surface-variant); }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .thumb { display: flex; align-items: center; justify-content: center; }
    .thumb img { width: 40px; height: 40px; object-fit: cover; border-radius: .25rem; }
    .thumb mat-icon { color: var(--mat-sys-outline); }
    .actions-col { display: flex; justify-content: flex-end; gap: .25rem; }
  `],
})
export class ProductList {
  facade = inject(ProductsFacade);
  auth = inject(AuthStore);
  constructor() { this.facade.load(); }
  trackById = (_: number, p: Product) => p.id;
  confirmDelete(p: Product) {
    if (confirm(`Delete ${p.name}?`)) this.facade.remove(p.id);
  }
}
