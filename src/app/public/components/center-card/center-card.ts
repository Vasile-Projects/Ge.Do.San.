import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon, MapEmbed } from '../../../shared/ui';
import { Trasfusionale } from '../../../shared/models';

@Component({
  selector: 'app-center-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, MapEmbed],
  templateUrl: './center-card.html',
  styleUrl: './center-card.css',
})
export class CenterCard {
  readonly centro = input.required<Trasfusionale>();

  protected readonly indirizzo = computed(() => {
    const c = this.centro();
    const via = c.civico != null ? `${c.indirizzo}, ${c.civico}` : c.indirizzo;
    return `${via}, ${c.citta}`;
  });

  protected readonly mapsQuery = computed(() => {
    const c = this.centro();
    const via = c.civico != null ? `${c.indirizzo} ${c.civico}` : c.indirizzo;
    return `${c.nome}, ${via}, ${c.citta}`;
  });

  protected readonly directionsUrl = computed(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.mapsQuery())}`,
  );
}
