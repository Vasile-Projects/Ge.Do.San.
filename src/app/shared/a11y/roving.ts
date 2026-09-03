export function indiceDaTasto(
  corrente: number,
  totale: number,
  key: string,
  perRiga = 1,
): number | null {
  if (totale <= 0) {
    return null;
  }
  const clamp = (i: number) => Math.max(0, Math.min(totale - 1, i));
  switch (key) {
    case 'ArrowRight':
      return perRiga > 1 ? clamp(corrente + 1) : (corrente + 1) % totale;
    case 'ArrowLeft':
      return perRiga > 1 ? clamp(corrente - 1) : (corrente - 1 + totale) % totale;
    case 'ArrowDown':
      return perRiga > 1 ? clamp(corrente + perRiga) : (corrente + 1) % totale;
    case 'ArrowUp':
      return perRiga > 1 ? clamp(corrente - perRiga) : (corrente - 1 + totale) % totale;
    case 'Home':
      return 0;
    case 'End':
      return totale - 1;
    default:
      return null;
  }
}
