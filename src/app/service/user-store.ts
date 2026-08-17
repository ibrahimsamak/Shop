import { Injectable, signal, computed, effect } from '@angular/core';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly _users = signal<User[]>([]);
  private readonly _searchTerm = signal('');
  private readonly _selectedId = signal<number | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly users = this._users.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filteredUsers = computed(() => {
    const term = this._searchTerm().toLowerCase();
    return this._users().filter((u) => u.name.toLowerCase().includes(term));
  });
  readonly activeCount = computed(() => this._users().filter((u) => u.active).length);
  readonly selectedUser = computed(() =>
    this._users().find((u) => u.id === this._selectedId()) ?? null,
  );

  constructor() {
    effect(() => console.log(`Showing ${this.filteredUsers().length} users`));
  }

  setUsers(users: User[]) { this._users.set(users); }
  search(term: string) { this._searchTerm.set(term); }
  select(id: number) { this._selectedId.set(id); }
  toggleActive(id: number) {
    this._users.update((list) =>
      list.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
  }
}
