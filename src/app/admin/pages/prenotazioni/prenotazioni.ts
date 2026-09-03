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
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NormalizedHttpError } from '../../../core/http';
import { PrenotazioneAdminResponse } from '../../../shared/models';
import { RequestState, requestError, requestSuccess } from '../../../shared/state';
import { Button, ConfirmDialog, EmptyState, ErrorState, Loading } from '../../../shared/ui';
import { ConLavoroInCorso } from '../../guards/lavoro-in-corso.guard';
import {
  aggiungiGiorni,
  formattaDataEstesa,
  meseCorrente,
  meseDi,
  oggiIso,
} from '../../../shared/date';
import { TrasfusionaliService } from '../../../shared/data/trasfusionali.service';
import { PrenotazioniAdminService } from '../../data/prenotazioni-admin.service';
import { CenterSelector } from '../../../public/components/center-selector/center-selector';
import { DatePicker } from '../../../public/components/date-picker/date-picker';
import { PrenotazioniTable } from '../../components/prenotazioni-table/prenotazioni-table';
import { PrenotazioneDettaglio } from '../../components/prenotazione-dettaglio/prenotazione-dettaglio';
import { RiprogrammaPrenotazione } from '../../components/riprogramma-prenotazione/riprogramma-prenotazione';
import { NuovaPrenotazione } from '../../components/nuova-prenotazione/nuova-prenotazione';
import { Log } from '../log/log';

type Pannello =
  | { readonly tipo: 'nessuno' }
  | { readonly tipo: 'dettaglio' }
  | { readonly tipo: 'riprogramma'; readonly pren: PrenotazioneAdminResponse }
  | { readonly tipo: 'nuova' };

@Component({
  selector: 'app-admin-prenotazioni',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CenterSelector,
    DatePicker,
    PrenotazioniTable,
    PrenotazioneDettaglio,
    RiprogrammaPrenotazione,
    NuovaPrenotazione,
    Log,
    ConfirmDialog,
    Loading,
    ErrorState,
    EmptyState,
    Button,
  ],
  templateUrl: './prenotazioni.html',
  styleUrl: './prenotazioni.css',
  host: {
    '(document:keydown.escape)': 'onEscOverlay()',
  },
})
export class Prenotazioni implements ConLavoroInCorso {
  private readonly trasfusionali = inject(TrasfusionaliService);
  private readonly service = inject(PrenotazioniAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly route = inject(ActivatedRoute);

  protected readonly minIso = aggiungiGiorni(oggiIso(), -400);
  protected readonly maxIso = aggiungiGiorni(oggiIso(), 90);

  protected readonly idTrasfusionale = signal<number | null>(null);
  protected readonly mese = signal<string>(meseCorrente());
  protected readonly dataIso = signal<string>(oggiIso());

  private readonly elencoState = signal<RequestState<readonly PrenotazioneAdminResponse[]>>({
    status: 'idle',
  });

  private readonly giorniState = signal<RequestState<ReadonlySet<string>>>({ status: 'idle' });
  protected readonly giorniNonDisponibili = computed<ReadonlySet<string>>(() => {
    const s = this.giorniState();
    return s.status === 'success' ? s.data : new Set<string>();
  });

  protected readonly pannello = signal<Pannello>({ tipo: 'nessuno' });
  private readonly dettaglioState = signal<RequestState<PrenotazioneAdminResponse>>({
    status: 'idle',
  });

  protected readonly chiediUscita = signal<{ readonly risolvi: (ok: boolean) => void } | null>(
    null,
  );

  protected readonly daCancellare = signal<PrenotazioneAdminResponse | null>(null);
  protected readonly cancellaInCorso = signal(false);
  protected readonly cancellaErrore = signal<string | null>(null);

  protected readonly esportaAperto = signal(false);
  protected readonly esportaInCorso = signal(false);
  protected readonly esportaErrore = signal<string | null>(null);

  protected readonly avviso = signal<string | null>(null);

  private readonly log = viewChild(Log);

  protected readonly estesa = formattaDataEstesa;

  protected readonly centriStatus = computed(() => {
    const s = this.trasfusionali.elencoStato().status;
    return s === 'idle' ? 'loading' : s;
  });
  protected readonly centri = this.trasfusionali.centri;
  protected readonly centriError = this.trasfusionali.erroreElenco;
  protected readonly centroSelezionato = computed(
    () => this.centri().find((c) => c.id === this.idTrasfusionale()) ?? null,
  );

  protected readonly elencoStatus = computed(() => this.elencoState().status);
  protected readonly prenotazioni = computed<readonly PrenotazioneAdminResponse[]>(() => {
    const s = this.elencoState();
    return s.status === 'success' ? s.data : [];
  });
  protected readonly elencoError = computed(() => {
    const s = this.elencoState();
    return s.status === 'error' ? s.error : null;
  });

  protected readonly dettaglioStatus = computed(() => this.dettaglioState().status);
  protected readonly dettaglioData = computed(() => {
    const s = this.dettaglioState();
    return s.status === 'success' ? s.data : null;
  });
  protected readonly dettaglioErrore = computed(() => {
    const s = this.dettaglioState();
    return s.status === 'error' ? s.error : null;
  });

  protected readonly riprogrammaCtx = computed(() => {
    const p = this.pannello();
    const id = this.idTrasfusionale();
    return p.tipo === 'riprogramma' && id !== null ? { pren: p.pren, id } : null;
  });

  protected readonly messaggioEsporta = computed(
    () => `Verrà scaricato l'elenco delle prenotazioni di ${this.estesa(this.dataIso())}.`,
  );

  private elencoToken = 0;
  private giorniToken = 0;
  private dettaglioToken = 0;

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    const centro = Number(qp.get('centro'));
    const data = qp.get('data');
    if (Number.isInteger(centro) && centro > 0) {
      this.idTrasfusionale.set(centro);
      if (data) {
        this.dataIso.set(data);
        this.mese.set(meseDi(data));
      }
      this.caricaGiorni();
      this.caricaElenco();
    }

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
        error: () => {
          if (token === this.giorniToken) this.giorniState.set(requestSuccess(new Set<string>()));
        },
      });
  }

  protected caricaElenco(): void {
    const id = this.idTrasfusionale();
    const data = this.dataIso();
    if (id == null) return;
    const token = ++this.elencoToken;
    this.elencoState.set({ status: 'loading' });
    this.service
      .elenco(id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (righe) => {
          if (token === this.elencoToken) this.elencoState.set(requestSuccess(righe));
        },
        error: (e: NormalizedHttpError) => {
          if (token === this.elencoToken) this.elencoState.set(requestError(e));
        },
      });
  }

  protected onCentroSelect(id: number): void {
    if (id === this.idTrasfusionale()) return;
    this.idTrasfusionale.set(id);
    this.chiudiPannello();
    this.avviso.set(null);
    this.caricaGiorni();
    this.caricaElenco();
  }

  protected onCambiaMese(mese: string): void {
    this.mese.set(mese);
    this.caricaGiorni();
  }

  protected onEscOverlay(): void {
    if (this.pannello().tipo === 'dettaglio' && this.dettaglioStatus() !== 'success') {
      this.chiudiPannello();
    }
  }

  protected onSelezionaData(iso: string): void {
    if (iso === this.dataIso()) return;
    const meseCambiato = meseDi(iso) !== this.mese();
    this.dataIso.set(iso);
    this.mese.set(meseDi(iso));
    this.chiudiPannello();
    this.avviso.set(null);
    if (meseCambiato) this.caricaGiorni();
    this.caricaElenco();
  }

  protected apriDettaglio(p: PrenotazioneAdminResponse): void {
    const token = ++this.dettaglioToken;
    this.pannello.set({ tipo: 'dettaglio' });
    this.dettaglioState.set({ status: 'loading' });
    this.service
      .dettaglio(p.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d) => {
          if (token === this.dettaglioToken) this.dettaglioState.set(requestSuccess(d));
        },
        error: (e: NormalizedHttpError) => {
          if (token === this.dettaglioToken) this.dettaglioState.set(requestError(e));
        },
      });
  }

  protected apriRiprogramma(p: PrenotazioneAdminResponse): void {
    this.pannello.set({ tipo: 'riprogramma', pren: p });
  }

  protected apriNuova(): void {
    this.pannello.set({ tipo: 'nuova' });
  }

  protected chiudiPannello(): void {
    this.pannello.set({ tipo: 'nessuno' });
    this.dettaglioToken++;
    this.dettaglioState.set({ status: 'idle' });
  }

  protected chiudiPannelloRichiesto(): void {
    const esito = this.confermaUscita();
    if (esito === true) {
      this.chiudiPannello();
      return;
    }
    void Promise.resolve(esito).then((ok) => {
      if (ok) this.chiudiPannello();
    });
  }

  private annuncia(messaggio: string): void {
    this.avviso.set(messaggio);
    queueMicrotask(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>('.pren__avviso');
      el?.scrollIntoView({ block: 'nearest' });
      el?.focus();
    });
  }

  protected onRiprogrammata(p: PrenotazioneAdminResponse): void {
    this.chiudiPannello();
    this.annuncia(`Prenotazione #${p.id} riprogrammata.`);
    this.caricaElenco();
    this.log()?.carica();
  }

  protected onCreata(p: PrenotazioneAdminResponse): void {
    this.chiudiPannello();
    this.annuncia(`Prenotazione #${p.id} creata.`);
    this.caricaElenco();
  }

  confermaUscita(): boolean | Promise<boolean> {
    const t = this.pannello().tipo;
    if (t !== 'riprogramma' && t !== 'nuova') return true;
    return new Promise<boolean>((risolvi) => this.chiediUscita.set({ risolvi }));
  }

  protected risolviUscita(ok: boolean): void {
    this.chiediUscita()?.risolvi(ok);
    this.chiediUscita.set(null);
  }

  protected chiediCancella(p: PrenotazioneAdminResponse): void {
    this.cancellaErrore.set(null);
    this.daCancellare.set(p);
  }

  protected annullaCancella(): void {
    if (this.cancellaInCorso()) return;
    this.daCancellare.set(null);
  }

  protected confermaCancella(): void {
    const p = this.daCancellare();
    if (p == null || this.cancellaInCorso()) return;
    this.cancellaInCorso.set(true);
    this.cancellaErrore.set(null);
    this.service
      .cancella(p.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cancellaInCorso.set(false);
          this.daCancellare.set(null);
          this.annuncia(`Prenotazione #${p.id} cancellata.`);
          this.caricaElenco();
        },
        error: (e: NormalizedHttpError) => {
          this.cancellaInCorso.set(false);
          if (e.status === 404) {
            this.daCancellare.set(null);
            this.annuncia('La prenotazione risultava già rimossa. Elenco aggiornato.');
            this.caricaElenco();
            return;
          }
          this.cancellaErrore.set(e.message);
        },
      });
  }

  protected chiediEsporta(): void {
    this.esportaErrore.set(null);
    this.esportaAperto.set(true);
  }

  protected annullaEsporta(): void {
    if (this.esportaInCorso()) return;
    this.esportaAperto.set(false);
  }

  protected confermaEsporta(): void {
    const id = this.idTrasfusionale();
    if (id == null || this.esportaInCorso()) return;
    this.esportaInCorso.set(true);
    this.esportaErrore.set(null);
    const data = this.dataIso();
    this.service
      .esportaPdf(id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.esportaInCorso.set(false);
          this.esportaAperto.set(false);
          this.scarica(blob, `prenotazioni_${id}_${data}.pdf`);
        },
        error: (e: NormalizedHttpError) => {
          this.esportaInCorso.set(false);
          this.esportaErrore.set(e.message);
        },
      });
  }

  private scarica(blob: Blob, nomeFile: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeFile;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
