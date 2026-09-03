import { NormalizedHttpError } from '../../core/http';

export type RequestState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly error: NormalizedHttpError }
  | { readonly status: 'success'; readonly data: T };

export const requestIdle: RequestState<never> = { status: 'idle' };
export const requestLoading: RequestState<never> = { status: 'loading' };

export function requestError<T>(error: NormalizedHttpError): RequestState<T> {
  return { status: 'error', error };
}

export function requestSuccess<T>(data: T): RequestState<T> {
  return { status: 'success', data };
}
