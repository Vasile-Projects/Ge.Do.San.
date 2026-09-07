import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Sesso } from '../../../shared/models';
import {
  codiceFiscaleCoerente,
  codiceFiscaleCoerenteConCognome,
  codiceFiscaleCoerenteConNome,
  etaAllaData,
  validaFormatoCodiceFiscale,
} from '../../../shared/validation';
import { oggiIso } from '../../../shared/date';

// Speculare al @Pattern del backend su nome/cognome:
// prima lettera, poi lettere (accentate/non latine), spazi, apostrofi (dritto e tipografico),
// punti e trattini. Il valore viene normalizzato (trim + collasso spazi) prima del confronto.
const NOME_COGNOME = /^\p{L}[\p{L} '.’-]*$/u;

export function normalizzaNomeCognome(valore: string): string {
  return valore.trim().replace(/\s{2,}/g, ' ');
}

export function nomeCognomePatternValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v.trim()) return null;
  return NOME_COGNOME.test(normalizzaNomeCognome(v)) ? null : { nomeCognomeFormato: true };
}

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

// Coerenza CF ↔ cognome/nome: come il backend, l'errore va sul campo cognome/nome,
// non sul codice fiscale.
export function cognomeCoerenzaCodiceFiscaleValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const cognome: string = control.value ?? '';
  const gruppo = control.parent;
  if (!cognome.trim() || !gruppo) return null;
  const cf: string = gruppo.get('codiceFiscale')?.value ?? '';
  if (!cf) return null;
  return codiceFiscaleCoerenteConCognome(cf, cognome) ? null : { cognomeCoerenza: true };
}

export function nomeCoerenzaCodiceFiscaleValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const nome: string = control.value ?? '';
  const gruppo = control.parent;
  if (!nome.trim() || !gruppo) return null;
  const cf: string = gruppo.get('codiceFiscale')?.value ?? '';
  if (!cf) return null;
  return codiceFiscaleCoerenteConNome(cf, nome) ? null : { nomeCoerenza: true };
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

// Speculare a `eta > etaMassima` del backend: l'età (compiuta) alla data della donazione
// non può superare il massimo. Il massimo esatto è ammesso.
export function etaMassimaValidator(
  dataDonazione: () => string | null,
  massimo: number,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nascita: string = control.value ?? '';
    const donazione = dataDonazione();
    if (!nascita || !donazione) return null;
    return etaAllaData(nascita, donazione) <= massimo ? null : { etaMassima: { massimo } };
  };
}

export function cellulareValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  return /^[0-9]{9,10}$/.test(v) ? null : { cellulareFormato: true };
}
