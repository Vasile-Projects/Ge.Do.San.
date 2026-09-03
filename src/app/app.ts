import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { GlobalErrorBus } from './core/http';
import { TrasfusionaliService } from './shared/data/trasfusionali.service';
import { ErrorToast } from './shared/ui';
import { PublicHeader } from './public/layout/public-header/public-header';
import { PublicFooter } from './public/layout/public-footer/public-footer';

const SOGLIA_HEADER = 100;
const CORSA_HERO = 550;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PublicHeader, PublicFooter, ErrorToast],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:scroll)': 'onScroll()',
    '[style.--hero-progress]': 'heroProgress()',
  },
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
  private readonly suRottaHome = computed(() => this.urlCorrente() === '/');
  private readonly suRottaPrenota = computed(() => this.urlCorrente() === '/prenota');

  protected readonly azione = computed<'prenota' | 'home'>(() =>
    this.suRottaPrenota() ? 'home' : 'prenota',
  );

  private readonly scrollTop = signal(0);
  protected readonly heroProgress = signal(0);
  protected readonly headerOverlay = computed(
    () => this.suRottaHome() && this.scrollTop() < SOGLIA_HEADER,
  );

  private readonly reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private rafPending = false;

  constructor() {
    this.trasfusionali.caricaElenco();
  }

  protected onScroll(): void {
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      const y = window.scrollY;
      this.scrollTop.set(y);
      if (!this.reduceMotion) {
        this.heroProgress.set(Math.min(1, Math.max(0, y / CORSA_HERO)));
      }
    });
  }
}
