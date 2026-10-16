import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NormalizedHttpError } from '../../../core/http';
import { PrenotazioneConfermaResponse } from '../../../shared/models';
import { Button, Icon } from '../../../shared/ui';
import { PrenotazioniService } from '../../data/prenotazioni.service';
import { BookingConfirmation } from '../../components/booking-confirmation/booking-confirmation';

type Stato =
  | { readonly tipo: 'pronto' }
  | { readonly tipo: 'invio' }
  | { readonly tipo: 'confermata'; readonly prenotazione: PrenotazioneConfermaResponse }
  | { readonly tipo: 'errore'; readonly messaggio: string; readonly riprovabile: boolean }
  | { readonly tipo: 'senzaToken' };

/**
 * Pagina aperta dal link dell'email. La conferma parte solo premendo il pulsante (POST), mai al
 * semplice caricamento: client di posta e antivirus aprono da soli i link delle email e
 * confermerebbero al posto del donatore.
 */
@Component({
  selector: 'app-conferma',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, BookingConfirmation],
  templateUrl: './conferma.html',
  styleUrl: './conferma.css',
})
export class Conferma {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  private readonly token: string | null = this.route.snapshot.queryParamMap.get('token');
  protected readonly stato = signal<Stato>(
    this.token ? { tipo: 'pronto' } : { tipo: 'senzaToken' },
  );

  constructor() {
    // Toglie il token dalla barra degli indirizzi (resta solo in memoria): non finisce nella
    // cronologia, in uno screenshot o in un link copiato.
    if (this.token) {
      void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }

    effect(() => {
      if (this.stato().tipo === 'confermata') {
        queueMicrotask(() =>
          this.host.nativeElement.querySelector<HTMLElement>('.booking-confirmation')?.focus(),
        );
      }
    });
  }

  protected conferma(): void {
    if (!this.token || this.stato().tipo === 'invio') return;
    this.stato.set({ tipo: 'invio' });

    this.prenotazioni
      .conferma({ token: this.token })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (prenotazione) => this.stato.set({ tipo: 'confermata', prenotazione }),
        error: (e: NormalizedHttpError) => this.stato.set(this.statoErrore(e)),
      });
  }

  // 404 (link usato, scaduto o inesistente) e 409 (regola non più rispettata, dati cambiati)
  // sono definitivi: serve una nuova prenotazione. Rete, 429 e 5xx si possono riprovare.
  private statoErrore(e: NormalizedHttpError): Stato {
    const definitivo = e.status === 404 || e.status === 409 || e.status === 400;
    return { tipo: 'errore', messaggio: e.message, riprovabile: !definitivo };
  }

  protected nuovaPrenotazione(): void {
    void this.router.navigate(['/prenota']);
  }
}
