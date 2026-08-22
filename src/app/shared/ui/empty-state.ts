import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="empty">{{ message() }}</p>`,
  styles: [`.empty { color: #888; text-align: center; padding: 2rem; }`],
})
export class EmptyState {
  message = input('Nothing here yet.');
}
