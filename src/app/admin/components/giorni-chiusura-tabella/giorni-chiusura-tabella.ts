import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NormalizedHttpError } from '../../../core/http';
import { GiornoChiusura } from '../../../shared/models';
import { Loading, ErrorState, EmptyState } from '../../../shared/ui';
import { RequestState, requestError, requestLoading, requestSuccess } from '../../../shared/state';
import { formattaDataCompatta } from '../../../shared/date';
import { VariazioniAperturaService } from '../../data/variazioni-apertura.service';

/**
 * Riepilogo di sola lettura dei giorni di chiusura di un centro per un anno
 * (`GET /api/admin/giorni-chiusura`). Ricarica al cambio di centro o di anno.
 */
@Component({
  selector: 'app-giorni-chiusura-tabella',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Loading, ErrorState, EmptyState],
  templateUrl: './giorni-chiusura-tabella.html',
  styleUrl: './giorni-chiusura-tabella.css',
})
export class GiorniChiusuraTabella {
  private readonly service = inject(VariazioniAperturaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly idTrasfusionale = input.required<number>();

  private readonly annoCorrente = new Date().getFullYear();
  // Il backend accetta solo l'anno corrente o successivi.
  protected readonly anniSelezionabili: readonly number[] = [
    this.annoCorrente,
    this.annoCorrente + 1,
    this.annoCorrente + 2,
  ];
  protected readonly anno = signal(this.annoCorrente);

  private readonly stato = signal<RequestState<readonly GiornoChiusura[]>>(requestLoading);
  private token = 0;

  protected readonly status = computed(() => this.stato().status);
  protected readonly errore = computed(() => {
    const s = this.stato();
    return s.status === 'error' ? s.error : null;
  });
  protected readonly giorni = computed<readonly GiornoChiusura[]>(() => {
    const s = this.stato();
    return s.status === 'success' ? s.data : [];
  });

  protected readonly data = formattaDataCompatta;

  constructor() {
    effect(() => this.carica(this.idTrasfusionale(), this.anno()));
  }

  protected onAnno(evento: Event): void {
    this.anno.set(Number((evento.target as HTMLSelectElement).value));
  }

  protected ricarica(): void {
    this.carica(this.idTrasfusionale(), this.anno());
  }

  private carica(idTrasfusionale: number, anno: number): void {
    const token = ++this.token;
    this.stato.set(requestLoading);
    this.service
      .giorniChiusura(idTrasfusionale, anno)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (g) => {
          if (token === this.token) this.stato.set(requestSuccess(g));
        },
        error: (e: NormalizedHttpError) => {
          if (token === this.token) this.stato.set(requestError(e));
        },
      });
  }
}
