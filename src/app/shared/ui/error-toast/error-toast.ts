import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-error-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './error-toast.html',
  styleUrl: './error-toast.css',
})
export class ErrorToast {
  readonly messaggio = input.required<string>();
  readonly chiudi = output<void>();

  constructor() {
    effect((onCleanup) => {
      this.messaggio();
      const timer = setTimeout(() => this.chiudi.emit(), 10_000);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
