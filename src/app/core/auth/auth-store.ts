import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Role, User } from '../../models/user';

const LS_REFRESH = 'refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private _access = signal<string | null>(null);
  private _roles = signal<Role[]>([]);
  private _user = signal<User | null>(null);
  private _refresh = signal<string | null>(
    this.isBrowser ? localStorage.getItem(LS_REFRESH) : null,
  );

  readonly user = this._user.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly isLoggedIn = computed(() => this._access() !== null);

  accessToken() { return this._access(); }
  refreshToken() { return this._refresh(); }
  hasRole(...allowed: Role[]) { return this._roles().some((r) => allowed.includes(r)); }

  setSession(accessToken: string, refreshToken: string, roles: Role[], user: User) {
    this._access.set(accessToken);
    this._refresh.set(refreshToken);
    this._roles.set(roles);
    this._user.set(user);
    if (this.isBrowser) localStorage.setItem(LS_REFRESH, refreshToken);
  }

  setAccessToken(token: string) {
    this._access.set(token);
  }

  clear() {
    this._access.set(null);
    this._refresh.set(null);
    this._roles.set([]);
    this._user.set(null);
    if (this.isBrowser) localStorage.removeItem(LS_REFRESH);
  }
}
