import { InjectionToken, isDevMode } from '@angular/core';

/**
 * Site Key pubblica del widget Cloudflare Turnstile (Dashboard Cloudflare → Turnstile → widget
 * "Gedosan prenotazioni"). È pubblica per definizione: la Secret Key sta solo nel backend.
 */
const SITE_KEY_PRODUZIONE = '0x4AAAAAAFYmeh5Ku3HUqQkN';

/**
 * Site Key di test di Cloudflare: widget visibile che passa sempre. Funziona solo con la secret di
 * test lato backend (1x0000000000000000000000000000000AA); con la secret reale viene rifiutata.
 */
const SITE_KEY_TEST = '1x00000000000000000000AA';

export const TURNSTILE_SITE_KEY = new InjectionToken<string>('TURNSTILE_SITE_KEY', {
  providedIn: 'root',
  factory: () => (isDevMode() ? SITE_KEY_TEST : SITE_KEY_PRODUZIONE),
});
