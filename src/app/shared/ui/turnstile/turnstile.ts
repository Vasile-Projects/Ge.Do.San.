import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TURNSTILE_SITE_KEY } from '../../../core/config/turnstile.config';

interface TurnstileApi {
  render(contenitore: HTMLElement, opzioni: Record<string, unknown>): string;
  reset(idWidget: string): void;
  remove(idWidget: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const URL_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let caricamentoScript: Promise<TurnstileApi> | null = null;

/** Carica lo script di Cloudflare una sola volta per tutta l'app, solo quando serve il widget. */
function caricaTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  caricamentoScript ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = URL_SCRIPT;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile non disponibile'));
    script.onerror = () => {
      caricamentoScript = null;
      reject(new Error('Impossibile caricare la verifica anti-bot'));
    };
    document.head.appendChild(script);
  });
  return caricamentoScript;
}

/**
 * Widget Cloudflare Turnstile ("Verifica di essere umano"). Emette il token quando la verifica
 * riesce e `null` quando scade o fallisce. Il token vale per un solo invio: dopo ogni risposta del
 * server va chiamato `reset()` per ottenerne uno nuovo.
 */
@Component({
  selector: 'app-turnstile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #contenitore></div>
    @if (errore(); as msg) {
      <p class="turnstile__err" role="alert">{{ msg }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 65px;
    }
    .turnstile__err {
      color: var(--c-red-dark);
      font-size: var(--fs-small);
    }
  `,
})
export class Turnstile {
  private readonly siteKey = inject(TURNSTILE_SITE_KEY);
  private readonly contenitore = viewChild.required<ElementRef<HTMLElement>>('contenitore');

  readonly token = output<string | null>();

  protected readonly errore = signal<string | null>(null);
  private api: TurnstileApi | null = null;
  private idWidget: string | null = null;

  constructor() {
    afterNextRender(() => {
      caricaTurnstile()
        .then((api) => {
          this.api = api;
          this.idWidget = api.render(this.contenitore().nativeElement, {
            sitekey: this.siteKey,
            language: 'it',
            theme: 'light',
            callback: (t: string) => {
              this.errore.set(null);
              this.token.emit(t);
            },
            'expired-callback': () => this.token.emit(null),
            'error-callback': () => {
              this.token.emit(null);
              this.errore.set('Verifica anti-bot non riuscita. Ricarica la pagina e riprova.');
            },
          });
        })
        .catch((e: Error) => this.errore.set(e.message));
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.api && this.idWidget) this.api.remove(this.idWidget);
    });
  }

  /** Richiede una nuova verifica (il token precedente è già stato consumato dal server). */
  reset(): void {
    this.token.emit(null);
    if (this.api && this.idWidget) this.api.reset(this.idWidget);
  }
}
