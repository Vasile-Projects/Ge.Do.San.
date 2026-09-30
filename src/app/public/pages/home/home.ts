import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { TrasfusionaliService } from '../../../shared/data/trasfusionali.service';
import { Button, EmptyState, ErrorState, Loading } from '../../../shared/ui';
import { CenterCard } from '../../components/center-card/center-card';
import { Eligibility } from '../../components/eligibility/eligibility';

interface Vantaggio {
  readonly titolo: string;
  readonly testo: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Loading, ErrorState, EmptyState, CenterCard, Eligibility],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly trasfusionali = inject(TrasfusionaliService);

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
