import { CanDeactivateFn } from '@angular/router';

export interface AvvisoUscita {
  confermaPrimaDiUscire(): boolean | Promise<boolean>;
}

export const confermaUscitaGuard: CanDeactivateFn<AvvisoUscita> = (component) =>
  component.confermaPrimaDiUscire();
