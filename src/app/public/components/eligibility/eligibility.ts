import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon, IconName } from '../../../shared/ui';

interface EligibilityCriterion {
  readonly icon: IconName;
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-eligibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './eligibility.html',
  styleUrl: './eligibility.css',
})
export class Eligibility {
  protected readonly criteri: readonly EligibilityCriterion[] = [
    {
      icon: 'users',
      value: '18–65 anni',
      label: 'Età compresa tra 18 e 65 anni.',
    },
    {
      icon: 'scale',
      value: '50 kg',
      label: 'Peso corporeo minimo per donare sangue intero.',
    },
    {
      icon: 'heart',
      value: 'Buona salute',
      label: 'Pressione ed emoglobina nella norma, controllati dal medico prima della donazione.',
    },
    {
      icon: 'clock',
      value: '90 giorni',
      label: 'Intervallo minimo tra due donazioni di sangue intero.',
    },
    {
      icon: 'id-card',
      value: 'Documento valido',
      label: 'Porta con te un documento d’identità valido e la tessera sanitaria.',
    },
    {
      icon: 'info',
      value: 'Stile di vita',
      label:
        'Evita comportamenti a rischio. Presentati riposato e con una colazione leggera, evitando latte e derivati.',
    },
  ];
}
