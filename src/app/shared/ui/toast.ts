import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
export interface Toast { id: number; kind: 'error' | 'success' | 'info'; text: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snack = inject(MatSnackBar);
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private id = 0;
  
  private push(kind: Toast['kind'], text: string) {
    const t = { id: ++this.id, kind, text };
    this._toasts.update((list) => [...list, t]);
    setTimeout(() => this.dismiss(t.id), 4000);
  }

  error(text: string) { this.push('error', text); }
  success(text: string) { this.push('success', text); }
  info(text: string) { this.push('info', text); }
  dismiss(id: number) { this._toasts.update((l) => l.filter((t) => t.id !== id)); }

}
