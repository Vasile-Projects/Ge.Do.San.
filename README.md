# Gedosan

Frontend del portale di prenotazione per la donazione di sangue di due centri
trasfusionali. SPA Angular 21 (standalone, signals), che
consuma un backend Spring Boot 3 / MySQL separato.

## Cosa fa

- **`/`** — home pubblica: presentazione dei centri con mappe Google, requisiti di
  idoneità, call to action.
- **`/prenota`** — flusso di prenotazione: scelta centro → giorno → orario → dati del
  donatore, con validazione lato client speculare alle regole del backend.
- **`/admin`** — area riservata (login JWT): gestione prenotazioni per giorno,
  aperture straordinarie, log delle modifiche, export PDF.

## Stack

- Angular 21 standalone, `signal()` / `input()` / `output()`, `inject()`
- Routing con due domini lazy (`public` e `admin`)
- TypeScript strict (`strict`, `strictTemplates`)
- CSS vanilla con design token in `src/styles.css`
- Test con Vitest

## Requisiti

- Node 22+
- Backend attivo (vedi `Gedosan-API`)

## Comandi

```bash
npm install
npm start            
npm run build        browser
npm test             # test unitari (Vitest)
npx prettier --write .   # formattazione
```

## Struttura

```
src/app/
  core/http/      token API base URL, interceptor errori
  shared/         modelli API, UI riusabile, validazione, helper date/a11y
  public/         layout, pagine e componenti dell'area pubblica
  admin/          auth, guard, servizi dati e pagine della dashboard
```

Convenzioni: ogni componente è tre file (`.ts` / `.html` / `.css`), selettore con
prefisso `app-`, `ChangeDetectionStrategy.OnPush`. Dettagli in `CLAUDE.md`.

## Deploy

Immagine Docker multi-stage servita da nginx, CI/CD con GitHub Actions su runner
self-hosted. Vedi **`DEPLOY.md`**.
