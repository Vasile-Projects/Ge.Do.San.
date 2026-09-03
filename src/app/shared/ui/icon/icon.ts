import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconName } from './icon-name';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.html',
  styleUrl: './icon.css',
  host: {
    '[style.--icon-size.px]': 'size()',
    'aria-hidden': 'true',
  },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
}
