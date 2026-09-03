import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Slot } from '../../../shared/models';
import { Loading, ErrorState, EmptyState } from '../../../shared/ui';
import { DatePicker } from '../../../public/components/date-picker/date-picker';
import { SlotPicker } from '../../../public/components/slot-picker/slot-picker';

@Component({
  selector: 'app-slot-scelta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePicker, SlotPicker, Loading, ErrorState, EmptyState],
  templateUrl: './slot-scelta.html',
  styleUrl: './slot-scelta.css',
})
export class SlotScelta {
  readonly mese = input.required<string>();
  readonly dataIso = input<string | null>(null);
  readonly giorniNonDisponibili = input<ReadonlySet<string>>(new Set<string>());
  readonly giorniInCaricamento = input(false);
  readonly giorniErrore = input<string | null>(null);
  readonly minIso = input.required<string>();
  readonly maxIso = input.required<string>();

  readonly slotStatus = input.required<'idle' | 'loading' | 'error' | 'success'>();
  readonly slots = input<readonly Slot[]>([]);
  readonly slotErrore = input<string | null>(null);
  readonly idSlot = input<number | null>(null);

  readonly cambiaMese = output<string>();
  readonly selezionaData = output<string>();
  readonly selezionaSlot = output<number>();
  readonly ricaricaGiorni = output<void>();
  readonly ricaricaSlot = output<void>();
}
