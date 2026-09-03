import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AuthService } from '../data/auth.service';

export interface ConLavoroInCorso {
  confermaUscita(): boolean | Promise<boolean>;
}

export const lavoroInCorsoGuard: CanDeactivateFn<ConLavoroInCorso> = (componente) => {
  if (inject(AuthService).sessioneScaduta()) {
    return true;
  }
  return typeof componente?.confermaUscita === 'function' ? componente.confermaUscita() : true;
};
