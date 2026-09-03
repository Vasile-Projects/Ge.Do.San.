import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { Slot } from '../../../shared/models';
import { formattaOrario } from '../../../shared/date';
import { indiceDaTasto } from '../../../shared/a11y';

@Component({
  selector: 'app-slot-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slot-picker.html',
  styleUrl: './slot-picker.css',
})
export class SlotPicker {
  readonly slots = input.required<readonly Slot[]>();
  readonly selezionatoId = input<number | null>(null);
  readonly seleziona = output<number>();

  private readonly celle = viewChildren<ElementRef<HTMLButtonElement>>('cella');

  protected readonly ora = formattaOrario;

  private readonly indiciSelezionabili = computed(() =>
    this.slots()
      .map((s, i) => (s.disponibile ? i : -1))
      .filter((i) => i >= 0),
  );

  protected readonly indiceAttivo = computed(() => {
    const selezionabili = this.indiciSelezionabili();
    if (selezionabili.length === 0) {
      return -1;
    }
    const sel = this.slots().findIndex((s) => s.idSlot === this.selezionatoId());
    return sel >= 0 && this.slots()[sel].disponibile ? sel : selezionabili[0];
  });

  protected onKeydown(event: KeyboardEvent, indice: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const slot = this.slots()[indice];
      if (slot.disponibile) {
        this.seleziona.emit(slot.idSlot);
      }
      return;
    }

    const selezionabili = this.indiciSelezionabili();
    const posizione = selezionabili.indexOf(indice);
    if (posizione < 0) {
      return;
    }
    const nuovaPos = indiceDaTasto(posizione, selezionabili.length, event.key);
    if (nuovaPos === null) {
      return;
    }
    event.preventDefault();
    const nuovoIndice = selezionabili[nuovaPos];
    this.seleziona.emit(this.slots()[nuovoIndice].idSlot);
    this.celle()[nuovoIndice]?.nativeElement.focus();
  }
}
