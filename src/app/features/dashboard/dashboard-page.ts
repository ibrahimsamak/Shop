import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DashboardApi } from './dashboard-api';
import { DashboardSummary } from '../../models/dashboard';
import { Kpi } from './kpi';
import { RevenueChart } from './revenue-chart';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  imports: [Kpi, RevenueChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as d) {
      <section class="kpis">
        <app-kpi label="Revenue" [value]="d.revenue" />
        <app-kpi label="Orders" [value]="d.orderCount" />
        <app-kpi label="Users" [value]="d.userCount" />
        <app-kpi label="Low stock" [value]="d.lowStock" />
      </section>
      @defer (on viewport) {
        <app-revenue-chart [series]="d.revenueSeries" />
      } @placeholder {
        <div class="skeleton" style="height:160px">Chart…</div>
      }
    } @else {
      <p>Loading dashboard…</p>
    }
  `,
  styles: [`.kpis{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}`],
})
export class DashboardPage {
  private api = inject(DashboardApi);
  data = signal<DashboardSummary | null>(null);
  constructor() { this.api.summary().subscribe((d) => this.data.set(d)); }
}
