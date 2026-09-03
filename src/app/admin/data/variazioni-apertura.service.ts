import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http';
import { CreaVariazioneAperturaRequest, VariazioneApertura } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class VariazioniAperturaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private get radice(): string {
    return `${this.baseUrl}/admin/variazioni-apertura`;
  }

  elenco(idTrasfusionale?: number): Observable<VariazioneApertura[]> {
    return this.http.get<VariazioneApertura[]>(this.radice, {
      params: idTrasfusionale != null ? { idTrasfusionale } : {},
    });
  }

  crea(body: CreaVariazioneAperturaRequest): Observable<VariazioneApertura[]> {
    return this.http.post<VariazioneApertura[]>(this.radice, body);
  }

  elimina(id: number): Observable<void> {
    return this.http.delete<void>(`${this.radice}/${id}`);
  }
}
