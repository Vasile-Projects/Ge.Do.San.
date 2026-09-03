import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http';
import { PrenotazioneConfermaResponse, PrenotazioneRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PrenotazioniService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  crea(body: PrenotazioneRequest): Observable<PrenotazioneConfermaResponse> {
    return this.http.post<PrenotazioneConfermaResponse>(`${this.baseUrl}/prenotazioni`, body);
  }
}
