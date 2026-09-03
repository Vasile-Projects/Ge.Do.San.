export interface CellaCalendario {
  readonly iso: string;
  readonly giorno: number;
  readonly nelMese: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function isoDa(anno: number, mese: number, giorno: number): string {
  return `${anno}-${pad(mese)}-${pad(giorno)}`;
}

export function oggiIso(): string {
  const d = new Date();
  return isoDa(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function meseCorrente(): string {
  return oggiIso().slice(0, 7);
}

export function meseDi(iso: string): string {
  return iso.slice(0, 7);
}

export function aggiungiGiorni(iso: string, giorni: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + giorni);
  return isoDa(base.getFullYear(), base.getMonth() + 1, base.getDate());
}

export function spostaMese(meseIso: string, delta: number): string {
  const [y, m] = meseIso.split('-').map(Number);
  const base = new Date(y, m - 1 + delta, 1);
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}`;
}

export function offsetLunedi(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

export function confrontaIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function nelRange(iso: string, minIso: string, maxIso: string): boolean {
  return iso >= minIso && iso <= maxIso;
}

const FMT_MESE = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });
const FMT_DATA_ESTESA = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function nomeMese(meseIso: string): string {
  const [y, m] = meseIso.split('-').map(Number);
  return FMT_MESE.format(new Date(y, m - 1, 1));
}

export function formattaDataEstesa(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const s = FMT_DATA_ESTESA.format(new Date(y, m - 1, d));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formattaOrario(orario: string): string {
  return orario.slice(0, 5);
}

export function formattaDataCompatta(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formattaDataOraCompatta(isoDateTime: string): string {
  const [data, ora = ''] = isoDateTime.split('T');
  return `${formattaDataCompatta(data)} ${ora.slice(0, 5)}`.trim();
}

export function grigliaMese(meseIso: string): CellaCalendario[][] {
  const [y, m] = meseIso.split('-').map(Number);
  const primo = new Date(y, m - 1, 1);
  const offsetLunedi = (primo.getDay() + 6) % 7;
  const inizio = new Date(y, m - 1, 1 - offsetLunedi);

  const settimane: CellaCalendario[][] = [];
  const cursore = new Date(inizio);
  for (let s = 0; s < 6; s++) {
    const settimana: CellaCalendario[] = [];
    for (let g = 0; g < 7; g++) {
      settimana.push({
        iso: isoDa(cursore.getFullYear(), cursore.getMonth() + 1, cursore.getDate()),
        giorno: cursore.getDate(),
        nelMese: cursore.getMonth() === m - 1,
      });
      cursore.setDate(cursore.getDate() + 1);
    }
    settimane.push(settimana);
  }
  return settimane;
}
