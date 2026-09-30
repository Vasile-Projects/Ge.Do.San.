import { ChangeDetectionStrategy, Component } from '@angular/core';
import { REGOLE_BUSINESS } from '../../../shared/models';

interface Requisito {
  readonly valore: string;
  readonly descrizione: string;
}

const R = REGOLE_BUSINESS;

@Component({
  selector: 'app-eligibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eligibility.html',
  styleUrl: './eligibility.css',
})
export class Eligibility {
  protected readonly requisiti: readonly Requisito[] = [
    {
      valore: `${R.etaMinima}–${R.etaMassima} anni`,
      descrizione: 'L’età per donare sangue intero.',
    },
    {
      valore: '50 kg',
      descrizione: 'Il peso corporeo minimo.',
    },
    {
      valore: `${R.intervalloGiorniUomini} giorni`,
      descrizione: `Il tempo minimo tra una donazione e la successiva. Le donne possono donare al massimo ${R.maxDonazioniDonnePerFinestra} volte in 12 mesi.`,
    },
    {
      valore: 'Buona salute',
      descrizione:
        'Pressione ed emoglobina nella norma: le controlla il medico prima della donazione.',
    },
  ];

  protected readonly giornoDonazione: readonly string[] = [
    'Porta un documento d’identità valido e la tessera sanitaria.',
    'Fai una colazione leggera, senza latte e derivati.',
    'Presentati riposato, dopo una notte di sonno.',
    'Nei giorni prima evita comportamenti a rischio.',
  ];
}
