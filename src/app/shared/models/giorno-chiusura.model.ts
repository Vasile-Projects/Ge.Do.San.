import { TipoGiornoChiusura } from './enums';

/** Una riga del riepilogo `GET /api/admin/giorni-chiusura`: un giorno in cui il centro è chiuso. */
export interface GiornoChiusura {
  readonly data: string;
  readonly descrizione: string;
  /** `ORDINARIO` = festivo ricorrente nazionale; `STRAORDINARIO` = chiusura inserita dall'admin. */
  readonly tipo: TipoGiornoChiusura;
}
