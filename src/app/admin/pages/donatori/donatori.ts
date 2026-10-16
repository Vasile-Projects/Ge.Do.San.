import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NormalizedHttpError } from '../../../core/http';
import { DonatoreAdmin } from '../../../shared/models';
import { Button, EmptyState, ErrorState, Loading } from '../../../shared/ui';
import { RequestState, requestError, requestSuccess } from '../../../shared/state';
import { formattaDataCompatta } from '../../../shared/date';
import { DonatoriAdminService } from '../../data/donatori-admin.service';

const LUNGHEZZA_MINIMA = 2;

/** Ricerca puntuale dei donatori: non elenca l'anagrafica completa, serve sempre un criterio. */
@Component({
  selector: 'app-admin-donatori',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Loading, ErrorState, EmptyState],
  templateUrl: './donatori.html',
  styleUrl: './donatori.css',
})
export class Donatori {
  private readonly service = inject(DonatoriAdminService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly testo = signal('');
  protected readonly erroreInput = signal<string | null>(null);
  protected readonly stato = signal<RequestState<readonly DonatoreAdmin[]>>({ status: 'idle' });
  private ultimaRicerca = '';

  protected readonly data = formattaDataCompatta;

  protected onInput(evento: Event): void {
    this.testo.set((evento.target as HTMLInputElement).value);
    this.erroreInput.set(null);
  }

  protected cerca(evento?: Event): void {
    evento?.preventDefault();
    const q = this.testo().trim();
    if (q.length < LUNGHEZZA_MINIMA) {
      this.erroreInput.set(`Inserisci almeno ${LUNGHEZZA_MINIMA} caratteri.`);
      return;
    }
    this.ultimaRicerca = q;
    this.stato.set({ status: 'loading' });
    this.service
      .cerca(q)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (risultati) => this.stato.set(requestSuccess(risultati)),
        error: (e: NormalizedHttpError) => this.stato.set(requestError(e)),
      });
  }

  protected riprova(): void {
    this.testo.set(this.ultimaRicerca);
    this.cerca();
  }
}
