import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';
import { NormalizedHttpError, normalizeHttpError } from '../../core/http';
import { RequestState, requestError, requestIdle, requestLoading, requestSuccess } from '../state';
import { TrasfusionaliService } from './trasfusionali.service';

export interface RisorsaGiorniNonDisponibili {
  readonly stato: Signal<RequestState<ReadonlySet<string>>>;
  readonly giorni: Signal<ReadonlySet<string>>;
  readonly errore: Signal<NormalizedHttpError | null>;
  readonly inCaricamento: Signal<boolean>;
  /** Ricarica il mese corrente (usato dal pulsante "Riprova"). */
  ricarica(): void;
}

export interface OpzioniRisorsaGiorni {
  /** Centro selezionato; `null` mette la risorsa in stato `idle`. */
  readonly idTrasfusionale: Signal<number | null>;
  /** Mese `yyyy-MM` da interrogare. */
  readonly mese: Signal<string>;
  /** Ritardo prima della GET: collassa i burst di navigazione del calendario. Default 200 ms. */
  readonly debounceMs?: number;
  /**
   * Come trattare un errore di rete:
   * - `stato` (default): la risorsa passa in `error`.
   * - `giorniVuoti`: la risorsa resta in `success` con un set vuoto (il calendario mostra
   *   tutti i giorni come potenzialmente aperti). Usato nella dashboard admin dove la lista
   *   dei giorni chiusi è un contorno, non il contenuto principale.
   */
  readonly suErrore?: 'stato' | 'giorniVuoti';
}

/**
 * Carica in modo reattivo i "giorni non disponibili" di un centro per il mese selezionato.
 *
 * Sostituisce il pattern imperativo `caricaGiorni()` + guardia a token:
 * - `toObservable(chiave)` emette solo quando centro o mese cambiano davvero;
 * - `debounceTime` limita le richieste durante la navigazione del calendario (rate limit backend 60/min);
 * - `switchMap` annulla la richiesta precedente (race safety, al posto dei token manuali);
 * - `catchError` è interno allo `switchMap` così lo stream non muore mai.
 *
 * Va invocata in un injection context (costruttore o inizializzatore di campo).
 */
export function creaRisorsaGiorniNonDisponibili(
  opzioni: OpzioniRisorsaGiorni,
): RisorsaGiorniNonDisponibili {
  const trasfusionali = inject(TrasfusionaliService);
  const destroyRef = inject(DestroyRef);

  const stato = signal<RequestState<ReadonlySet<string>>>(requestIdle);
  const refresh = signal(0);

  const chiave = computed(() => {
    refresh();
    const id = opzioni.idTrasfusionale();
    return id === null ? null : { id, mese: opzioni.mese() };
  });

  toObservable(chiave)
    .pipe(
      tap((k) => stato.set(k === null ? requestIdle : requestLoading)),
      debounceTime(opzioni.debounceMs ?? 200),
      switchMap((k) => {
        if (k === null) {
          return of<RequestState<ReadonlySet<string>>>(requestIdle);
        }
        return trasfusionali.giorniNonDisponibili(k.id, k.mese).pipe(
          map((giorni) => requestSuccess<ReadonlySet<string>>(new Set(giorni))),
          catchError((e: unknown) =>
            of(
              opzioni.suErrore === 'giorniVuoti'
                ? requestSuccess<ReadonlySet<string>>(new Set<string>())
                : requestError<ReadonlySet<string>>(normalizeHttpError(e)),
            ),
          ),
        );
      }),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe((s) => stato.set(s));

  return {
    stato: stato.asReadonly(),
    giorni: computed<ReadonlySet<string>>(() => {
      const s = stato();
      return s.status === 'success' ? s.data : new Set<string>();
    }),
    errore: computed(() => {
      const s = stato();
      return s.status === 'error' ? s.error : null;
    }),
    inCaricamento: computed(() => stato().status === 'loading'),
    ricarica: () => refresh.update((n) => n + 1),
  };
}
