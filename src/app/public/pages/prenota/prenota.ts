import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NormalizedHttpError } from '../../../core/http';
import {
  DatiDonatore,
  PrenotazioneRequest,
  REGOLE_BUSINESS,
  Slot,
  TIPO_DONAZIONE_DEFAULT,
} from '../../../shared/models';
import { Loading, ErrorState, EmptyState, ConfirmDialog } from '../../../shared/ui';
import { RequestState, requestError, requestSuccess } from '../../../shared/state';
import { aggiungiGiorni, meseCorrente, oggiIso } from '../../../shared/date';
import { TrasfusionaliService } from '../../../shared/data/trasfusionali.service';
import { PrenotazioniService } from '../../data/prenotazioni.service';
import { AvvisoUscita } from '../../guards/conferma-uscita.guard';
import { CenterSelector } from '../../components/center-selector/center-selector';
import { DatePicker } from '../../components/date-picker/date-picker';
import { SlotPicker } from '../../components/slot-picker/slot-picker';
import { DonorForm, ErroriServer } from '../../components/donor-form/donor-form';
import { BookingSummary } from '../../components/booking-summary/booking-summary';
import { BookingConfirmation } from '../../components/booking-confirmation/booking-confirmation';
import { PrenotazioneConfermaResponse } from '../../../shared/models';

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
  selector: 'app-prenota',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Loading,
    ErrorState,
    EmptyState,
    CenterSelector,
    DatePicker,
    SlotPicker,
    DonorForm,
    BookingSummary,
    BookingConfirmation,
    ConfirmDialog,
  ],
  templateUrl: './prenota.html',
  styleUrl: './prenota.css',
})
export class Prenota implements AvvisoUscita {
  private readonly trasfusionali = inject(TrasfusionaliService);
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  protected readonly minIso = oggiIso();
  protected readonly maxIso = aggiungiGiorni(
    oggiIso(),
    REGOLE_BUSINESS.orizzontePrenotazioneGiorni,
  );

  protected readonly idTrasfusionale = signal<number | null>(null);
  protected readonly mese = signal<string>(meseCorrente());
  private readonly giorniState = signal<RequestState<ReadonlySet<string>>>({ status: 'idle' });
  protected readonly dataIso = signal<string | null>(null);
  private readonly slotState = signal<RequestState<readonly Slot[]>>({ status: 'idle' });
  protected readonly idSlot = signal<number | null>(null);

  protected readonly invioInCorso = signal(false);
  protected readonly rateLimited = signal(false);
  protected readonly erroriCampo = signal<ErroriServer | null>(null);
  protected readonly erroreGenerale = signal<string | null>(null);
  protected readonly conferma = signal<PrenotazioneConfermaResponse | null>(null);

  protected readonly centriStatus = computed(() => {
    const s = this.trasfusionali.elencoStato().status;
    return s === 'idle' ? 'loading' : s;
  });
  protected readonly centri = this.trasfusionali.centri;
  protected readonly centriError = this.trasfusionali.erroreElenco;
  protected readonly centroSelezionato = computed(
    () => this.centri().find((c) => c.id === this.idTrasfusionale()) ?? null,
  );

  protected readonly giorniStatus = computed(() => this.giorniState().status);
  protected readonly giorniError = computed(() => {
    const s = this.giorniState();
    return s.status === 'error' ? s.error : null;
  });
  protected readonly giorniNonDisponibili = computed<ReadonlySet<string>>(() => {
    const s = this.giorniState();
    return s.status === 'success' ? s.data : new Set<string>();
  });

  protected readonly slotStatus = computed(() => this.slotState().status);
  protected readonly slotError = computed(() => {
    const s = this.slotState();
    return s.status === 'error' ? s.error : null;
  });
  protected readonly slots = computed<readonly Slot[]>(() => {
    const s = this.slotState();
    return s.status === 'success' ? s.data : [];
  });
  protected readonly slotSelezionato = computed(
    () => this.slots().find((s) => s.idSlot === this.idSlot()) ?? null,
  );

  protected readonly mostraForm = computed(
    () => this.dataIso() !== null && this.slotState().status === 'success',
  );

  private readonly haDatiInLavorazione = computed(
    () =>
      this.conferma() === null &&
      (this.idTrasfusionale() !== null || this.dataIso() !== null || this.idSlot() !== null),
  );

  protected readonly confermaUscita = signal(false);
  private risolviUscita: ((esci: boolean) => void) | null = null;

  private giorniToken = 0;
  private slotToken = 0;
  private preselezionaOggi = false;

  constructor() {
    effect(() => {
      if (this.conferma()) {
        queueMicrotask(() =>
          this.host.nativeElement.querySelector<HTMLElement>('.booking-confirmation')?.focus(),
        );
      }
    });
  }

  protected ricaricaCentri(): void {
    this.trasfusionali.caricaElenco(true);
  }

  private caricaGiorni(): void {
    const id = this.idTrasfusionale();
    if (id == null) return;
    const mese = this.mese();
    const token = ++this.giorniToken;
    this.giorniState.set({ status: 'loading' });
    this.trasfusionali
      .giorniNonDisponibili(id, mese)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (giorni) => {
          if (token === this.giorniToken) {
            const set = new Set(giorni);
            this.giorniState.set(requestSuccess(set));
            this.forsePreselezionaOggi(set);
          }
        },
        error: (e: NormalizedHttpError) => {
          if (token === this.giorniToken) this.giorniState.set(requestError(e));
        },
      });
  }

  private caricaSlot(): void {
    const id = this.idTrasfusionale();
    const data = this.dataIso();
    if (id == null || data == null) return;
    const token = ++this.slotToken;
    this.slotState.set({ status: 'loading' });
    this.trasfusionali
      .slot(id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (slots) => {
          if (token === this.slotToken) this.slotState.set(requestSuccess(slots));
        },
        error: (e: NormalizedHttpError) => {
          if (token !== this.slotToken) return;
          if (e.status === 409 && e.errore === 'Giorno non disponibile') {
            this.erroreGenerale.set(e.message);
            this.dataIso.set(null);
            this.idSlot.set(null);
            this.slotState.set({ status: 'idle' });
            this.caricaGiorni();
          } else {
            this.slotState.set(requestError(e));
          }
        },
      });
  }

  protected ricaricaSlot(): void {
    this.caricaSlot();
  }

  protected ricaricaGiorni(): void {
    this.caricaGiorni();
  }

  protected onCentroSelect(id: number): void {
    if (id === this.idTrasfusionale()) return;
    this.idTrasfusionale.set(id);
    this.dataIso.set(null);
    this.idSlot.set(null);
    this.slotState.set({ status: 'idle' });
    this.mese.set(meseCorrente());
    this.azzeraErroriInvio();
    this.preselezionaOggi = true;
    this.caricaGiorni();
  }

  protected onCambiaMese(mese: string): void {
    this.mese.set(mese);
    this.preselezionaOggi = false;
    this.caricaGiorni();
  }

  private forsePreselezionaOggi(giorniNonDisponibili: ReadonlySet<string>): void {
    if (!this.preselezionaOggi) return;
    this.preselezionaOggi = false;
    if (this.dataIso() !== null || this.mese() !== meseCorrente()) return;
    const oggi = oggiIso();
    if (oggi < this.minIso || oggi > this.maxIso || giorniNonDisponibili.has(oggi)) return;
    this.dataIso.set(oggi);
    this.caricaSlot();
  }

  protected onSelezionaData(iso: string): void {
    if (iso === this.dataIso()) return;
    this.dataIso.set(iso);
    this.idSlot.set(null);
    this.azzeraErroriInvio();
    this.caricaSlot();
  }

  protected onSelezionaSlot(id: number): void {
    this.idSlot.set(id);
    this.erroreGenerale.set(null);
  }

  protected onInvia(dati: DatiDonatore): void {
    const idSlot = this.idSlot();
    if (idSlot == null || this.invioInCorso()) return;

    this.invioInCorso.set(true);
    this.azzeraErroriInvio();

    const body: PrenotazioneRequest = {
      ...dati,
      idSlot,
      tipoDonazione: TIPO_DONAZIONE_DEFAULT,
    };

    this.prenotazioni
      .crea(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (conf) => {
          this.invioInCorso.set(false);
          this.conferma.set(conf);
        },
        error: (e: NormalizedHttpError) => {
          this.invioInCorso.set(false);
          this.gestisciErroreInvio(e);
        },
      });
  }

  private gestisciErroreInvio(e: NormalizedHttpError): void {
    if (e.status === 429) {
      this.rateLimited.set(true);
      this.erroreGenerale.set(e.message);
      return;
    }

    if (e.kind === 'validazione' && e.erroriValidazione?.length) {
      const perCampo: Record<string, string> = {};
      const altri: string[] = [];
      for (const ev of e.erroriValidazione) {
        if (CAMPI_FORM.has(ev.campo)) perCampo[ev.campo] = ev.messaggio;
        else altri.push(ev.messaggio);
      }
      if (Object.keys(perCampo).length) this.erroriCampo.set(perCampo);
      this.erroreGenerale.set(altri.length ? altri.join(' ') : e.message);
      return;
    }

    if (e.status === 409 || e.status === 404) {
      switch (e.errore) {
        case 'Slot esaurito':
        case 'Risorsa non trovata':
          this.idSlot.set(null);
          this.erroreGenerale.set(e.message);
          this.caricaSlot();
          return;
        case 'Giorno non disponibile':
          this.erroreGenerale.set(e.message);
          this.dataIso.set(null);
          this.idSlot.set(null);
          this.slotState.set({ status: 'idle' });
          this.caricaGiorni();
          return;
        case 'Email non coerente':
          this.erroriCampo.set({ email: e.message });
          return;
        default:
          this.erroreGenerale.set(e.message);
          return;
      }
    }

    this.erroreGenerale.set(e.message);
  }

  confermaPrimaDiUscire(): boolean | Promise<boolean> {
    if (!this.haDatiInLavorazione()) {
      return true;
    }
    this.confermaUscita.set(true);
    return new Promise<boolean>((resolve) => {
      this.risolviUscita = resolve;
    });
  }

  protected annullaUscita(): void {
    this.confermaUscita.set(false);
    this.risolviUscita?.(false);
    this.risolviUscita = null;
  }

  protected confermaUscitaHome(): void {
    this.confermaUscita.set(false);
    this.risolviUscita?.(true);
    this.risolviUscita = null;
  }

  protected ricomincia(): void {
    this.conferma.set(null);
    this.idTrasfusionale.set(null);
    this.dataIso.set(null);
    this.idSlot.set(null);
    this.mese.set(meseCorrente());
    this.giorniState.set({ status: 'idle' });
    this.slotState.set({ status: 'idle' });
    this.azzeraErroriInvio();
  }

  private azzeraErroriInvio(): void {
    this.erroriCampo.set(null);
    this.erroreGenerale.set(null);
    this.rateLimited.set(false);
  }
}
