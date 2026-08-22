import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from './toast';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-host">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="t.kind" (click)="toast.dismiss(t.id)">{{ t.text }}</div>
      }
    </div>
  `,
  styles: [`
    .toast-host { position: fixed; top: 1rem; right: 1rem; display: flex; flex-direction: column; gap: .5rem; z-index: 1000; }
    .toast { padding: .6rem 1rem; border-radius: .5rem; color: #fff; cursor: pointer; }
    .error { background: #c0392b; } .success { background: #27ae60; } .info { background: #2980b9; }
  `],
})
export class ToastHost { toast = inject(ToastService); }
