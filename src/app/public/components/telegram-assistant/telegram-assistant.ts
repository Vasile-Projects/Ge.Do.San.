import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { TELEGRAM_BOT_URL } from '../../../core/config/telegram.config';
import { Button, Icon } from '../../../shared/ui';

// Pulsante fisso in basso a destra su tutte le pagine pubbliche: apre un box con una spiegazione
// breve e il link al bot. Si chiude con la X, con Esc o cliccando fuori. Si ritira quando sullo
// schermo c'è già un'azione equivalente: gli elementi marcati con data-nasconde-assistente.
@Component({
  selector: 'app-telegram-assistant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  templateUrl: './telegram-assistant.html',
  styleUrl: './telegram-assistant.css',
  host: {
    '(document:keydown.escape)': 'chiudi()',
    '(document:click)': 'clicFuori($event)',
    '[class.assistente--via]': 'coperto() && !aperto()',
  },
})
export class TelegramAssistant {
  protected readonly telegramUrl = inject(TELEGRAM_BOT_URL);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly injector = inject(Injector);

  private readonly pulsante = viewChild.required<ElementRef<HTMLButtonElement>>('pulsante');
  private readonly box = viewChild<ElementRef<HTMLElement>>('box');

  protected readonly aperto = signal(false);
  protected readonly coperto = signal(false);

  private osservatore: IntersectionObserver | null = null;
  private readonly visibili = new Set<Element>();

  constructor() {
    // Le zone da osservare cambiano a ogni pagina: si ricollegano dopo ogni navigazione.
    afterNextRender(() => this.osservaZone());
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => afterNextRender(() => this.osservaZone(), { injector: this.injector }));
    inject(DestroyRef).onDestroy(() => this.osservatore?.disconnect());
  }

  private osservaZone(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.osservatore?.disconnect();
    this.visibili.clear();
    this.coperto.set(false);
    const osservatore = new IntersectionObserver(
      (voci) => {
        for (const v of voci) {
          if (v.isIntersecting) this.visibili.add(v.target);
          else this.visibili.delete(v.target);
        }
        this.coperto.set(this.visibili.size > 0);
      },
      { rootMargin: '0px 0px -80px 0px' },
    );
    document
      .querySelectorAll('[data-nasconde-assistente]')
      .forEach((zona) => osservatore.observe(zona));
    this.osservatore = osservatore;
  }

  protected alterna(): void {
    if (this.aperto()) {
      this.chiudi();
      return;
    }
    this.aperto.set(true);
    // Il focus passa al box appena compare, così da tastiera si arriva subito al link.
    afterNextRender(() => this.box()?.nativeElement.focus(), { injector: this.injector });
  }

  protected chiudi(ripristinaFocus = true): void {
    if (!this.aperto()) return;
    this.aperto.set(false);
    if (ripristinaFocus) this.pulsante().nativeElement.focus();
  }

  protected clicFuori(evento: MouseEvent): void {
    if (this.aperto() && !this.host.nativeElement.contains(evento.target as Node)) {
      this.chiudi(false);
    }
  }
}
