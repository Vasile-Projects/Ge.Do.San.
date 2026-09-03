import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NormalizedHttpError } from '../../../core/http';
import { PrenotazioneAdminResponse, REGOLE_BUSINESS } from '../../../shared/models';
import { Button, ConfirmDialog, Icon } from '../../../shared/ui';
import { comportamentoDialog } from '../../../shared/a11y';
import {
  aggiungiGiorni,
  formattaDataEstesa,
  formattaOrario,
  meseCorrente,
  meseDi,
  oggiIso,
} from '../../../shared/date';
import { TrasfusionaliService } from '../../../shared/data/trasfusionali.service';
import { PrenotazioniAdminService } from '../../data/prenotazioni-admin.service';
import { SlotSelezione } from '../../data/slot-selezione';
import { SlotScelta } from '../slot-scelta/slot-scelta';

@Component({
  selector: 'app-riprogramma-prenotazione',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlotScelta, ConfirmDialog, Button, Icon],
  templateUrl: './riprogramma-prenotazione.html',
  styleUrl: './riprogramma-prenotazione.css',
})
export class RiprogrammaPrenotazione {
  private readonly service = inject(PrenotazioniAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly prenotazione = input.required<PrenotazioneAdminResponse>();
  readonly idTrasfusionale = input.required<number>();

  readonly riprogrammata = output<PrenotazioneAdminResponse>();
  readonly annulla = output<void>();

  protected readonly sel = new SlotSelezione(inject(TrasfusionaliService), this.destroyRef);

  protected readonly minIso = oggiIso();
  protected readonly maxIso = aggiungiGiorni(
    oggiIso(),
    REGOLE_BUSINESS.orizzontePrenotazioneGiorni,
  );

  protected readonly confermaAperta = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly erroreDialog = signal<string | null>(null);
  protected readonly errorePannello = signal<string | null>(null);

  protected readonly estesa = formattaDataEstesa;
  protected readonly ora = formattaOrario;

  protected readonly nuovoSlot = this.sel.slotSelezionato;
  protected readonly puoConfermare = computed(() => this.sel.idSlot() !== null);

  protected readonly messaggioConferma = computed(() => {
    const p = this.prenotazione();
    return `La prenotazione di ${p.nomeDonatore} ${p.cognomeDonatore} verrà spostata.`;
  });
  protected readonly dettaglioConferma = computed(() => {
    const slot = this.nuovoSlot();
    const data = this.sel.dataIso();
    if (!slot || !data) return null;
    return `Nuovo orario: ${this.estesa(data)}, ore ${this.ora(slot.orario)}`;
  });

  constructor() {
    comportamentoDialog(this.host.nativeElement, () => this.annulla.emit(), this.destroyRef);
    effect(() => {
      const id = this.idTrasfusionale();
      const pren = this.prenotazione();
      const giorno = pren.dataPrenotazione >= oggiIso() ? pren.dataPrenotazione : null;
      untracked(() => {
        this.sel.perCentro(id, giorno ? meseDi(giorno) : meseCorrente());
        if (giorno) this.sel.selezionaData(giorno);
      });
    });
  }

  protected apriConferma(): void {
    if (!this.puoConfermare()) return;
    this.erroreDialog.set(null);
    this.confermaAperta.set(true);
  }

  protected chiudiConferma(): void {
    if (this.inCorso()) return;
    this.confermaAperta.set(false);
  }

  protected conferma(): void {
    const idSlot = this.sel.idSlot();
    if (idSlot == null || this.inCorso()) return;
    this.inCorso.set(true);
    this.erroreDialog.set(null);

    this.service
      .riprogramma(this.prenotazione().id, idSlot)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (aggiornata) => {
          this.inCorso.set(false);
          this.confermaAperta.set(false);
          this.riprogrammata.emit(aggiornata);
        },
        error: (e: NormalizedHttpError) => {
          this.inCorso.set(false);
          this.gestisciErrore(e);
        },
      });
  }

  private gestisciErrore(e: NormalizedHttpError): void {
    if (
      e.status === 409 &&
      (e.errore === 'Slot esaurito' || e.errore === 'Giorno non disponibile')
    ) {
      this.confermaAperta.set(false);
      this.errorePannello.set(`${e.message} Scegli un altro orario e conferma di nuovo.`);
      this.sel.ricaricaGiorni();
      this.sel.ricaricaSlot();
      queueMicrotask(() => {
        const b = this.host.nativeElement.querySelector<HTMLElement>('.riprogramma__banner');
        b?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        b?.focus();
      });
      return;
    }
    this.erroreDialog.set(e.message);
  }
}
