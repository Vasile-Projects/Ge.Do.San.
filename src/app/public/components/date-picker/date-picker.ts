import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { Icon } from '../../../shared/ui';
import {
  aggiungiGiorni,
  formattaDataEstesa,
  grigliaMese,
  meseDi,
  nomeMese,
  offsetLunedi,
  oggiIso,
  spostaMese,
} from '../../../shared/date';

const GIORNI_SETTIMANA = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

@Component({
  selector: 'app-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePicker {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly mese = input.required<string>();
  readonly selezionata = input<string | null>(null);
  readonly giorniNonDisponibili = input<ReadonlySet<string>>(new Set<string>());
  readonly minIso = input.required<string>();
  readonly maxIso = input.required<string>();
  readonly caricamento = input(false);
  readonly chiusiSelezionabili = input(false);

  readonly cambiaMese = output<string>();
  readonly selezionaData = output<string>();

  protected readonly giorniSettimana = GIORNI_SETTIMANA;
  protected readonly oggi = oggiIso();

  private readonly celle = viewChildren<ElementRef<HTMLButtonElement>>('cella');
  private readonly isoFocale = signal<string | null>(null);

  protected readonly settimane = computed(() => grigliaMese(this.mese()));

  protected readonly etichettaMese = computed(() => nomeMese(this.mese()));

  protected readonly puoIndietro = computed(
    () => spostaMese(this.mese(), -1) + '-31' >= this.minIso(),
  );
  protected readonly puoAvanti = computed(
    () => spostaMese(this.mese(), 1) + '-01' <= this.maxIso(),
  );

  protected readonly isoAttivo = computed(() => {
    const f = this.isoFocale();
    if (f && meseDi(f) === this.mese() && this.selezionabileGiorno(f)) {
      return f;
    }
    const sel = this.selezionata();
    if (sel && meseDi(sel) === this.mese() && this.selezionabileGiorno(sel)) {
      return sel;
    }
    return this.primoSelezionabile();
  });

  constructor() {
    effect(() => {
      const iso = this.isoFocale();
      if (!iso || !this.host.nativeElement.contains(document.activeElement)) {
        return;
      }
      this.celle()
        .find((c) => c.nativeElement.dataset['iso'] === iso)
        ?.nativeElement.focus();
    });
  }

  protected estesa = formattaDataEstesa;

  protected nelFinestra(iso: string): boolean {
    return iso >= this.minIso() && iso <= this.maxIso();
  }

  protected selezionabileGiorno(iso: string): boolean {
    return meseDi(iso) === this.mese() && this.nelFinestra(iso);
  }

  protected chiuso(iso: string): boolean {
    return this.giorniNonDisponibili().has(iso);
  }

  private primoSelezionabile(): string {
    for (const settimana of this.settimane()) {
      for (const cella of settimana) {
        if (cella.nelMese && this.nelFinestra(cella.iso)) {
          return cella.iso;
        }
      }
    }
    return `${this.mese()}-01`;
  }

  protected vaiMese(delta: number): void {
    if (delta < 0 && !this.puoIndietro()) return;
    if (delta > 0 && !this.puoAvanti()) return;
    this.cambiaMese.emit(spostaMese(this.mese(), delta));
  }

  protected chiusoBloccato(iso: string): boolean {
    return this.chiuso(iso) && !this.chiusiSelezionabili();
  }

  protected onClick(iso: string): void {
    if (this.selezionabileGiorno(iso) && !this.chiusoBloccato(iso)) {
      this.isoFocale.set(iso);
      this.selezionaData.emit(iso);
    }
  }

  protected onKeydown(event: KeyboardEvent, iso: string): void {
    let candidato: string | null = null;
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onClick(iso);
        return;
      case 'ArrowLeft':
        candidato = aggiungiGiorni(iso, -1);
        break;
      case 'ArrowRight':
        candidato = aggiungiGiorni(iso, 1);
        break;
      case 'ArrowUp':
        candidato = aggiungiGiorni(iso, -7);
        break;
      case 'ArrowDown':
        candidato = aggiungiGiorni(iso, 7);
        break;
      case 'Home':
        candidato = aggiungiGiorni(iso, -offsetLunedi(iso));
        break;
      case 'End':
        candidato = aggiungiGiorni(iso, 6 - offsetLunedi(iso));
        break;
      case 'PageUp':
        event.preventDefault();
        this.vaiMese(-1);
        return;
      case 'PageDown':
        event.preventDefault();
        this.vaiMese(1);
        return;
      default:
        return;
    }

    event.preventDefault();
    if (!candidato || !this.nelFinestra(candidato)) {
      return;
    }
    this.isoFocale.set(candidato);
    if (meseDi(candidato) !== this.mese()) {
      this.cambiaMese.emit(meseDi(candidato));
    }
  }
}
