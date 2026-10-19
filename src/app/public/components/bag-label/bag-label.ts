import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Componente {
  readonly nome: string;
  readonly durata: string;
  readonly uso: string;
  readonly tono: 'rossi' | 'plasma' | 'piastrine';
}

// L'etichetta nell'hero della home: cosa diventa una sacca di sangue intero dopo il prelievo.
@Component({
  selector: 'app-bag-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bag-label.html',
  styleUrl: './bag-label.css',
})
export class BagLabel {
  protected readonly componenti: readonly Componente[] = [
    {
      nome: 'Globuli rossi',
      durata: 'durano 42 giorni',
      uso: 'Per chi ha un’emorragia, un intervento chirurgico o un’anemia grave.',
      tono: 'rossi',
    },
    {
      nome: 'Plasma',
      durata: 'fino a 2 anni, congelato',
      uso: 'Per chi ha problemi di coagulazione e per produrre farmaci come albumina e immunoglobuline.',
      tono: 'plasma',
    },
    {
      nome: 'Piastrine',
      durata: 'solo 5 giorni',
      uso: 'Per i pazienti con leucemia o in chemioterapia, unite a quelle di altri donatori.',
      tono: 'piastrine',
    },
  ];
}
