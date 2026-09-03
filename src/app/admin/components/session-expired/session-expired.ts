import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  output,
} from '@angular/core';
import { Button, Icon } from '../../../shared/ui';
import { comportamentoDialog } from '../../../shared/a11y';

@Component({
  selector: 'app-session-expired',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  templateUrl: './session-expired.html',
  styleUrl: './session-expired.css',
})
export class SessionExpired {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly vaiAlLogin = output<void>();
  readonly resta = output<void>();

  constructor() {
    comportamentoDialog(this.host.nativeElement, () => this.resta.emit(), this.destroyRef);
  }
}
