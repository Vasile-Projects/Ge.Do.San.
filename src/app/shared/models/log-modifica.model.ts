import { AzioneAdmin } from './enums';

export interface LogModifica {
  readonly id: number;
  readonly azione: AzioneAdmin;
  readonly idPrenotazione: number;
  readonly idSlotVecchio: number;
  readonly idSlotNuovo: number | null;
  readonly nomeDonatore: string;
  readonly cognomeDonatore: string;
  readonly usernameAdmin: string;
  readonly timestamp: string;
}
