import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './shared/ui/toast';
import { ToastHost } from './shared/ui/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ecommerce');
}
