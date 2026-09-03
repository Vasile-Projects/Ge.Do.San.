export function etaAllaData(dataNascitaIso: string, dataRiferimentoIso: string): number {
  const [ny, nm, nd] = dataNascitaIso.split('-').map(Number);
  const [ry, rm, rd] = dataRiferimentoIso.split('-').map(Number);
  let eta = ry - ny;
  if (rm < nm || (rm === nm && rd < nd)) {
    eta--;
  }
  return eta;
}

export function haEtaMinima(
  dataNascitaIso: string,
  dataDonazioneIso: string,
  minimo = 18,
): boolean {
  return etaAllaData(dataNascitaIso, dataDonazioneIso) >= minimo;
}
