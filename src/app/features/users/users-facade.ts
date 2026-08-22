import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UsersApi } from './users-api';
import { User } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UsersFacade {
  private api = inject(UsersApi);
  private _users = signal<User[]>([]);
  private _total = signal(0);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _search = signal('');

  readonly users = this._users.asReadonly();
  readonly total = this._total.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly search = this._search.asReadonly();

  async load(page = 1, size = 50) {
    this._loading.set(true); this._error.set(null);
    try {
      const res = await firstValueFrom(this.api.list(page, size, this._search() || undefined));
      this._users.set(res.items); this._total.set(res.total);
    } catch { this._error.set('Failed to load users'); }
    finally { this._loading.set(false); }
  }
  setSearch(q: string) { this._search.set(q); this.load(); }
  async remove(id: number) {
    await firstValueFrom(this.api.remove(id));
    this._users.update((l) => l.filter((u) => u.id !== id));
  }
}
