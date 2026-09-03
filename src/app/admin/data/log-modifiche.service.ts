import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http';
import { LogModifica } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class LogModificheService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  elenco(): Observable<LogModifica[]> {
    return this.http.get<LogModifica[]>(`${this.baseUrl}/admin/log-modifiche`);
  }
}
