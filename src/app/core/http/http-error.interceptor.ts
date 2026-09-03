import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GlobalErrorBus } from './global-error-bus';
import { normalizeHttpError } from './normalized-http-error';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const bus = inject(GlobalErrorBus);

  return next(req).pipe(
    catchError((error: unknown) => {
      const normalized = normalizeHttpError(error);
      if (normalized.kind === 'network' || normalized.kind === 'server') {
        bus.report(normalized);
      }
      return throwError(() => normalized);
    }),
  );
};
