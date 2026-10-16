# Gedosan

Frontend del portale di prenotazione per la donazione di sangue di due centri
trasfusionali. SPA Angular 21 (standalone, signals), che
consuma un backend Spring Boot 4 / MySQL separato.

## Cosa fa

- **`/`** — home pubblica: presentazione dei centri con mappe Google, requisiti di
  idoneità, call to action.
- **`/prenota`** — flusso di prenotazione: scelta centro → giorno → orario → dati del
  donatore, con validazione lato client speculare alle regole del backend e verifica
  anti-bot (Cloudflare Turnstile). L'invio crea una richiesta: il donatore riceve per
  email il link per confermarla entro 30 minuti.
- **`/conferma`** — pagina aperta dal link dell'email. La prenotazione si conferma solo
  premendo il pulsante (mai al caricamento: client di posta e antivirus aprono da soli i
  link); il token viene tolto subito dalla barra degli indirizzi.
- **`/admin`** — area riservata (login JWT): gestione prenotazioni per giorno,
  aperture straordinarie, log delle modifiche, export PDF, ricerca e scheda dei
  donatori con modifica dell'anagrafica.

## Stack

- Angular 21 standalone, `signal()` / `input()` / `output()`, `inject()`
- Routing con due domini lazy (`public` e `admin`)
- TypeScript strict (`strict`, `strictTemplates`)
- CSS vanilla con design token in `src/styles.css`
- Test con Vitest

## Requisiti

- Node 22+
- Backend attivo (vedi `Gedosan-API`)

## Configurazione

Due valori dipendono dalla modalità (`isDevMode()`), senza file di ambiente:

| Valore | `ng serve` | Build di produzione |
|---|---|---|
| URL dell'API (`core/http/api.config.ts`) | `http://localhost:8080/api` | `https://gedosanapi.vszdev.it/api` |
| Site Key Turnstile (`core/config/turnstile.config.ts`) | chiave di test di Cloudflare, passa sempre | chiave del widget per `gedosan.vszdev.it` |

La Site Key è pubblica per definizione; la Secret Key corrispondente sta solo nel backend.

## Comandi

```bash
npm install
npm start            # sviluppo su http://localhost:4200 (backend locale)
npm run build        # build di produzione in dist/Gedosan/browser
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
