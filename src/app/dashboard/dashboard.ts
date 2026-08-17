import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Navbar } from '../layout/navbar/navbar';
import { Sidebar } from '../layout/sidebar/sidebar';
import { Main } from '../layout/main/main';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, Sidebar, Main, MatSidenavModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly opened = signal(true);
  toggle() { this.opened.update((v) => !v); }

  logout() {
  }
}
