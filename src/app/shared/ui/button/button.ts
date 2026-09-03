import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-name';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'ghost-info' | 'invert' | 'outline-light';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, NgTemplateOutlet],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly link = input<string | null>(null);
  readonly href = input<string | null>(null);
  readonly disabled = input(false);
  readonly block = input(false);
  readonly icon = input<IconName | null>(null);
  readonly iconPosition = input<'start' | 'end'>('end');
  readonly iconOnly = input(false);
  readonly ariaLabel = input<string | null>(null);
}
