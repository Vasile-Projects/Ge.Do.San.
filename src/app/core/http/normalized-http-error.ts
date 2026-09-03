import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrore, ErroreValidazione, isApiErrore } from '../../shared/models';

export type HttpErrorKind =
  'network' | 'auth' | 'validazione' | 'client' | 'server' | 'sconosciuto';

export class NormalizedHttpError extends Error {
  readonly status: number;
  readonly kind: HttpErrorKind;
  readonly errore: string | null;
  readonly path: string | null;
  readonly erroriValidazione: readonly ErroreValidazione[] | null;
  readonly originalError: unknown;

  constructor(params: {
    status: number;
    kind: HttpErrorKind;
    message: string;
    errore?: string | null;
    path?: string | null;
    erroriValidazione?: readonly ErroreValidazione[] | null;
    originalError?: unknown;
  }) {
    super(params.message);
    this.name = 'NormalizedHttpError';
    this.status = params.status;
    this.kind = params.kind;
    this.errore = params.errore ?? null;
    this.path = params.path ?? null;
    this.erroriValidazione = params.erroriValidazione ?? null;
    this.originalError = params.originalError;
  }

  hasCampo(campo: string): boolean {
    return this.erroriValidazione?.some((e) => e.campo === campo) ?? false;
  }

  messaggioCampo(campo: string): string | null {
    return this.erroriValidazione?.find((e) => e.campo === campo)?.messaggio ?? null;
  }
}

const MESSAGGI_FALLBACK: Record<number, string> = {
  0: 'Impossibile contattare il server. Controlla la connessione e riprova.',
  500: 'Si è verificato un errore imprevisto. Riprova più tardi.',
};

function kindFromStatus(status: number): HttpErrorKind {
  if (status === 0) return 'network';
  if (status === 401 || status === 403) return 'auth';
  if (status >= 500) return 'server';
  if (status >= 400) return 'client';
  return 'sconosciuto';
}

export function normalizeHttpError(error: unknown): NormalizedHttpError {
  if (error instanceof NormalizedHttpError) {
    return error;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return new NormalizedHttpError({
      status: 0,
      kind: 'sconosciuto',
      message: 'Si è verificato un errore imprevisto.',
      originalError: error,
    });
  }

  const body: unknown = error.error;

  if (isApiErrore(body)) {
    const api: ApiErrore = body;
    return new NormalizedHttpError({
      status: api.status || error.status,
      kind:
        api.status === 400 && api.erroriValidazione?.length
          ? 'validazione'
          : kindFromStatus(api.status || error.status),
      message: api.messaggio,
      errore: api.errore,
      path: api.path,
      erroriValidazione: api.erroriValidazione,
      originalError: error,
    });
  }

  const status = error.status;
  const message =
    MESSAGGI_FALLBACK[status] ??
    (status >= 500 ? MESSAGGI_FALLBACK[500] : 'La richiesta non è andata a buon fine. Riprova.');

  return new NormalizedHttpError({
    status,
    kind: kindFromStatus(status),
    message,
    originalError: error,
  });
}
