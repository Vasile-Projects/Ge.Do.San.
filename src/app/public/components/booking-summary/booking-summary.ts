import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Slot, Trasfusionale } from '../../../shared/models';
import { formattaDataEstesa, formattaOrario } from '../../../shared/date';

@Component({
  selector: 'app-booking-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-summary.html',
  styleUrl: './booking-summary.css',
})
export class BookingSummary {
  readonly centro = input<Trasfusionale | null>(null);
  readonly dataIso = input<string | null>(null);
  readonly slot = input<Slot | null>(null);

  protected readonly dataEstesa = computed(() => {
    const d = this.dataIso();
    return d ? formattaDataEstesa(d) : null;
  });

  protected readonly orario = computed(() => {
    const s = this.slot();
    return s ? formattaOrario(s.orario) : null;
  });
}
