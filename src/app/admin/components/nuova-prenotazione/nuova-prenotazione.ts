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
import {
  DatiDonatore,
  PrenotazioneAdminResponse,
  PrenotazioneRequest,
  REGOLE_BUSINESS,
  TIPO_DONAZIONE_DEFAULT,
  Trasfusionale,
} from '../../../shared/models';
import { Button, ConfirmDialog, Icon } from '../../../shared/ui';
import { comportamentoDialog } from '../../../shared/a11y';
import { aggiungiGiorni, meseCorrente, meseDi, oggiIso } from '../../../shared/date';
import { PrenotazioniAdminService } from '../../data/prenotazioni-admin.service';
import { SlotSelezione } from '../../data/slot-selezione';
import { SlotScelta } from '../slot-scelta/slot-scelta';
import { DonorForm, ErroriServer } from '../../../public/components/donor-form/donor-form';

const CAMPI_FORM = new Set([
  'nome',
  'cognome',
  'dataNascita',
  'sesso',
  'codiceFiscale',
  'email',
  'cellulare',
]);

@Component({
  selector: 'app-nuova-prenotazione',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlotScelta, DonorForm, ConfirmDialog, Button, Icon],
  templateUrl: './nuova-prenotazione.html',
  styleUrl: './nuova-prenotazione.css',
})
export class NuovaPrenotazione {
  private readonly service = inject(PrenotazioniAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly centro = input.required<Trasfusionale>();
  readonly dataContesto = input<string | null>(null);

  readonly creata = output<PrenotazioneAdminResponse>();
  readonly annulla = output<void>();

  protected readonly sel = new SlotSelezione();

  protected readonly minIso = oggiIso();
  protected readonly maxIso = aggiungiGiorni(
    oggiIso(),
    REGOLE_BUSINESS.orizzontePrenotazioneGiorni,
  );

  protected readonly confermaAperta = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly erroreDialog = signal<string | null>(null);
  protected readonly erroreGenerale = signal<string | null>(null);
  protected readonly erroriCampo = signal<ErroriServer | null>(null);
  private readonly datiInAttesa = signal<DatiDonatore | null>(null);

  protected readonly slotScelto = computed(() => this.sel.idSlot() !== null);

  constructor() {
    comportamentoDialog(this.host.nativeElement, () => this.annulla.emit(), this.destroyRef);
    effect(() => {
      const id = this.centro().id;
      const data = this.dataContesto();
      const giorno = data && data >= oggiIso() ? data : null;
      untracked(() => {
        this.sel.perCentro(id, giorno ? meseDi(giorno) : meseCorrente());
        if (giorno) this.sel.selezionaData(giorno);
      });
    });
  }

  protected onInviaForm(dati: DatiDonatore): void {
    if (this.sel.idSlot() == null) {
      this.erroreGenerale.set('Seleziona un giorno e un orario prima di confermare.');
      return;
    }
    this.datiInAttesa.set(dati);
    this.erroreDialog.set(null);
    this.confermaAperta.set(true);
  }

  protected chiudiConferma(): void {
    if (this.inCorso()) return;
    this.confermaAperta.set(false);
  }

  protected conferma(): void {
    const dati = this.datiInAttesa();
    const idSlot = this.sel.idSlot();
    if (dati == null || idSlot == null || this.inCorso()) return;

    this.inCorso.set(true);
    this.erroreDialog.set(null);
    this.erroreGenerale.set(null);
    this.erroriCampo.set(null);

    const body: PrenotazioneRequest = { ...dati, idSlot, tipoDonazione: TIPO_DONAZIONE_DEFAULT };

    this.service
      .crea(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (creata) => {
          this.inCorso.set(false);
          this.confermaAperta.set(false);
          this.creata.emit(creata);
        },
        error: (e: NormalizedHttpError) => {
          this.inCorso.set(false);
          this.gestisciErrore(e);
        },
      });
  }

  private gestisciErrore(e: NormalizedHttpError): void {
    if (e.kind === 'validazione' && e.erroriValidazione?.length) {
      const perCampo: Record<string, string> = {};
      const altri: string[] = [];
      for (const ev of e.erroriValidazione) {
        if (CAMPI_FORM.has(ev.campo)) perCampo[ev.campo] = ev.messaggio;
        else altri.push(ev.messaggio);
      }
      this.confermaAperta.set(false);
      if (Object.keys(perCampo).length) this.erroriCampo.set(perCampo);
      this.mostraBanner(altri.length ? altri.join(' ') : e.message);
      return;
    }

    // Le violazioni di regola sulla prenotazione tornano tutte come 409 con titolo
    // unico ("Prenotazione non consentita"): si mostra `messaggio` e si ricarica la
    // disponibilità, senza branching su `errore`.
    if (e.status === 409 || e.status === 404) {
      this.confermaAperta.set(false);
      this.mostraBanner(e.message);
      this.sel.ricaricaGiorni();
      this.sel.ricaricaSlot();
      return;
    }

    this.erroreDialog.set(e.message);
  }

  private mostraBanner(messaggio: string): void {
    this.erroreGenerale.set(messaggio);
    queueMicrotask(() => {
      const b = this.host.nativeElement.querySelector<HTMLElement>('.nuova__banner');
      b?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      b?.focus();
    });
  }
}
