import { Injectable, signal } from '@angular/core';
import { NormalizedHttpError } from './normalized-http-error';

@Injectable({ providedIn: 'root' })
export class GlobalErrorBus {
  private readonly _last = signal<NormalizedHttpError | null>(null);

  readonly last = this._last.asReadonly();

  report(error: NormalizedHttpError): void {
    this._last.set(error);
  }

  clear(): void {
    this._last.set(null);
  }
}
