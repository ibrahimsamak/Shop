import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../models/user';

@Component({
  selector: 'app-user-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="user-card" [class.inactive]="!user().active" appearance="outlined">
      <mat-card-header>
        <div mat-card-avatar class="avatar"><mat-icon>person</mat-icon></div>
        <mat-card-title>{{ user().name }}</mat-card-title>
        <mat-card-subtitle>{{ user().email }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <mat-chip-set aria-label="User status and roles">
          <mat-chip [highlighted]="user().active" [color]="user().active ? 'primary' : undefined">
            {{ statusLabel() }}
          </mat-chip>
          @for (r of user().roles; track r) {
            <mat-chip>{{ r }}</mat-chip>
          }
        </mat-chip-set>
      </mat-card-content>

      <mat-card-actions align="end">
        <button mat-button (click)="select.emit(user().id)">
          <mat-icon>check_circle</mat-icon>
          Select
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './user-card.scss',
})
export class UserCard {
  user = input.required<User>();
  select = output<number>();
  statusLabel = computed(() => (this.user().active ? 'Active' : 'Inactive'));
}
