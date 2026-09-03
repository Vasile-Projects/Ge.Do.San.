import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NormalizedHttpError } from '../../../core/http';
import { LogModifica } from '../../../shared/models';
import { Loading, ErrorState, EmptyState } from '../../../shared/ui';
import { RequestState, requestError, requestSuccess } from '../../../shared/state';
import { formattaDataOraCompatta } from '../../../shared/date';
import { LogModificheService } from '../../data/log-modifiche.service';

@Component({
  selector: 'app-admin-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Loading, ErrorState, EmptyState],
  templateUrl: './log.html',
  styleUrl: './log.css',
})
export class Log {
  private readonly service = inject(LogModificheService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly state = signal<RequestState<readonly LogModifica[]>>({ status: 'loading' });

  protected readonly status = computed(() => this.state().status);
  protected readonly errore = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.error : null;
  });
  protected readonly voci = computed<readonly LogModifica[]>(() => {
    const s = this.state();
    return s.status === 'success' ? s.data : [];
  });

  protected readonly dataOra = formattaDataOraCompatta;

  constructor() {
    this.carica();
  }

  carica(): void {
    this.state.set({ status: 'loading' });
    this.service
      .elenco()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (v) => this.state.set(requestSuccess(v)),
        error: (e: NormalizedHttpError) => this.state.set(requestError(e)),
      });
  }
}
