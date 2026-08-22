import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsersFacade } from './users-facade';
import { AuthStore } from '../../core/auth/auth-store';
import { EmptyState } from '../../shared/ui/empty-state';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-list',
  imports: [
    ScrollingModule, RouterLink, MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatChipsModule, MatProgressBarModule, MatTooltipModule, EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="list-header">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search">
        <mat-label>Search users</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [value]="facade.search()"
               (input)="facade.setSearch($any($event.target).value)"
               placeholder="Name or email…" />
      </mat-form-field>
      <span class="spacer"></span>
      <span class="total">{{ facade.total() }} total</span>
      @if (auth.hasRole('admin')) {
        <a mat-flat-button color="primary" routerLink="/users/new">
          <mat-icon>add</mat-icon> New user
        </a>
      }
    </header>

    @if (facade.loading()) { <mat-progress-bar mode="indeterminate" /> }

    @if (facade.error()) {
      <app-empty-state [message]="facade.error()!" />
    } @else if (!facade.loading() && facade.users().length === 0) {
      <app-empty-state message="No users found." />
    } @else {
      <div class="row head">
        <span>Name</span><span>Email</span><span>Status</span><span>Roles</span>
        <span class="actions-col">Actions</span>
      </div>
      <cdk-virtual-scroll-viewport itemSize="56" class="viewport">
        <div *cdkVirtualFor="let u of facade.users(); trackBy: trackById" class="row">
          <span class="name">{{ u.name }}</span>
          <span class="muted">{{ u.email }}</span>
          <span>
            <mat-chip [highlighted]="u.active" [color]="u.active ? 'primary' : undefined">
              {{ u.active ? 'Active' : 'Inactive' }}
            </mat-chip>
          </span>
          <span class="muted">{{ u.roles.join(', ') }}</span>
          <span class="actions-col">
            <a mat-icon-button [routerLink]="['/users', u.id, 'edit']" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </a>
            @if (auth.hasRole('admin')) {
              <button mat-icon-button color="warn" matTooltip="Delete" (click)="confirmDelete(u)">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </span>
        </div>
      </cdk-virtual-scroll-viewport>
    }
  `,
  styles: [`
    .list-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: .5rem; }
    .search { width: min(360px, 100%); }
    .spacer { flex: 1 1 auto; }
    .total { color: var(--mat-sys-on-surface-variant); }
    .viewport { height: 65vh; border: 1px solid var(--mat-sys-outline-variant); border-radius: .5rem; }
    .row { display: grid; grid-template-columns: 1.5fr 2fr 1fr 1.5fr 110px; align-items: center;
           gap: 1rem; padding: 0 1rem; height: 56px; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .row.head { height: 44px; font-weight: 600; color: var(--mat-sys-on-surface-variant); }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .actions-col { display: flex; justify-content: flex-end; gap: .25rem; }
  `],
})
export class UserList {
  facade = inject(UsersFacade);
  auth = inject(AuthStore);
  constructor() { this.facade.load(); }
  trackById = (_: number, u: User) => u.id;
  confirmDelete(u: User) {
    if (confirm(`Delete ${u.name}?`)) this.facade.remove(u.id);
  }
}
