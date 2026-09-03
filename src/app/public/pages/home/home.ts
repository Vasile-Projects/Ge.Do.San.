import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { TrasfusionaliService } from '../../../shared/data/trasfusionali.service';
import { Button, EmptyState, ErrorState, Loading, Stat } from '../../../shared/ui';
import { CenterCard } from '../../components/center-card/center-card';
import { Eligibility } from '../../components/eligibility/eligibility';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Stat, Loading, ErrorState, EmptyState, CenterCard, Eligibility],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly trasfusionali = inject(TrasfusionaliService);

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
