import { InjectionToken, isDevMode } from '@angular/core';

/** In sviluppo (`ng serve`) il backend locale, nella build di produzione l'API pubblicata. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => (isDevMode() ? 'http://localhost:8080/api' : 'https://gedosanapi.vszdev.it/api'),
});
