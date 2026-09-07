// Speculare a `prenotazioni.*` di application.properties del backend (Gedosan-API).
export const REGOLE_BUSINESS = {
  postiPerSlot: 2,
  etaMinima: 18,
  etaMassima: 65,
  intervalloGiorniUomini: 90,
  distanzaMinimaDonneGiorni: 90,
  finestraLimiteDonneGiorni: 365,
  maxDonazioniDonnePerFinestra: 2,
  orizzontePrenotazioneGiorni: 365,
  anticipoMinimoMinuti: 90,
} as const;
