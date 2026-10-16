import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button, Icon } from '../../../shared/ui';
import { formattaDataEstesa, formattaOrario } from '../../../shared/date';

export interface RiepilogoRichiesta {
  readonly email: string;
  readonly nomeTrasfusionale: string;
  readonly dataIso: string;
  readonly orario: string;
}

/**
 * Esito dell'invio del modulo: la prenotazione non esiste ancora, va confermata dal link ricevuto
 * per email. Il testo è lo stesso in ogni caso (il server non dice se i dati erano già registrati):
 * eventuali problemi legati alla persona arrivano solo nella casella email.
 */
@Component({
  selector: 'app-richiesta-inviata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  templateUrl: './richiesta-inviata.html',
  styleUrl: './richiesta-inviata.css',
})
export class RichiestaInviata {
  readonly riepilogo = input.required<RiepilogoRichiesta>();
  readonly minutiValidita = input.required<number>();
  readonly nuovaPrenotazione = output<void>();

  protected readonly data = computed(() => formattaDataEstesa(this.riepilogo().dataIso));
  protected readonly orario = computed(() => formattaOrario(this.riepilogo().orario));
}
