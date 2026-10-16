import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http';
import { DonatoreAdmin, DonatoreDettaglio, ModificaDonatoreRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class DonatoriAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** Email esatta, codice fiscale esatto oppure prefisso del cognome (almeno 2 caratteri). */
  cerca(q: string): Observable<DonatoreAdmin[]> {
    return this.http.get<DonatoreAdmin[]>(`${this.baseUrl}/admin/donatori`, { params: { q } });
  }

  dettaglio(id: number): Observable<DonatoreDettaglio> {
    return this.http.get<DonatoreDettaglio>(`${this.baseUrl}/admin/donatori/${id}`);
  }

  modifica(id: number, body: ModificaDonatoreRequest): Observable<DonatoreAdmin> {
    return this.http.patch<DonatoreAdmin>(`${this.baseUrl}/admin/donatori/${id}`, body);
  }
}
