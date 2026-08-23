import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrdersFacade } from './orders-facade';
import { EmptyState } from '../../shared/ui/empty-state';
import { Order } from '../../models/order';
import { Skeleton } from '../../shared/ui/skeleton';

@Component({
  selector: 'app-order-list',
  imports: [
    Skeleton, ScrollingModule, CurrencyPipe, RouterLink, MatFormFieldModule, MatSelectModule,
    MatIconModule, MatChipsModule, MatProgressBarModule, EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="list-header">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter">
        <mat-label>Status</mat-label>
        <mat-select [value]="facade.status()" (selectionChange)="facade.setStatus($event.value)">
          <mat-option value="">All</mat-option>
          @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
        </mat-select>
      </mat-form-field>
      <span class="spacer"></span>
      <span class="total">{{ facade.total() }} total</span>
    </header>

    @if (facade.loading()) {  <app-skeleton [rows]="8" />}
  
    @if (facade.error()) {
      <app-empty-state [message]="facade.error()!" />
    } @else if (!facade.loading() && facade.orders().length === 0) {
      <app-empty-state message="No orders found." />
    } @else {
      <div class="row head">
        <span>Order</span><span>Customer</span><span>Items</span><span>Total</span>
        <span>Status</span><span class="actions-col"></span>
      </div>
      <cdk-virtual-scroll-viewport itemSize="56" class="viewport">
        <a *cdkVirtualFor="let o of facade.orders(); trackBy: trackById"
           class="row link" [routerLink]="['/orders', o.id]">
          <span class="name">#{{ o.id }}</span>
          <span>{{ o.customer }}</span>
          <span class="muted">{{ o.items.length }}</span>
          <span>{{ o.total | currency }}</span>
          <span>
            <mat-chip highlighted [color]="statusColor(o.status)">{{ o.status }}</mat-chip>
          </span>
          <span class="actions-col"><mat-icon>chevron_right</mat-icon></span>
        </a>
      </cdk-virtual-scroll-viewport>
    }
  `,
  styles: [`
    .list-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: .5rem; }
    .filter { width: 200px; }
    .spacer { flex: 1 1 auto; }
    .total { color: var(--mat-sys-on-surface-variant); }
    .viewport { height: 65vh; border: 1px solid var(--mat-sys-outline-variant); border-radius: .5rem; }
    .row { display: grid; grid-template-columns: .7fr 1.6fr .6fr 1fr 1.2fr 48px; align-items: center;
           gap: 1rem; padding: 0 1rem; height: 56px; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .row.head { height: 44px; font-weight: 600; color: var(--mat-sys-on-surface-variant); }
    .row.link { text-decoration: none; color: inherit; cursor: pointer; }
    .row.link:hover { background: color-mix(in srgb, var(--mat-sys-primary) 6%, transparent); }
    .name { font-weight: 600; }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .actions-col { display: flex; justify-content: flex-end; color: var(--mat-sys-outline); }
  `],
})
export class OrderList {
  facade = inject(OrdersFacade);
  readonly statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  constructor() { this.facade.load(); }

  trackById = (_: number, o: Order) => o.id;

  statusColor(status: string): 'primary' | 'warn' | undefined {
    if (status === 'cancelled') return 'warn';
    if (status === 'delivered') return 'primary';
    return undefined;
  }
}
