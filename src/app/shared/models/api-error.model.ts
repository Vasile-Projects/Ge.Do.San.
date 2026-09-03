export interface ErroreValidazione {
  readonly campo: string;
  readonly messaggio: string;
}

export interface ApiErrore {
  readonly status: number;
  readonly errore: string;
  readonly messaggio: string;
  readonly path: string;
  readonly erroriValidazione: readonly ErroreValidazione[] | null;
}

export function isApiErrore(value: unknown): value is ApiErrore {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v['status'] === 'number' &&
    typeof v['errore'] === 'string' &&
    typeof v['messaggio'] === 'string' &&
    typeof v['path'] === 'string' &&
    (v['erroriValidazione'] === null || Array.isArray(v['erroriValidazione']))
  );
}
