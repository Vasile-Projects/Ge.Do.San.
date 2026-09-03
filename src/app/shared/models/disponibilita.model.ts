export interface GiorniNonDisponibiliResponse {
  readonly giorniNonDisponibili: readonly string[];
}

export interface Slot {
  readonly idSlot: number;
  readonly orario: string;
  readonly disponibile: boolean;
  readonly postiLiberi: number;
}
