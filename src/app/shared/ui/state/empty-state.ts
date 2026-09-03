import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly message = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly actionLink = input<string | null>(null);
}
