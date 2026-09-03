import { DestroyRef, Signal, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NormalizedHttpError } from '../../core/http';
import { Slot } from '../../shared/models';
import { RequestState, requestError, requestSuccess } from '../../shared/state';
import { meseCorrente } from '../../shared/date';
import { TrasfusionaliService } from '../../shared/data/trasfusionali.service';

export class SlotSelezione {
  readonly mese = signal<string>(meseCorrente());
  readonly dataIso = signal<string | null>(null);
  readonly idSlot = signal<number | null>(null);

  private readonly giorniState = signal<RequestState<ReadonlySet<string>>>({ status: 'idle' });
  private readonly slotState = signal<RequestState<readonly Slot[]>>({ status: 'idle' });

  readonly giorniInCaricamento = computed(() => this.giorniState().status === 'loading');
  readonly giorniNonDisponibili: Signal<ReadonlySet<string>> = computed(() => {
    const s = this.giorniState();
    return s.status === 'success' ? s.data : new Set<string>();
  });
  readonly giorniErrore = computed(() => {
    const s = this.giorniState();
    return s.status === 'error' ? s.error : null;
  });

  readonly slotStatus = computed(() => this.slotState().status);
  readonly slots: Signal<readonly Slot[]> = computed(() => {
    const s = this.slotState();
    return s.status === 'success' ? s.data : [];
  });
  readonly slotErrore = computed(() => {
    const s = this.slotState();
    return s.status === 'error' ? s.error : null;
  });
  readonly slotSelezionato = computed(
    () => this.slots().find((s) => s.idSlot === this.idSlot()) ?? null,
  );

  private idTrasfusionale: number | null = null;
  private giorniToken = 0;
  private slotToken = 0;

  constructor(
    private readonly trasfusionali: TrasfusionaliService,
    private readonly destroyRef: DestroyRef,
  ) {}

  perCentro(idTrasfusionale: number, mese = meseCorrente()): void {
    this.idTrasfusionale = idTrasfusionale;
    this.mese.set(mese);
    this.dataIso.set(null);
    this.idSlot.set(null);
    this.slotState.set({ status: 'idle' });
    this.caricaGiorni();
  }

  cambiaMese(mese: string): void {
    this.mese.set(mese);
    this.caricaGiorni();
  }

  selezionaData(iso: string): void {
    if (iso === this.dataIso()) return;
    this.dataIso.set(iso);
    this.idSlot.set(null);
    this.caricaSlot();
  }

  selezionaSlot(idSlot: number): void {
    this.idSlot.set(idSlot);
  }

  ricaricaGiorni(): void {
    this.caricaGiorni();
  }

  ricaricaSlot(): void {
    this.caricaSlot();
  }

  private caricaGiorni(): void {
    const id = this.idTrasfusionale;
    if (id == null) return;
    const token = ++this.giorniToken;
    this.giorniState.set({ status: 'loading' });
    this.trasfusionali
      .giorniNonDisponibili(id, this.mese())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (giorni) => {
          if (token === this.giorniToken) this.giorniState.set(requestSuccess(new Set(giorni)));
        },
        error: (e: NormalizedHttpError) => {
          if (token === this.giorniToken) this.giorniState.set(requestError(e));
        },
      });
  }

  private caricaSlot(): void {
    const id = this.idTrasfusionale;
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
}
