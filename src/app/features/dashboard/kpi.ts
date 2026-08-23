import { Component, input, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'app-kpi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="kpi"><span class="label">{{ label() }}</span><span class="value">{{ value() }}</span></div>`,
  styles: [`.kpi{display:flex;flex-direction:column;padding:1rem;border:1px solid #ddd;border-radius:.5rem;min-width:140px}
            .label{color:#777;font-size:.8rem}.value{font-size:1.6rem;font-weight:600}`],
})
export class Kpi { label = input.required<string>(); value = input.required<string | number>(); }
