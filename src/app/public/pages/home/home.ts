import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TELEGRAM_BOT_URL } from '../../../core/config/telegram.config';

import { TrasfusionaliService } from '../../../shared/data/trasfusionali.service';
import { Button, EmptyState, ErrorState, Icon, Loading } from '../../../shared/ui';
import { CenterCard } from '../../components/center-card/center-card';
import { Eligibility } from '../../components/eligibility/eligibility';

interface Vantaggio {
  readonly titolo: string;
  readonly testo: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, Loading, ErrorState, EmptyState, CenterCard, Eligibility],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly trasfusionali = inject(TrasfusionaliService);
  protected readonly telegramUrl = inject(TELEGRAM_BOT_URL);

  // L'assistente prenota solo per chi è già registrato: i nuovi donatori passano dal modulo.
  protected readonly puntiTelegram: readonly string[] = [
    'Scopri quando puoi donare di nuovo',
    'Vedi gli orari liberi del tuo centro',
    'Prenota con un tocco, senza compilare il modulo',
  ];

  protected readonly vantaggi: readonly Vantaggio[] = [
    {
      titolo: 'Giornata di riposo retribuita',
      testo:
        'Se sei lavoratore dipendente, il giorno della donazione resti a casa con lo stipendio pieno.',
    },
    {
      titolo: 'Analisi del sangue gratuite',
      testo: 'A ogni donazione il sangue viene analizzato e ricevi il referto con i risultati.',
    },
    {
      titolo: 'Controlli medici periodici',
      testo:
        'Prima di ogni donazione un medico ti visita, e una volta l’anno fai controlli più completi.',
    },
    {
      titolo: 'Colazione offerta',
      testo: 'Dopo il prelievo il centro ti offre la colazione, per rimetterti in forze.',
    },
  ];

  protected readonly centriStatus = computed(() => {
    const s = this.trasfusionali.elencoStato().status;
    return s === 'idle' ? 'loading' : s;
  });
  protected readonly centriData = this.trasfusionali.centri;
  protected readonly centriError = this.trasfusionali.erroreElenco;

  private readonly reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected ricaricaCentri(): void {
    this.trasfusionali.caricaElenco(true);
  }

  protected scrollToCentri(): void {
    document
      .getElementById('centri')
      ?.scrollIntoView({ behavior: this.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
}
