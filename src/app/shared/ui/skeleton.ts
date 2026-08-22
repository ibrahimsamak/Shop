import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (row of rowsArray(); track row) {
      <div class="skeleton-row"></div>
    }
  `,
  styles: [`
    .skeleton-row { height: 2.5rem; margin: .4rem 0; border-radius: .25rem;
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
      background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
  `],
})
export class Skeleton {
  rows = input(6);
  protected rowsArray = () => Array.from({ length: this.rows() }, (_, i) => i);
}
