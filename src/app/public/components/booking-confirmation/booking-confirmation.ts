import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button, Icon } from '../../../shared/ui';
import { PrenotazioneConfermaResponse } from '../../../shared/models';
import { formattaTelefono } from '../../../shared/format/telefono';
import { formattaDataEstesa, formattaOrario } from '../../../shared/date';

@Component({
  selector: 'app-booking-confirmation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.css',
})
export class BookingConfirmation {
  readonly conferma = input.required<PrenotazioneConfermaResponse>();
  readonly nuovaPrenotazione = output<void>();

  protected readonly data = computed(() => formattaDataEstesa(this.conferma().dataPrenotazione));
  protected readonly orario = computed(() => formattaOrario(this.conferma().orarioPrenotazione));

  protected readonly indirizzo = computed(() => {
    const c = this.conferma();
    return c.civicoTrasfusionale != null
      ? `${c.indirizzoTrasfusionale}, ${c.civicoTrasfusionale}`
      : c.indirizzoTrasfusionale;
  });
  protected readonly telefono = computed(() => {
    const t = this.conferma().telefonoTrasfusionale;
    return t ? formattaTelefono(t) : null;
  });
}
