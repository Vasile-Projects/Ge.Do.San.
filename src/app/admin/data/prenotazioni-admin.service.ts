import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http';
import { PrenotazioneAdminResponse, PrenotazioneRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PrenotazioniAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private get radice(): string {
    return `${this.baseUrl}/admin/prenotazioni`;
  }

  elenco(idTrasfusionale: number, data: string): Observable<PrenotazioneAdminResponse[]> {
    return this.http.get<PrenotazioneAdminResponse[]>(this.radice, {
      params: { idTrasfusionale, data },
    });
  }

  dettaglio(id: number): Observable<PrenotazioneAdminResponse> {
    return this.http.get<PrenotazioneAdminResponse>(`${this.radice}/${id}`);
  }

  crea(body: PrenotazioneRequest): Observable<PrenotazioneAdminResponse> {
    return this.http.post<PrenotazioneAdminResponse>(this.radice, body);
  }

  riprogramma(id: number, idSlotNuovo: number): Observable<PrenotazioneAdminResponse> {
    return this.http.patch<PrenotazioneAdminResponse>(`${this.radice}/${id}`, { idSlotNuovo });
  }

  cancella(id: number): Observable<void> {
    return this.http.delete<void>(`${this.radice}/${id}`);
  }

  esportaPdf(idTrasfusionale: number, data: string): Observable<Blob> {
    return this.http.get(`${this.radice}/esportazione`, {
      params: { idTrasfusionale, data },
      responseType: 'blob',
    });
  }
}
