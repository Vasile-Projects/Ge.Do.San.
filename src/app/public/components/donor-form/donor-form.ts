import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../shared/ui';
import { DateInput } from '../date-input/date-input';
import { DatiDonatore, REGOLE_BUSINESS, Sesso } from '../../../shared/models';
import { normalizzaCodiceFiscale } from '../../../shared/validation';
import {
  cellulareValidator,
  codiceFiscaleCoerenzaValidator,
  codiceFiscaleFormatoValidator,
  cognomeCoerenzaCodiceFiscaleValidator,
  dataNascitaPassataValidator,
  etaMassimaValidator,
  etaMinimaValidator,
  nomeCoerenzaCodiceFiscaleValidator,
  nomeCognomePatternValidator,
  normalizzaNomeCognome,
} from './donor-form.validators';

export type ErroriServer = Readonly<Record<string, string>>;

const MESSAGGI: Readonly<Record<string, string>> = {
  required: 'Campo obbligatorio.',
  email: 'Inserisci un indirizzo email valido.',
  maxlength: 'Valore troppo lungo.',
  dataNonValida: 'Inserisci una data di nascita valida (giorno, mese e anno).',
  dataNonPassata: 'La data di nascita deve essere nel passato.',
  etaMinima: `Devi avere almeno ${REGOLE_BUSINESS.etaMinima} anni alla data della donazione.`,
  etaMassima: `Superata l'età massima di ${REGOLE_BUSINESS.etaMassima} anni per prenotare online. Contatta il trasfusionale per valutare l'idoneità.`,
  nomeCognomeFormato:
    'Inseriscilo come sulla tessera sanitaria: solo lettere, spazi, apostrofi, punti e trattini.',
  nomeCoerenza:
    'Il nome non corrisponde al codice fiscale: inseriscilo per intero, come sulla tessera sanitaria.',
  cognomeCoerenza:
    'Il cognome non corrisponde al codice fiscale: inseriscilo come sulla tessera sanitaria.',
  codiceFiscaleFormato: 'Codice fiscale non valido.',
  codiceFiscaleCoerenza:
    'Il codice fiscale non è coerente con la data di nascita e/o il sesso dichiarati.',
  cellulareFormato: 'Inserisci un numero di cellulare italiano valido (9 o 10 cifre).',
};

@Component({
  selector: 'app-donor-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Button, DateInput],
  templateUrl: './donor-form.html',
  styleUrl: './donor-form.css',
})
export class DonorForm {
  private readonly fb = inject(FormBuilder);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly dataDonazione = input<string | null>(null);
  readonly inCorso = input(false);
  readonly puoInviare = input(true);
  readonly erroriServer = input<ErroriServer | null>(null);

  readonly invia = output<DatiDonatore>();

  protected readonly sessi: readonly Sesso[] = ['M', 'F'];

  protected readonly form = this.fb.nonNullable.group({
    nome: [
      '',
      [
        Validators.required,
        Validators.maxLength(60),
        nomeCognomePatternValidator,
        nomeCoerenzaCodiceFiscaleValidator,
      ],
    ],
    cognome: [
      '',
      [
        Validators.required,
        Validators.maxLength(120),
        nomeCognomePatternValidator,
        cognomeCoerenzaCodiceFiscaleValidator,
      ],
    ],
    dataNascita: [
      '',
      [
        dataNascitaPassataValidator,
        etaMinimaValidator(() => this.dataDonazione(), REGOLE_BUSINESS.etaMinima),
        etaMassimaValidator(() => this.dataDonazione(), REGOLE_BUSINESS.etaMassima),
      ],
    ],
    sesso: this.fb.nonNullable.control<Sesso | ''>('', [Validators.required]),
    codiceFiscale: [
      '',
      [
        Validators.required,
        Validators.maxLength(16),
        codiceFiscaleFormatoValidator,
        codiceFiscaleCoerenzaValidator,
      ],
    ],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    cellulare: ['', [Validators.required, cellulareValidator]],
  });

  constructor() {
    effect(() => {
      this.dataDonazione();
      this.form.controls.dataNascita.updateValueAndValidity({ emitEvent: false });
    });

    const rivalidaCf = () =>
      this.form.controls.codiceFiscale.updateValueAndValidity({ emitEvent: false });
    this.form.controls.dataNascita.valueChanges.pipe(takeUntilDestroyed()).subscribe(rivalidaCf);
    this.form.controls.sesso.valueChanges.pipe(takeUntilDestroyed()).subscribe(rivalidaCf);

    const rivalidaNomeCognome = () => {
      this.form.controls.nome.updateValueAndValidity({ emitEvent: false });
      this.form.controls.cognome.updateValueAndValidity({ emitEvent: false });
    };
    this.form.controls.codiceFiscale.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(rivalidaNomeCognome);

    effect(() => {
      const errori = this.erroriServer() ?? {};
      for (const nome of Object.keys(this.form.controls)) {
        const control = this.form.get(nome);
        if (!control) continue;
        const messaggio = errori[nome];
        const { server: _s, ...resto } = control.errors ?? {};
        if (messaggio) {
          control.setErrors({ ...resto, server: messaggio });
          control.markAsTouched();
        } else if (_s !== undefined) {
          control.setErrors(Object.keys(resto).length ? resto : null);
        }
      }
    });
  }

  protected onCodiceFiscaleInput(evento: Event): void {
    const el = evento.target as HTMLInputElement;
    const grezzo = el.value;
    const normalizzato = grezzo.toUpperCase().replace(/\s+/g, '');
    if (normalizzato === grezzo) {
      return;
    }
    const prima = grezzo.slice(0, el.selectionStart ?? grezzo.length);
    const cursore = prima.toUpperCase().replace(/\s+/g, '').length;
    this.form.controls.codiceFiscale.setValue(normalizzato);
    el.value = normalizzato;
    el.setSelectionRange(cursore, cursore);
  }

  protected onCellulareInput(evento: Event): void {
    const el = evento.target as HTMLInputElement;
    let cifre = el.value.replace(/\D/g, '');
    if (cifre.startsWith('0039')) {
      cifre = cifre.slice(4);
    } else if (cifre.startsWith('39') && cifre.length > 10) {
      cifre = cifre.slice(2);
    }
    cifre = cifre.slice(0, 10);
    if (cifre === el.value) {
      return;
    }
    this.form.controls.cellulare.setValue(cifre);
    el.value = cifre;
    el.setSelectionRange(cifre.length, cifre.length);
  }

  protected messaggio(campo: string): string | null {
    const control = this.form.get(campo);
    if (!control || !(control.touched || control.dirty) || !control.errors) {
      return null;
    }
    const errori = control.errors;
    if (errori['server']) {
      return errori['server'] as string;
    }
    const chiave = Object.keys(errori)[0];
    return MESSAGGI[chiave] ?? 'Valore non valido.';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => {
        this.host.nativeElement
          .querySelector<HTMLElement>('.ng-invalid[formControlName], [formControlName].ng-invalid')
          ?.focus();
      });
      return;
    }

    const v = this.form.getRawValue();
    this.invia.emit({
      nome: normalizzaNomeCognome(v.nome),
      cognome: normalizzaNomeCognome(v.cognome),
      dataNascita: v.dataNascita,
      sesso: v.sesso as Sesso,
      codiceFiscale: normalizzaCodiceFiscale(v.codiceFiscale),
      email: v.email.trim(),
      cellulare: `+39${v.cellulare}`,
    });
  }
}
