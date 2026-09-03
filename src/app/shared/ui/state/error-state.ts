import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { Button } from '../button/button';

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Button],
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
  host: { role: 'alert' },
})
export class ErrorState {
  readonly message = input('Si è verificato un errore. Riprova.');
  readonly retryable = input(true);
  readonly retry = output<void>();
}
