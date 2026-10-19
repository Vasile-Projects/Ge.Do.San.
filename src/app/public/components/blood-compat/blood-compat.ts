import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

const GRUPPI = ['0−', '0+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'] as const;
type Gruppo = (typeof GRUPPI)[number];

// Compatibilità delle trasfusioni di globuli rossi: gruppo del donatore -> gruppi che possono riceverli.
const RICEVENTI: Record<Gruppo, readonly Gruppo[]> = {
  '0−': GRUPPI,
  '0+': ['0+', 'A+', 'B+', 'AB+'],
  'A−': ['A−', 'A+', 'AB−', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B−': ['B−', 'B+', 'AB−', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB−': ['AB−', 'AB+'],
  'AB+': ['AB+'],
};

@Component({
  selector: 'app-blood-compat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blood-compat.html',
  styleUrl: './blood-compat.css',
})
export class BloodCompat {
  protected readonly gruppi = GRUPPI;
  protected readonly scelto = signal<Gruppo>('0+');
  protected readonly riceventi = computed(() => RICEVENTI[this.scelto()]);

  protected readonly esito = computed(() => {
    const g = this.scelto();
    const r = this.riceventi();
    if (r.length === GRUPPI.length) {
      return {
        gruppo: g,
        quanti: 'tutti',
        dettaglio: 'è il gruppo più richiesto nelle emergenze.',
      };
    }
    if (r.length === 1) {
      return {
        gruppo: g,
        quanti: 'solo ' + r[0],
        dettaglio: 'ma puoi ricevere da tutti, e il tuo plasma serve a tutti.',
      };
    }
    return { gruppo: g, quanti: `${r.length} gruppi su 8`, dettaglio: r.join(', ') + '.' };
  });

  protected scegli(g: Gruppo): void {
    this.scelto.set(g);
  }
}
