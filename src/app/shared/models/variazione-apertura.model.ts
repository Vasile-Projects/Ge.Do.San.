export interface VariazioneApertura {
  readonly id: number;
  readonly nomeTrasfusionale: string;
  readonly dataVariazione: string;
  readonly apertura: boolean;
  readonly motivo: string | null;
}

export interface CreaVariazioneAperturaRequest {
  readonly idTrasfusionali: readonly number[];
  readonly dataVariazione: string;
  readonly apertura: boolean;
  readonly motivo?: string;
}
