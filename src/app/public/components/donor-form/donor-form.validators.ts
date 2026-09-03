import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Sesso } from '../../../shared/models';
import {
  codiceFiscaleCoerente,
  etaAllaData,
  validaFormatoCodiceFiscale,
} from '../../../shared/validation';
import { oggiIso } from '../../../shared/date';

export function codiceFiscaleFormatoValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  return validaFormatoCodiceFiscale(v) ? null : { codiceFiscaleFormato: true };
}

export function codiceFiscaleCoerenzaValidator(control: AbstractControl): ValidationErrors | null {
  const cf: string = control.value ?? '';
  const gruppo = control.parent;
  if (!cf || !gruppo) return null;
  const dataNascita: string = gruppo.get('dataNascita')?.value ?? '';
  const sesso = (gruppo.get('sesso')?.value ?? '') as Sesso | '';
  if (!dataNascita || !sesso) return null;
  if (!validaFormatoCodiceFiscale(cf)) return null;
  return codiceFiscaleCoerente(cf, dataNascita, sesso) ? null : { codiceFiscaleCoerenza: true };
}

export function dataNascitaPassataValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  return v < oggiIso() ? null : { dataNonPassata: true };
}

export function etaMinimaValidator(
  dataDonazione: () => string | null,
  minimo: number,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nascita: string = control.value ?? '';
    const donazione = dataDonazione();
    if (!nascita || !donazione) return null;
    return etaAllaData(nascita, donazione) >= minimo ? null : { etaMinima: { minimo } };
  };
}

export function cellulareValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  return /^[0-9]{9,10}$/.test(v) ? null : { cellulareFormato: true };
}
