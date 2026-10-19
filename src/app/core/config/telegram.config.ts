import { InjectionToken } from '@angular/core';

/**
 * Link pubblico all'assistente Gedosan su Telegram (bot @Gedosan_vsz_bot, workflow n8n). Unico punto
 * da cambiare se cambia il bot: lo usano la fascia in home, l'avviso del modulo e il pulsante sticky.
 */
export const TELEGRAM_BOT_URL = new InjectionToken<string>('TELEGRAM_BOT_URL', {
  providedIn: 'root',
  factory: () => 'https://t.me/Gedosan_vsz_bot',
});
