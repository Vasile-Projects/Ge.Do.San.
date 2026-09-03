import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../../core/http';
import { LoginRequest, LoginResponse } from '../../shared/models';

const PREAVVISO_MS = 3 * 60_000;
const TOLLERANZA_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly _token = signal<string | null>(null);
  private readonly _scadenza = signal<number | null>(null);
  private readonly _username = signal<string | null>(null);
  private readonly _tick = signal(0);
  private readonly _sessioneScaduta = signal(false);
  private readonly _preavviso = signal(false);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private timerPreavviso: ReturnType<typeof setTimeout> | null = null;

  readonly token = this._token.asReadonly();
  readonly username = this._username.asReadonly();
  readonly scadenza = this._scadenza.asReadonly();
  readonly sessioneScaduta = this._sessioneScaduta.asReadonly();
  readonly preavviso = this._preavviso.asReadonly();

  readonly autenticato = computed(() => {
    this._tick();
    const scadenza = this._scadenza();
    return this._token() !== null && scadenza !== null && Date.now() < scadenza + TOLLERANZA_MS;
  });

  login(credenziali: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, credenziali)
      .pipe(tap((res) => this.avviaSessione(res, credenziali.username)));
  }

  private avviaSessione(res: LoginResponse, username: string): void {
    const scadenza = Date.parse(res.scadenza);
    this._token.set(res.token);
    this._scadenza.set(Number.isNaN(scadenza) ? null : scadenza);
    this._username.set(username);
    this._sessioneScaduta.set(false);
    this._preavviso.set(false);
    this.programmaScadenza(scadenza);
  }

  private programmaScadenza(scadenza: number): void {
    this.azzeraTimer();
    if (Number.isNaN(scadenza)) return;

    const fine = scadenza + TOLLERANZA_MS;
    const attesa = fine - Date.now();
    if (attesa <= 0) {
      this._preavviso.set(true);
      this.notificaSessioneScaduta();
      return;
    }

    const attesaPreavviso = fine - PREAVVISO_MS - Date.now();
    if (attesaPreavviso <= 0) {
      this._preavviso.set(true);
    } else {
      this.timerPreavviso = setTimeout(() => {
        this._preavviso.set(true);
      }, attesaPreavviso);
    }

    this.timer = setTimeout(() => {
      this._tick.update((n) => n + 1);
      this.notificaSessioneScaduta();
    }, attesa);
  }

  private azzeraTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.timerPreavviso !== null) {
      clearTimeout(this.timerPreavviso);
      this.timerPreavviso = null;
    }
  }

  notificaSessioneScaduta(): void {
    if (this._token() !== null) {
      this._sessioneScaduta.set(true);
    }
  }

  logout(): void {
    this.azzeraTimer();
    this._token.set(null);
    this._scadenza.set(null);
    this._username.set(null);
    this._sessioneScaduta.set(false);
    this._preavviso.set(false);
  }

  riconosciSessioneScaduta(): void {
    this.logout();
  }
}
