import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NormalizedHttpError } from '../../../core/http';
import { DonatoreAdmin, DonatoreDettaglio, Sesso } from '../../../shared/models';
import { Button, ErrorState, Icon, Loading } from '../../../shared/ui';
import { RequestState, requestError, requestSuccess } from '../../../shared/state';
import {
  formattaDataCompatta,
  formattaDataOraCompatta,
  formattaOrario,
} from '../../../shared/date';
import { normalizzaCodiceFiscale } from '../../../shared/validation';
import { formattaTelefono } from '../../../shared/format/telefono';
import { MESSAGGI } from '../../../public/components/donor-form/donor-form';
import { DateInput } from '../../../public/components/date-input/date-input';
import {
  cellulareValidator,
  codiceFiscaleCoerenzaValidator,
  codiceFiscaleFormatoValidator,
  cognomeCoerenzaCodiceFiscaleValidator,
  dataNascitaPassataValidator,
  nomeCoerenzaCodiceFiscaleValidator,
  nomeCognomePatternValidator,
  normalizzaNomeCognome,
} from '../../../public/components/donor-form/donor-form.validators';
import { DonatoriAdminService } from '../../data/donatori-admin.service';

const ETICHETTE_CAMPI: Readonly<Record<string, string>> = {
  nome: 'nome',
  cognome: 'cognome',
  dataNascita: 'data di nascita',
  sesso: 'sesso',
  codiceFiscale: 'codice fiscale',
  email: 'email',
  cellulare: 'cellulare',
};

/**
 * Scheda del donatore: anagrafica, storico prenotazioni e modifiche. La modifica invia sempre
 * l'anagrafica completa, con gli stessi controlli di coerenza col codice fiscale del modulo pubblico.
 */
@Component({
  selector: 'app-admin-donatore-dettaglio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Button, Icon, Loading, ErrorState, DateInput],
  templateUrl: './donatore-dettaglio.html',
  styleUrl: './donatore-dettaglio.css',
})
export class DonatoreDettaglioPage {
  private readonly service = inject(DonatoriAdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly stato = signal<RequestState<DonatoreDettaglio>>({ status: 'loading' });
  protected readonly inModifica = signal(false);
  protected readonly salvataggio = signal(false);
  protected readonly erroreSalvataggio = signal<string | null>(null);
  protected readonly esito = signal<string | null>(null);

  protected readonly sessi: readonly Sesso[] = ['M', 'F'];
  protected readonly data = formattaDataCompatta;
  protected readonly dataOra = formattaDataOraCompatta;
  protected readonly orario = formattaOrario;
  // Il cellulare è salvato come +39XXXXXXXXXX: il formattatore lavora sul numero nazionale.
  protected readonly telefono = (cellulare: string) =>
    `+39 ${formattaTelefono(cellulare.replace(/^\+39/, ''))}`;

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
    dataNascita: ['', [dataNascitaPassataValidator]],
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
    const rivalidaCf = () =>
      this.form.controls.codiceFiscale.updateValueAndValidity({ emitEvent: false });
    this.form.controls.dataNascita.valueChanges.pipe(takeUntilDestroyed()).subscribe(rivalidaCf);
    this.form.controls.sesso.valueChanges.pipe(takeUntilDestroyed()).subscribe(rivalidaCf);
    this.form.controls.codiceFiscale.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.controls.nome.updateValueAndValidity({ emitEvent: false });
      this.form.controls.cognome.updateValueAndValidity({ emitEvent: false });
    });

    this.carica();
  }

  protected carica(): void {
    this.stato.set({ status: 'loading' });
    this.service
      .dettaglio(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d) => this.stato.set(requestSuccess(d)),
        error: (e: NormalizedHttpError) => this.stato.set(requestError(e)),
      });
  }

  protected campi(elenco: string): string {
    return elenco
      .split(',')
      .map((c) => ETICHETTE_CAMPI[c] ?? c)
      .join(', ');
  }

  protected apriModifica(d: DonatoreAdmin): void {
    this.form.reset({
      nome: d.nome,
      cognome: d.cognome,
      dataNascita: d.dataNascita,
      sesso: d.sesso,
      codiceFiscale: d.codiceFiscale,
      email: d.email,
      cellulare: d.cellulare.replace(/^\+39/, ''),
    });
    this.erroreSalvataggio.set(null);
    this.esito.set(null);
    this.inModifica.set(true);
  }

  protected annullaModifica(): void {
    this.inModifica.set(false);
    this.erroreSalvataggio.set(null);
  }

  protected messaggio(campo: string): string | null {
    const c = this.form.get(campo);
    if (!c || !c.errors || !(c.touched || c.dirty)) return null;
    if (c.errors['server']) return c.errors['server'] as string;
    const chiave = Object.keys(c.errors)[0];
    return MESSAGGI[chiave] ?? 'Valore non valido.';
  }

  protected onCodiceFiscaleInput(evento: Event): void {
    const el = evento.target as HTMLInputElement;
    this.form.controls.codiceFiscale.setValue(normalizzaCodiceFiscale(el.value));
  }

  protected salva(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.salvataggio.set(true);
    this.erroreSalvataggio.set(null);

    this.service
      .modifica(this.id, {
        nome: normalizzaNomeCognome(v.nome),
        cognome: normalizzaNomeCognome(v.cognome),
        dataNascita: v.dataNascita,
        sesso: v.sesso as Sesso,
        codiceFiscale: normalizzaCodiceFiscale(v.codiceFiscale),
        email: v.email.trim(),
        cellulare: `+39${v.cellulare}`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.salvataggio.set(false);
          this.inModifica.set(false);
          this.esito.set('Anagrafica aggiornata.');
          this.carica();
        },
        error: (e: NormalizedHttpError) => {
          this.salvataggio.set(false);
          for (const ev of e.erroriValidazione ?? []) {
            this.form.get(ev.campo)?.setErrors({ server: ev.messaggio });
            this.form.get(ev.campo)?.markAsTouched();
          }
          this.erroreSalvataggio.set(e.message);
        },
      });
  }
}
