import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading.html',
  styleUrl: './loading.css',
  host: { role: 'status', 'aria-live': 'polite' },
})
export class Loading {
  readonly label = input('Caricamento in corso…');
}
