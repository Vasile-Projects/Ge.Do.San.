import { Sesso, TipoDonazione } from './enums';

export interface PrenotazioneRequest {
  readonly nome: string;
  readonly cognome: string;
  readonly dataNascita: string;
  readonly sesso: Sesso;
  readonly codiceFiscale: string;
  readonly email: string;
  readonly cellulare: string;
  readonly idSlot: number;
  readonly tipoDonazione: TipoDonazione;
  /** Token del widget Turnstile: richiesto solo nel flusso pubblico, ignorato dall'area admin. */
  readonly turnstileToken?: string;
}

/**
 * Risposta 202 di `POST /api/prenotazioni`: sempre lo stesso messaggio, qualunque sia l'esito legato
 * alla persona. La prenotazione esiste solo dopo la conferma dal link ricevuto per email.
 */
export interface RichiestaPrenotazioneResponse {
  readonly messaggio: string;
}

export interface ConfermaPrenotazioneRequest {
  readonly token: string;
}

/** Campi comuni alle due risposte di prenotazione (donatore e admin). */
export interface PrenotazioneBase {
  readonly id: number;
  readonly nomeDonatore: string;
  readonly cognomeDonatore: string;
  readonly nomeTrasfusionale: string;
  readonly dataPrenotazione: string;
  readonly orarioPrenotazione: string;
  readonly tipoDonazione: TipoDonazione;
}

/** Risposta di `POST /api/prenotazioni/conferma` (flusso donatore): include i recapiti del centro. */
export interface PrenotazioneConfermaResponse extends PrenotazioneBase {
  readonly indirizzoTrasfusionale: string;
  readonly civicoTrasfusionale: number | null;
  readonly telefonoTrasfusionale: string | null;
}

/** Risposta degli endpoint admin: include i contatti del donatore e `createdAt`. */
export interface PrenotazioneAdminResponse extends PrenotazioneBase {
  readonly emailDonatore: string;
  readonly cellulareDonatore: string;
  readonly createdAt: string;
}

export interface RiprogrammazionePrenotazioneRequest {
  readonly idSlotNuovo: number;
}

export type DatiDonatore = Omit<PrenotazioneRequest, 'idSlot' | 'tipoDonazione'>;
