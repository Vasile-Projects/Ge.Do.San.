import { Sesso, TipoDonazione } from './enums';

/** Donatore come lo vede l'area admin (`GET /api/admin/donatori`). */
export interface DonatoreAdmin {
  readonly id: number;
  readonly nome: string;
  readonly cognome: string;
  readonly dataNascita: string;
  readonly sesso: Sesso;
  readonly codiceFiscale: string;
  readonly email: string;
  readonly cellulare: string;
  readonly createdAt: string;
}

export interface PrenotazioneDonatore {
  readonly id: number;
  readonly nomeTrasfusionale: string;
  readonly data: string;
  readonly orario: string;
  readonly tipoDonazione: TipoDonazione;
}

/** Voce di audit: quali campi ha cambiato un operatore (mai i valori). */
export interface ModificaAnagrafica {
  readonly campiModificati: string;
  readonly usernameAdmin: string;
  readonly timestamp: string;
}

export interface DonatoreDettaglio {
  readonly donatore: DonatoreAdmin;
  readonly prenotazioni: readonly PrenotazioneDonatore[];
  readonly modifiche: readonly ModificaAnagrafica[];
}

/** Body di `PATCH /api/admin/donatori/{id}`: sempre l'anagrafica completa. */
export type ModificaDonatoreRequest = Omit<DonatoreAdmin, 'id' | 'createdAt'>;
