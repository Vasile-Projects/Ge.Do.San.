import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../data/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticato()) {
    return true;
  }

  return router.createUrlTree(['/admin/login'], {
    queryParams: state.url === '/admin' ? {} : { redirectTo: state.url },
  });
};
