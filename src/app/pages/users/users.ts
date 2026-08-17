import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UserCard } from '../../user-card/user-card';
import { UserStore } from '../../service/user-store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-users',
  imports: [UserCard, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
  store = inject(UserStore);
  constructor() {
    this.store.setUsers([
      { id: 1, name: 'Ada', email: 'ada@shop.io', active: true, roles: ['admin'] },
      { id: 2, name: 'Bob', email: 'bob@shop.io', active: false, roles: ['viewer'] },
      { id: 3, name: 'Cara', email: 'cara@shop.io', active: true, roles: ['manager'] },
    ]);
  }
}
