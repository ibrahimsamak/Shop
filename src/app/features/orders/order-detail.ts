import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrdersApi } from './orders-api';
import { EmptyState } from '../../shared/ui/empty-state';
import { Order } from '../../models/order';
import { RelativeTime } from '../../shared/pipes/relative-time';

@Component({
  selector: 'app-order-detail',
  imports: [
    RelativeTime,
    CurrencyPipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatListModule, MatDividerModule, MatProgressBarModule, EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a mat-button routerLink="/orders" class="back">
      <mat-icon>arrow_back</mat-icon> Back to orders
    </a>

    @if (loading()) {
      <mat-progress-bar mode="indeterminate" />
    } @else if (error()) {
      <app-empty-state [message]="error()!" />
    } @else if (order(); as o) {
      <div class="detail">
        <mat-card appearance="outlined">
          <mat-card-header>
            <mat-card-title>Order #{{ o.id }}</mat-card-title>
            <mat-card-subtitle>{{ o.customer }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="summary">
              <mat-chip highlighted [color]="statusColor(o.status)">{{ o.status }}</mat-chip>
              <span class="total">Total: <strong>{{ o.total | currency }}</strong></span>
            </div>

            <mat-divider />

            <h3>Items</h3>
            <mat-list>
              @for (it of o.items; track it.productId) {
                <mat-list-item>
                  <mat-icon matListItemIcon>inventory_2</mat-icon>
                  <span matListItemTitle>{{ it.name }}</span>
                  <span matListItemLine>{{ it.quantity }} × {{ it.price | currency }}</span>
                  <span matListItemMeta>{{ it.price * it.quantity | currency }}</span>
                </mat-list-item>
              }
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="timeline-card">
          <mat-card-header>
            <mat-card-title>Timeline</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ol class="timeline">
              @for (t of o.timeline; track t.at; let last = $last) {
                <li class="event" [class.current]="last">
                  <span class="dot"></span>
                  <div class="event-body">
                    <span class="event-status">{{ t.status }}</span>
                    <span class="event-at">{{ t.at | relativeTime }}</span>
                  </div>
                </li>
              }
            </ol>
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <app-empty-state message="Order not found." />
    }
  `,
  styles: [`
    .back { margin-bottom: .5rem; }
    .detail { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: start; }
    @media (max-width: 800px) { .detail { grid-template-columns: 1fr; } }
    .summary { display: flex; align-items: center; gap: 1rem; margin: .5rem 0 1rem; }
    .total { color: var(--mat-sys-on-surface-variant); }
    h3 { margin: 1rem 0 .25rem; }

    .timeline { list-style: none; margin: 0; padding: .5rem 0 0; }
    .event { position: relative; padding: 0 0 1.25rem 1.5rem; }
    .event:not(:last-child)::before {
      content: ''; position: absolute; left: 5px; top: .4rem; bottom: -.2rem;
      width: 2px; background: var(--mat-sys-outline-variant);
    }
    .dot {
      position: absolute; left: 0; top: .35rem; width: 12px; height: 12px; border-radius: 50%;
      background: var(--mat-sys-outline); border: 2px solid var(--mat-sys-surface);
    }
    .event.current .dot { background: var(--mat-sys-primary); }
    .event-body { display: flex; flex-direction: column; }
    .event-status { text-transform: capitalize; font-weight: 600; }
    .event-at { color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-label-small); }
  `],
})
export class OrderDetail {
  private api = inject(OrdersApi);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.get(id).subscribe({
      next: (o) => { this.order.set(o); this.loading.set(false); },
      error: () => { this.error.set('Failed to load order'); this.loading.set(false); },
    });
  }

  statusColor(status: string): 'primary' | 'warn' | undefined {
    if (status === 'cancelled') return 'warn';
    if (status === 'delivered') return 'primary';
    return undefined;
  }
}
