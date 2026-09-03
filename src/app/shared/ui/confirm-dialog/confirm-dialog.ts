import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { Button } from '../button/button';
import { comportamentoDialog } from '../../a11y';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly titolo = input.required<string>();
  readonly messaggio = input.required<string>();
  readonly dettaglio = input<string | null>(null);
  readonly etichettaConferma = input('Conferma');
  readonly distruttiva = input(false);
  readonly inCorso = input(false);
  readonly errore = input<string | null>(null);

  readonly conferma = output<void>();
  readonly annulla = output<void>();

  constructor() {
    comportamentoDialog(this.host.nativeElement, () => this.annulla.emit(), this.destroyRef);
  }
}
