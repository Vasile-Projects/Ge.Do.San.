import { Sesso } from '../models';

const OMOCODIA_LETTERE_A_CIFRE: Record<string, string> = {
  L: '0',
  M: '1',
  N: '2',
  P: '3',
  Q: '4',
  R: '5',
  S: '6',
  T: '7',
  U: '8',
  V: '9',
};

const POSIZIONI_OMOCODIA = [6, 7, 9, 10, 12, 13, 14];

const MESI = 'ABCDEHLMPRST';

const VALORI_DISPARI: Record<string, number> = {
  '0': 1,
  '1': 0,
  '2': 5,
  '3': 7,
  '4': 9,
  '5': 13,
  '6': 15,
  '7': 17,
  '8': 19,
  '9': 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23,
};

const FORMATO =
  /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;

export function normalizzaCodiceFiscale(cf: string): string {
  return cf.trim().toUpperCase();
}

function valorePari(ch: string): number {
  return ch >= '0' && ch <= '9' ? ch.charCodeAt(0) - 48 : ch.charCodeAt(0) - 65;
}

function carattereControllo(primi15: string): string {
  let somma = 0;
  for (let i = 0; i < 15; i++) {
    const ch = primi15[i];
    somma += (i + 1) % 2 === 1 ? VALORI_DISPARI[ch] : valorePari(ch);
  }
  return String.fromCharCode(65 + (somma % 26));
}

function decodificaOmocodia(cf: string): string {
  const chars = cf.split('');
  for (const pos of POSIZIONI_OMOCODIA) {
    const ch = chars[pos];
    if (ch in OMOCODIA_LETTERE_A_CIFRE) {
      chars[pos] = OMOCODIA_LETTERE_A_CIFRE[ch];
    }
  }
  return chars.join('');
}

export function validaFormatoCodiceFiscale(cf: string): boolean {
  const norm = normalizzaCodiceFiscale(cf);
  if (!FORMATO.test(norm)) {
    return false;
  }
  return carattereControllo(norm.slice(0, 15)) === norm[15];
}

interface DatiDecodificati {
  readonly annoUltimeDueCifre: number;
  readonly mese: number;
  readonly giorno: number;
  readonly sesso: Sesso;
}

function decodifica(cf: string): DatiDecodificati | null {
  const norm = decodificaOmocodia(normalizzaCodiceFiscale(cf));
  const anno = Number(norm.slice(6, 8));
  const meseIdx = MESI.indexOf(norm[8]);
  let giorno = Number(norm.slice(9, 11));
  if (Number.isNaN(anno) || meseIdx < 0 || Number.isNaN(giorno)) {
    return null;
  }
  const sesso: Sesso = giorno > 40 ? 'F' : 'M';
  if (sesso === 'F') {
    giorno -= 40;
  }
  return { annoUltimeDueCifre: anno, mese: meseIdx + 1, giorno, sesso };
}

export function codiceFiscaleCoerente(cf: string, dataNascitaIso: string, sesso: Sesso): boolean {
  if (!validaFormatoCodiceFiscale(cf)) {
    return false;
  }
  const dec = decodifica(cf);
  if (!dec) {
    return false;
  }
  const [anno, mese, giorno] = dataNascitaIso.split('-').map(Number);
  if (!anno || !mese || !giorno) {
    return false;
  }
  return (
    dec.annoUltimeDueCifre === anno % 100 &&
    dec.mese === mese &&
    dec.giorno === giorno &&
    dec.sesso === sesso
  );
}
