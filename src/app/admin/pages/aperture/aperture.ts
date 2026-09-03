import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NormalizedHttpError } from '../../../core/http';
import { VariazioneApertura } from '../../../shared/models';
import { Loading, ErrorState, EmptyState } from '../../../shared/ui';
import { RequestState, requestError, requestSuccess } from '../../../shared/state';
import { Button, ConfirmDialog } from '../../../shared/ui';
import { ConLavoroInCorso } from '../../guards/lavoro-in-corso.guard';
import {
  aggiungiGiorni,
  formattaDataCompatta,
  formattaDataEstesa,
  meseCorrente,
  meseDi,
  oggiIso,
} from '../../../shared/date';
import { TrasfusionaliService } from '../../../shared/data/trasfusionali.service';
import { VariazioniAperturaService } from '../../data/variazioni-apertura.service';
import { PrenotazioniAdminService } from '../../data/prenotazioni-admin.service';
import { CenterSelector } from '../../../public/components/center-selector/center-selector';
import { DatePicker } from '../../../public/components/date-picker/date-picker';

type Azione =
  | { readonly kind: 'chiudi' }
  | { readonly kind: 'apri' }
  | { readonly kind: 'rimuovi'; readonly variazione: VariazioneApertura };

@Component({
  selector: 'app-admin-aperture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CenterSelector,
    DatePicker,
    ConfirmDialog,
    Loading,
    ErrorState,
    EmptyState,
    Button,
    RouterLink,
  ],
  templateUrl: './aperture.html',
  styleUrl: './aperture.css',
})
export class Aperture implements ConLavoroInCorso {
  private readonly trasfusionali = inject(TrasfusionaliService);
  private readonly service = inject(VariazioniAperturaService);
  private readonly prenotazioniAdmin = inject(PrenotazioniAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  protected readonly minIso = oggiIso();
  protected readonly maxIso = aggiungiGiorni(oggiIso(), 400);

  protected readonly idTrasfusionale = signal<number | null>(null);
  protected readonly mese = signal<string>(meseCorrente());
  protected readonly dataIso = signal<string | null>(oggiIso());
  protected readonly motivo = signal<string>('');

  private readonly giorniState = signal<RequestState<ReadonlySet<string>>>({ status: 'idle' });
  private readonly variazioniState = signal<RequestState<readonly VariazioneApertura[]>>({
    status: 'idle',
  });

  protected readonly azione = signal<Azione | null>(null);
  protected readonly azioneInCorso = signal(false);
  protected readonly azioneErrore = signal<string | null>(null);
  protected readonly avviso = signal<string | null>(null);

  protected readonly conteggioPrenotazioni = signal<number | null>(null);
  private conteggioToken = 0;

  protected readonly chiediUscita = signal<{ readonly risolvi: (ok: boolean) => void } | null>(
    null,
  );

  protected readonly estesa = formattaDataEstesa;
  protected readonly compatta = formattaDataCompatta;

  protected readonly centriStatus = computed(() => {
    const s = this.trasfusionali.elencoStato().status;
    return s === 'idle' ? 'loading' : s;
  });
  protected readonly centri = this.trasfusionali.centri;
  protected readonly centriError = this.trasfusionali.erroreElenco;

  protected readonly datiStatus = computed(() => {
    const g = this.giorniState();
    const v = this.variazioniState();
    if (g.status === 'error' || v.status === 'error') return 'error' as const;
    if (g.status === 'loading' || v.status === 'loading') return 'loading' as const;
    if (g.status === 'success' && v.status === 'success') return 'success' as const;
    return 'idle' as const;
  });
  protected readonly datiErrore = computed(() => {
    const g = this.giorniState();
    const v = this.variazioniState();
    if (g.status === 'error') return g.error;
    if (v.status === 'error') return v.error;
    return null;
  });

  protected readonly giorniNonDisponibili = computed<ReadonlySet<string>>(() => {
    const s = this.giorniState();
    return s.status === 'success' ? s.data : new Set<string>();
  });
  protected readonly variazioni = computed<readonly VariazioneApertura[]>(() => {
    const s = this.variazioniState();
    return s.status === 'success' ? s.data : [];
  });

  protected readonly eccezioneSelezionata = computed<VariazioneApertura | null>(() => {
    const d = this.dataIso();
    return d ? (this.variazioni().find((v) => v.dataVariazione === d) ?? null) : null;
  });
  protected readonly chiusoSelezionato = computed(() => {
    const d = this.dataIso();
    return d !== null && this.giorniNonDisponibili().has(d);
  });

  protected readonly statoGiorno = computed(() => {
    if (this.dataIso() === null) return null;
    const ecc = this.eccezioneSelezionata();
    if (ecc) {
      return ecc.apertura
        ? {
            testo: 'Aperto — apertura straordinaria',
            azione: 'rimuovi' as const,
            distruttiva: true,
          }
        : {
            testo: 'Chiuso — chiusura straordinaria',
            azione: 'rimuovi' as const,
            distruttiva: true,
          };
    }
    if (this.chiusoSelezionato()) {
      return { testo: 'Chiuso — festivo ricorrente', azione: 'apri' as const, distruttiva: false };
    }
    return { testo: 'Aperto — orario ordinario', azione: 'chiudi' as const, distruttiva: false };
  });

  private readonly notaPrenotazioni = computed<string | null>(() => {
    const n = this.conteggioPrenotazioni();
    if (n === null || n === 0) return null;
    return n === 1
      ? '⚠️ C’è 1 prenotazione in questo giorno: va riprogrammata o cancellata a mano.'
      : `⚠️ Ci sono ${n} prenotazioni in questo giorno: vanno riprogrammate o cancellate a mano.`;
  });

  protected readonly dialogConferma = computed(() => {
    const a = this.azione();
    const d = this.dataIso();
    if (a == null) return null;
    const nota = this.notaPrenotazioni();
    if (a.kind === 'rimuovi') {
      return {
        titolo: 'Rimuovere l’eccezione?',
        messaggio: `L’eccezione del ${this.compatta(a.variazione.dataVariazione)} verrà rimossa: il giorno tornerà al calendario ordinario.`,
        dettaglio: nota,
        etichetta: 'Rimuovi',
        distruttiva: true,
      };
    }
    const quando = d ? this.estesa(d) : '';
    return a.kind === 'apri'
      ? {
          titolo: 'Apertura straordinaria',
          messaggio: `Il ${quando} il centro risulterà aperto in via straordinaria.`,
          dettaglio: null,
          etichetta: 'Apri il giorno',
          distruttiva: false,
        }
      : {
          titolo: 'Chiusura straordinaria',
          messaggio: `Il ${quando} il centro risulterà chiuso.`,
          dettaglio:
            nota ??
            'Le prenotazioni già presenti quel giorno non vengono toccate: vanno gestite a mano.',
          etichetta: 'Chiudi il giorno',
          distruttiva: false,
        };
  });

  private variazioniToken = 0;
  private giorniToken = 0;

  constructor() {
    effect(() => {
      const lista = this.centri();
      if (untracked(this.idTrasfusionale) === null && lista.length > 0) {
        untracked(() => this.onCentroSelect(lista[0].id));
      }
    });
  }

  protected ricaricaCentri(): void {
    this.trasfusionali.caricaElenco(true);
  }

  private caricaGiorni(): void {
    const id = this.idTrasfusionale();
    if (id == null) return;
    const token = ++this.giorniToken;
    this.giorniState.set({ status: 'loading' });
    this.trasfusionali
      .giorniNonDisponibili(id, this.mese())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (g) => {
          if (token === this.giorniToken) this.giorniState.set(requestSuccess(new Set(g)));
        },
        error: (e: NormalizedHttpError) => {
          if (token === this.giorniToken) this.giorniState.set(requestError(e));
        },
      });
  }

  private caricaVariazioni(): void {
    const id = this.idTrasfusionale();
    if (id == null) return;
    const token = ++this.variazioniToken;
    this.variazioniState.set({ status: 'loading' });
    this.service
      .elenco(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (v) => {
          if (token === this.variazioniToken) this.variazioniState.set(requestSuccess(v));
        },
        error: (e: NormalizedHttpError) => {
          if (token === this.variazioniToken) this.variazioniState.set(requestError(e));
        },
      });
  }

  protected ricaricaDati(): void {
    this.caricaGiorni();
    this.caricaVariazioni();
  }

  protected onCentroSelect(id: number): void {
    if (id === this.idTrasfusionale()) return;
    this.idTrasfusionale.set(id);
    this.dataIso.set(oggiIso());
    this.motivo.set('');
    this.avviso.set(null);
    this.mese.set(meseCorrente());
    this.caricaGiorni();
    this.caricaVariazioni();
  }

  protected onCambiaMese(mese: string): void {
    this.mese.set(mese);
    this.caricaGiorni();
  }

  protected onSelezionaData(iso: string): void {
    this.dataIso.set(iso);
    this.avviso.set(null);
  }

  protected onMotivo(event: Event): void {
    this.motivo.set((event.target as HTMLInputElement).value);
  }

  protected chiedi(kind: 'chiudi' | 'apri'): void {
    this.azioneErrore.set(null);
    this.conteggioPrenotazioni.set(null);
    this.azione.set({ kind });
    const d = this.dataIso();
    if (kind === 'chiudi' && d) this.caricaConteggio(d);
  }

  protected chiediRimuovi(variazione: VariazioneApertura): void {
    this.azioneErrore.set(null);
    this.conteggioPrenotazioni.set(null);
    this.azione.set({ kind: 'rimuovi', variazione });
    if (variazione.apertura) this.caricaConteggio(variazione.dataVariazione);
  }

  private caricaConteggio(data: string): void {
    const id = this.idTrasfusionale();
    if (id == null) return;
    const token = ++this.conteggioToken;
    this.prenotazioniAdmin
      .elenco(id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (righe) => {
          if (token === this.conteggioToken) this.conteggioPrenotazioni.set(righe.length);
        },
        error: () => {
          if (token === this.conteggioToken) this.conteggioPrenotazioni.set(null);
        },
      });
  }

  protected annullaAzione(): void {
    if (this.azioneInCorso()) return;
    this.azione.set(null);
    this.conteggioPrenotazioni.set(null);
  }

  protected conferma(): void {
    const azione = this.azione();
    const id = this.idTrasfusionale();
    if (azione == null || id == null || this.azioneInCorso()) return;

    this.azioneInCorso.set(true);
    this.azioneErrore.set(null);

    if (azione.kind === 'rimuovi') {
      this.service
        .elimina(azione.variazione.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.esitoPositivo('Eccezione rimossa.'),
          error: (e: NormalizedHttpError) => this.esitoNegativo(e, 'rimossa'),
        });
      return;
    }

    const data = this.dataIso();
    if (data == null) {
      this.azioneInCorso.set(false);
      return;
    }
    const apertura = azione.kind === 'apri';
    const motivo = this.motivo().trim();
    this.service
      .crea({
        idTrasfusionali: [id],
        dataVariazione: data,
        apertura,
        motivo: motivo || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.esitoPositivo(
            apertura ? 'Apertura straordinaria impostata.' : 'Chiusura straordinaria impostata.',
          ),
        error: (e: NormalizedHttpError) => this.esitoNegativo(e, 'impostata'),
      });
  }

  private esitoPositivo(messaggio: string): void {
    this.azioneInCorso.set(false);
    this.azione.set(null);
    this.conteggioPrenotazioni.set(null);
    this.motivo.set('');
    this.annuncia(messaggio);
    this.ricaricaDati();
  }

  private esitoNegativo(e: NormalizedHttpError, participio: string): void {
    this.azioneInCorso.set(false);
    if (e.status === 404) {
      this.azione.set(null);
      this.conteggioPrenotazioni.set(null);
      this.annuncia(`L'eccezione risultava già ${participio}. Elenco aggiornato.`);
      this.ricaricaDati();
      return;
    }
    this.azioneErrore.set(e.message);
  }

  private annuncia(messaggio: string): void {
    this.avviso.set(messaggio);
    queueMicrotask(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>('.aperture__avviso');
      el?.scrollIntoView({ block: 'nearest' });
      el?.focus();
    });
  }

  confermaUscita(): boolean | Promise<boolean> {
    if (this.motivo().trim() === '') return true;
    return new Promise<boolean>((risolvi) => this.chiediUscita.set({ risolvi }));
  }

  protected risolviUscita(ok: boolean): void {
    this.chiediUscita()?.risolvi(ok);
    this.chiediUscita.set(null);
  }
}
