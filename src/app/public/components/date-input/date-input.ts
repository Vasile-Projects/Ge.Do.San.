import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { isoDa } from '../../../shared/date';

@Component({
  selector: 'app-date-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-input.html',
  styleUrl: './date-input.css',
  host: {
    tabindex: '-1',
    '(focus)': 'portaFocus()',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DateInput), multi: true },
  ],
})
export class DateInput implements ControlValueAccessor {
  readonly invalido = input(false);
  readonly erroreId = input<string | null>(null);

  private readonly primoInput = viewChild.required<ElementRef<HTMLInputElement>>('giornoEl');

  protected readonly mesi: readonly string[] = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];

  protected readonly giorno = signal('');
  protected readonly mese = signal('');
  protected readonly anno = signal('');
  protected readonly disabilitato = signal(false);

  private alCambio: (valore: string) => void = () => {};
  private alTocco: () => void = () => {};
  private alCambioValidazione: () => void = () => {};

  writeValue(valore: string | null): void {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valore ?? '');
    this.anno.set(m ? m[1] : '');
    this.mese.set(m ? String(Number(m[2])) : '');
    this.giorno.set(m ? String(Number(m[3])) : '');
  }

  registerOnChange(fn: (valore: string) => void): void {
    this.alCambio = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.alTocco = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.alCambioValidazione = fn;
  }

  setDisabledState(disabilitato: boolean): void {
    this.disabilitato.set(disabilitato);
  }

  validate(): ValidationErrors | null {
    if (!this.giorno() && !this.mese() && !this.anno()) {
      return { required: true };
    }
    return this.iso() ? null : { dataNonValida: true };
  }

  protected onCifre(campo: 'giorno' | 'anno', evento: Event): void {
    const grezzo = (evento.target as HTMLInputElement).value.replace(/\D/g, '');
    const max = campo === 'giorno' ? 2 : 4;
    (campo === 'giorno' ? this.giorno : this.anno).set(grezzo.slice(0, max));
    this.propaga();
  }

  protected onMese(evento: Event): void {
    this.mese.set((evento.target as HTMLSelectElement).value);
    this.propaga();
  }

  protected onBlur(): void {
    this.alTocco();
  }

  protected portaFocus(): void {
    this.primoInput().nativeElement.focus();
  }

  private propaga(): void {
    this.alCambio(this.iso());
    this.alCambioValidazione();
  }

  private iso(): string {
    const g = Number(this.giorno());
    const m = Number(this.mese());
    const a = Number(this.anno());
    if (!g || !m || !a || this.anno().length !== 4) {
      return '';
    }
    const d = new Date(a, m - 1, g);
    if (d.getFullYear() !== a || d.getMonth() !== m - 1 || d.getDate() !== g) {
      return '';
    }
    return isoDa(a, m, g);
  }
}
