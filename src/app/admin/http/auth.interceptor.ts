import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../data/auth.service';

function isChiamataAdmin(url: string): boolean {
  return url.includes('/api/admin/');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (!isChiamataAdmin(req.url)) {
    return next(req);
  }

  const token = auth.token();
  const autenticata = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(autenticata).pipe(
    catchError((error: unknown) => {
      const status =
        error !== null && typeof error === 'object' && 'status' in error
          ? (error as { status: number }).status
          : 0;
      if (status === 401 || status === 403) {
        auth.notificaSessioneScaduta();
      }
      return throwError(() => error);
    }),
  );
};
