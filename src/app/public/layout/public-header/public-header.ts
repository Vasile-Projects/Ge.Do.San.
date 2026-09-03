import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../shared/ui';

@Component({
  selector: 'app-public-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css',
  host: { '[class.public-header--overlay]': 'overlay()' },
})
export class PublicHeader {
  readonly overlay = input(false);
  readonly azione = input<'prenota' | 'home'>('prenota');
}
