import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { PrenotazioneAdminResponse } from '../../../shared/models';
import { formattaDataEstesa, formattaDataOraCompatta, formattaOrario } from '../../../shared/date';
import { Icon } from '../../../shared/ui';
import { comportamentoDialog } from '../../../shared/a11y';

@Component({
  selector: 'app-prenotazione-dettaglio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './prenotazione-dettaglio.html',
  styleUrl: './prenotazione-dettaglio.css',
})
export class PrenotazioneDettaglio {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly prenotazione = input.required<PrenotazioneAdminResponse>();
  readonly chiudi = output<void>();

  constructor() {
    comportamentoDialog(this.host.nativeElement, () => this.chiudi.emit(), this.destroyRef);
  }

  protected readonly estesa = formattaDataEstesa;
  protected readonly ora = formattaOrario;
  protected readonly dataOra = formattaDataOraCompatta;
}
