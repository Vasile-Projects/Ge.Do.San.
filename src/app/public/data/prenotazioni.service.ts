import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http';
import {
  ConfermaPrenotazioneRequest,
  PrenotazioneConfermaResponse,
  PrenotazioneRequest,
  RichiestaPrenotazioneResponse,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PrenotazioniService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** Passo 1: crea un'attesa di conferma e fa partire l'email con il link. */
  richiedi(body: PrenotazioneRequest): Observable<RichiestaPrenotazioneResponse> {
    return this.http.post<RichiestaPrenotazioneResponse>(`${this.baseUrl}/prenotazioni`, body);
  }

  /** Passo 2: conferma con il token del link e restituisce la prenotazione creata. */
  conferma(body: ConfermaPrenotazioneRequest): Observable<PrenotazioneConfermaResponse> {
    return this.http.post<PrenotazioneConfermaResponse>(
      `${this.baseUrl}/prenotazioni/conferma`,
      body,
    );
  }
}
