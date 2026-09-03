import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PrenotazioneAdminResponse } from '../../../shared/models';
import { formattaDataOraCompatta, formattaOrario } from '../../../shared/date';
import { Button } from '../../../shared/ui';

@Component({
  selector: 'app-prenotazioni-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  templateUrl: './prenotazioni-table.html',
  styleUrl: './prenotazioni-table.css',
})
export class PrenotazioniTable {
  readonly prenotazioni = input.required<readonly PrenotazioneAdminResponse[]>();

  readonly dettaglio = output<PrenotazioneAdminResponse>();
  readonly riprogramma = output<PrenotazioneAdminResponse>();
  readonly cancella = output<PrenotazioneAdminResponse>();

  protected readonly ora = formattaOrario;
  protected readonly dataOra = formattaDataOraCompatta;
}
