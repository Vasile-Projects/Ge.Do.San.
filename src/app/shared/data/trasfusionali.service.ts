import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL, normalizeHttpError } from '../../core/http';
import { GiorniNonDisponibiliResponse, Slot, Trasfusionale } from '../models';
import { RequestState, requestError, requestSuccess } from '../state';

@Injectable({ providedIn: 'root' })
export class TrasfusionaliService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly _elenco = signal<RequestState<readonly Trasfusionale[]>>({ status: 'idle' });

  readonly elencoStato = this._elenco.asReadonly();
  readonly centri = computed<readonly Trasfusionale[]>(() => {
    const s = this._elenco();
    return s.status === 'success' ? s.data : [];
  });
  readonly erroreElenco = computed(() => {
    const s = this._elenco();
    return s.status === 'error' ? s.error : null;
  });

  caricaElenco(forza = false): void {
    const stato = this._elenco().status;
    if (!forza && stato !== 'idle' && stato !== 'error') {
      return;
    }
    this._elenco.set({ status: 'loading' });
    this.http.get<Trasfusionale[]>(`${this.baseUrl}/trasfusionali`).subscribe({
      next: (c) => this._elenco.set(requestSuccess(c)),
      error: (e) => this._elenco.set(requestError(normalizeHttpError(e))),
    });
  }

  giorniNonDisponibili(idTrasfusionale: number, mese: string): Observable<readonly string[]> {
    return this.http
      .get<GiorniNonDisponibiliResponse>(
        `${this.baseUrl}/trasfusionali/${idTrasfusionale}/giorni-non-disponibili`,
        { params: { mese } },
      )
      .pipe(map((r) => r.giorniNonDisponibili));
  }

  slot(idTrasfusionale: number, data: string): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.baseUrl}/trasfusionali/${idTrasfusionale}/slot`, {
      params: { data },
    });
  }
}
