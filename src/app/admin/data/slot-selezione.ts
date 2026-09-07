import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NormalizedHttpError } from '../../core/http';
import { Slot } from '../../shared/models';
import { RequestState, requestError, requestSuccess } from '../../shared/state';
import { meseCorrente } from '../../shared/date';
import { TrasfusionaliService } from '../../shared/data/trasfusionali.service';
import { creaRisorsaGiorniNonDisponibili } from '../../shared/data/giorni-non-disponibili.resource';

/**
 * Stato condiviso della scelta giorno + orario nei pannelli admin (nuova prenotazione,
 * riprogrammazione). Va istanziata in un injection context (inizializzatore di campo del
 * componente): usa `inject()` internamente.
 *
 * I "giorni non disponibili" passano dalla risorsa reattiva condivisa (debounce sulla
 * navigazione mese + switchMap). Gli slot restano imperativi: la selezione di una data non
 * è bursty e la disponibilità è troppo volatile per essere gestita a stream.
 */
export class SlotSelezione {
  private readonly trasfusionali = inject(TrasfusionaliService);
  private readonly destroyRef = inject(DestroyRef);

  readonly idTrasfusionale = signal<number | null>(null);
  readonly mese = signal<string>(meseCorrente());
  readonly dataIso = signal<string | null>(null);
  readonly idSlot = signal<number | null>(null);

  private readonly risorsaGiorni = creaRisorsaGiorniNonDisponibili({
    idTrasfusionale: this.idTrasfusionale,
    mese: this.mese,
  });

  private readonly slotState = signal<RequestState<readonly Slot[]>>({ status: 'idle' });

  readonly giorniInCaricamento = this.risorsaGiorni.inCaricamento;
  readonly giorniNonDisponibili: Signal<ReadonlySet<string>> = this.risorsaGiorni.giorni;
  readonly giorniErrore = this.risorsaGiorni.errore;

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

  private slotToken = 0;

  perCentro(idTrasfusionale: number, mese = meseCorrente()): void {
    this.dataIso.set(null);
    this.idSlot.set(null);
    this.slotState.set({ status: 'idle' });
    this.mese.set(mese);
    this.idTrasfusionale.set(idTrasfusionale);
  }

  cambiaMese(mese: string): void {
    this.mese.set(mese);
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
    this.risorsaGiorni.ricarica();
  }

  ricaricaSlot(): void {
    this.caricaSlot();
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
          if (e.status === 409) {
            this.dataIso.set(null);
            this.idSlot.set(null);
            this.slotState.set({ status: 'idle' });
            this.risorsaGiorni.ricarica();
          } else {
            this.slotState.set(requestError(e));
          }
        },
      });
  }
}
