import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { TELEGRAM_BOT_URL } from '../../../core/config/telegram.config';
import { Button, Icon } from '../../../shared/ui';

// Pulsante fisso in basso a destra su tutte le pagine pubbliche: apre un box con una spiegazione
// breve e il link al bot. Si chiude con la X, con Esc o cliccando fuori.
@Component({
  selector: 'app-telegram-assistant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  templateUrl: './telegram-assistant.html',
  styleUrl: './telegram-assistant.css',
  host: {
    '(document:keydown.escape)': 'chiudi()',
    '(document:click)': 'clicFuori($event)',
  },
})
export class TelegramAssistant {
  protected readonly telegramUrl = inject(TELEGRAM_BOT_URL);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly injector = inject(Injector);

  private readonly pulsante = viewChild.required<ElementRef<HTMLButtonElement>>('pulsante');
  private readonly box = viewChild<ElementRef<HTMLElement>>('box');

  protected readonly aperto = signal(false);

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
