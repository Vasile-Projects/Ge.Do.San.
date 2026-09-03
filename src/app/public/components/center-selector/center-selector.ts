import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { Icon } from '../../../shared/ui';
import { indiceDaTasto } from '../../../shared/a11y';
import { Trasfusionale } from '../../../shared/models';

@Component({
  selector: 'app-center-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './center-selector.html',
  styleUrl: './center-selector.css',
})
export class CenterSelector {
  readonly centri = input.required<readonly Trasfusionale[]>();
  readonly selezionatoId = input<number | null>(null);
  readonly seleziona = output<number>();

  private readonly opzioni = viewChildren<ElementRef<HTMLButtonElement>>('opzione');

  protected readonly indiceAttivo = computed(() => {
    const sel = this.selezionatoId();
    const idx = this.centri().findIndex((c) => c.id === sel);
    return idx >= 0 ? idx : 0;
  });

  protected indirizzo(c: Trasfusionale): string {
    const via = c.civico != null ? `${c.indirizzo}, ${c.civico}` : c.indirizzo;
    return `${via}, ${c.citta}`;
  }

  protected onKeydown(event: KeyboardEvent, indice: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.seleziona.emit(this.centri()[indice].id);
      return;
    }
    const nuovo = indiceDaTasto(indice, this.centri().length, event.key);
    if (nuovo === null) {
      return;
    }
    event.preventDefault();
    this.seleziona.emit(this.centri()[nuovo].id);
    this.opzioni()[nuovo]?.nativeElement.focus();
  }
}
