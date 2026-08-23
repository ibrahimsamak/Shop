import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { SeriesPoint } from '../../models/dashboard';
@Component({
  selector: 'app-revenue-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="'0 0 ' + width() + ' 120'" class="chart">
      @for (b of bars(); track b.label) {
        <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" fill="#7702ff" />
        <text [attr.x]="b.x + b.w/2" y="118" font-size="6" text-anchor="middle">{{ b.label }}</text>
      }
    </svg>
  `,
  styles: [`.chart{width:100%;height:160px}`],
})
export class RevenueChart {
  series = input.required<SeriesPoint[]>();
  width = computed(() => Math.max(this.series().length * 24, 24));
  bars = computed(() => {
    const s = this.series(); const max = Math.max(...s.map((p) => p.value), 1);
    return s.map((p, i) => {
      const h = (p.value / max) * 100; return { label: p.label, x: i * 24 + 4, w: 16, h, y: 108 - h };
    });
  });
}
