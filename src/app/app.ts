import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { GlobalErrorBus } from './core/http';
import { TrasfusionaliService } from './shared/data/trasfusionali.service';
import { ErrorToast } from './shared/ui';
import { PublicHeader } from './public/layout/public-header/public-header';
import { PublicFooter } from './public/layout/public-footer/public-footer';
import { TelegramAssistant } from './public/components/telegram-assistant/telegram-assistant';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PublicHeader, PublicFooter, ErrorToast, TelegramAssistant],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  protected readonly trasfusionali = inject(TrasfusionaliService);
  protected readonly errorBus = inject(GlobalErrorBus);

  private readonly navEnd = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    { initialValue: null },
  );
  private readonly urlCorrente = computed(() => {
    const nav = this.navEnd();
    return (nav ? nav.urlAfterRedirects : this.router.url).split(/[?#]/)[0];
  });

  protected readonly suRottaAdmin = computed(() => this.urlCorrente().startsWith('/admin'));
  private readonly suRottaPrenota = computed(() => this.urlCorrente() === '/prenota');

  protected readonly azione = computed<'prenota' | 'home'>(() =>
    this.suRottaPrenota() ? 'home' : 'prenota',
  );

  constructor() {
    this.trasfusionali.caricaElenco();
  }
}
