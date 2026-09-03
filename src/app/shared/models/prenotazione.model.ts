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
}

export interface PrenotazioneConfermaResponse {
  readonly id: number;
  readonly nomeDonatore: string;
  readonly cognomeDonatore: string;
  readonly nomeTrasfusionale: string;
  readonly dataPrenotazione: string;
  readonly orarioPrenotazione: string;
  readonly tipoDonazione: TipoDonazione;
}

export interface PrenotazioneAdminResponse extends PrenotazioneConfermaResponse {
  readonly emailDonatore: string;
  readonly cellulareDonatore: string;
  readonly createdAt: string;
}

export interface RiprogrammazionePrenotazioneRequest {
  readonly idSlotNuovo: number;
}

export type DatiDonatore = Omit<PrenotazioneRequest, 'idSlot' | 'tipoDonazione'>;
