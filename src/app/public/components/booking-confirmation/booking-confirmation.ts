import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button, Icon } from '../../../shared/ui';
import { PrenotazioneConfermaResponse } from '../../../shared/models';
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
}
