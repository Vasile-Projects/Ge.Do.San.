export function formattaTelefono(grezzo: string): string {
  const cifre = grezzo.replace(/\D/g, '');
  if (cifre.length < 6 || cifre.length > 11) return grezzo;

  const lunghezzaPrefisso = cifre.startsWith('02') || cifre.startsWith('06') ? 2 : 3;
  const prefisso = cifre.slice(0, lunghezzaPrefisso);
  const resto = cifre.slice(lunghezzaPrefisso);

  const gruppi =
    resto.length === 8
      ? [resto.slice(0, 4), resto.slice(4)]
      : resto.length === 7 || resto.length === 6
        ? [resto.slice(0, 3), resto.slice(3)]
        : (resto.match(/.{1,3}/g) ?? [resto]);

  return [prefisso, ...gruppi].join(' ');
}
