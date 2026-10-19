---
name: Ge.Do.San.
description: Portale di prenotazione delle donazioni di sangue ai centri Pertini e Sant'Eugenio di Roma.
colors:
  red: '#b0001c'
  red-dark: '#8c0016'
  red-on-dark: '#ff8a93'
  ink: '#221a1c'
  ink-soft: '#5d5355'
  paper: '#ffffff'
  bg: '#f5efed'
  blush: '#f6dfe0'
  border: '#e4d9d7'
  plasma: '#e3bd62'
  platelets: '#f1e6cf'
  choice-tint: '#fdf2f3'
typography:
  mega:
    fontFamily: 'Archivo, Arial Narrow, system-ui, sans-serif'
    fontSize: 'clamp(4rem, 13vw, 9.5rem)'
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: '-0.02em'
  statement:
    fontFamily: 'Archivo, Arial Narrow, system-ui, sans-serif'
    fontSize: 'clamp(2.5rem, 7vw, 6rem)'
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: '-0.015em'
  h2:
    fontFamily: 'Archivo, Arial Narrow, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 4.6vw, 3.5rem)'
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: '-0.01em'
  heading:
    fontFamily: 'Archivo, Arial Narrow, system-ui, sans-serif'
    fontSize: '1.375rem'
    fontWeight: 800
    lineHeight: 1.05
  body:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.55
  lead:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '1.1875rem'
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: 'Archivo, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
rounded:
  input: '4px'
  button: '4px'
  card: '6px'
  pill: '999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '20px'
  '6': '24px'
  '8': '32px'
  '12': '48px'
  '16': '64px'
  '24': '96px'
  '30': '120px'
components:
  button-primary:
    backgroundColor: '{colors.red}'
    textColor: '{colors.paper}'
    rounded: '{rounded.button}'
    height: '48px'
    padding: '12px 22px'
  button-primary-hover:
    backgroundColor: '{colors.red-dark}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.button}'
    height: '48px'
  button-secondary-hover:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
  button-invert:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.red}'
    rounded: '{rounded.button}'
  button-outline-light:
    backgroundColor: 'transparent'
    textColor: '{colors.paper}'
    rounded: '{rounded.button}'
  label-card:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.card}'
  hero:
    backgroundColor: '{colors.red}'
    textColor: '{colors.paper}'
  closing-band:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
---

# Ge.Do.San. — Design system

I token vivono in `src/styles.css`, che è la fonte di verità. Questo file spiega come usarli.

## Overview

Il mondo visivo è **l'etichetta della sacca di sangue**: campi stampati separati da filetti, bordi
pieni color inchiostro, un carattere condensato da segnaletica ospedaliera, dati reali (ml,
giorni, gruppi sanguigni) trattati come grafica. Il rosso è grande e pieno dove serve a dire
"sangue" (l'hero) e piccolo dove serve a dire "agisci" (pulsanti, link). Il resto è carta e
inchiostro.

La pagina deve sembrare stampata e informativa, non un template SaaS: niente card tutte uguali,
niente sfumature, niente decorazioni senza contenuto. Ogni elemento grafico porta un dato vero.

## Colors

- **Rosso sangue** `--c-red` `#b0001c`: azioni primarie, link, fondo dell'hero, numeri in evidenza.
  Hover e pressione con `--c-red-dark`. Sui fondi scuri, per piccole icone, `--c-red-on-dark`.
- **Inchiostro** `--c-ink` `#221a1c`: testo, bordi pieni delle etichette, fondo della chiusura e
  del footer. È anche il colore della **selezione nei controlli di confronto** (`--c-select`), come
  il gruppo scelto nella compatibilità, dove il rosso indica già l'esito.
- **Scelte nei flussi di prenotazione** `--c-choice` (rosso) con `--c-choice-tint` `#fdf2f3`:
  centro, giorno, orario e opzioni del form scelti. Le caselle piccole (giorno, orario, M/F) si
  riempiono di rosso; i riquadri grandi (centro) prendono bordo rosso, fondo rosato e spunta.
- **Inchiostro tenue** `--c-ink-soft`: testo secondario.
- **Carta** `--c-paper`: fondo della pagina e delle etichette.
- **Fondo tenue** `--c-bg` `#f5efed`: sezioni alternate e riquadri di appoggio.
- **Blush** `--c-blush`: la banda Telegram e i messaggi informativi.
- **Filetti** `--c-border`: separatori sottili dentro le etichette e tra le righe.
- **Plasma e piastrine** (`#e3bd62`, `#f1e6cf`): solo nell'etichetta della sacca, perché sono i
  colori reali delle componenti. Non vanno usati come accento altrove.

Non esistono altri colori d'accento. Il vecchio oro è stato eliminato.

Sulle superfici scure si mette la classe `.on-dark`: testo, titoli e anello di focus diventano
bianchi. Il testo secondario su scuro usa `--c-on-dark-muted`, i filetti `--c-on-dark-line`.

## Typography

Un'unica famiglia variabile, **Archivo** (Google Fonts, assi `wdth` 62–125 e `wght` 400–900). La
gerarchia la fa la **larghezza**: condensata per i titoli, normale per il testo.

| Ruolo                 | Classe / regola | Larghezza | Peso |
| --------------------- | --------------- | --------- | ---- |
| Titolo dell'hero      | `.t-mega`       | 68%       | 900  |
| Frase guida, chiusura | `.t-statement`  | 68%       | 900  |
| Titolo di sezione     | `.t-h2`         | 72%       | 900  |
| Titoli h1–h6 di base  | regola globale  | 80%       | 800  |
| Testo introduttivo    | `.t-lead`       | 100%      | 400  |
| Testo                 | `body`          | 100%      | 400  |

- I titoli condensati sono l'elemento grafico principale: grandi, stretti, interlinea sotto 1.
- Una pagina ha al massimo un `.t-mega` e un paio di `.t-statement`.
- Testo corrente entro 65–75 caratteri (`max-width` in `rem` o `ch`).
- Numeri in colonna o confrontabili con `font-variant-numeric: tabular-nums`.
- Niente maiuscoletto spaziato, niente etichette sopra i titoli, niente parola singola colorata nel titolo.

## Layout

- Contenitore `.container`, larghezza massima 1280px, margini laterali `--gutter` (16 → 32 → 40px).
- Sezioni `.section` con `--section-y` (72px, 120px da 900px in su). Le sezioni si alternano tra
  carta e `--c-bg` invece di essere separate da bordi.
- Le griglie a due colonne passano a una colonna sotto i 900–1000px. Nessuno scroll orizzontale.
- Le liste di elementi equivalenti (centri, requisiti) sono **righe separate da filetti** con un
  filetto pieno da 3px in testa, come una tabella stampata, non griglie di card.
- Allineamento a sinistra ovunque. Niente centrato salvo i singoli valori dentro le celle.

## Elevation & Depth

La pagina è piatta. L'unica ombra è `--shadow-lift`, riservata all'etichetta che sta sopra l'hero
rosso (sulla quale si aggiunge una leggera rotazione da 1,2° su desktop, come un'etichetta
appoggiata). Il pulsante flottante dell'assistente ha un'ombra propria, morbida e spostata in basso.

Profondità e raggruppamento si ottengono con bordi pieni, filetti e cambi di fondo.

## Shapes

- Raggi piccoli: 4px per pulsanti e campi, 6px per etichette e riquadri. Il cerchio solo per il
  pulsante flottante.
- Bordi pieni da 2px color inchiostro per ciò che è "un'etichetta" (riepiloghi, requisiti,
  conferme, pulsanti dei gruppi). Filetti da 1px `--c-border` per le divisioni interne.
- **Vietate** le barre colorate laterali (`border-left` o `border-top` colorati oltre 1px) su card,
  avvisi e riquadri.

## Components

- **Button** (`app-button`): varianti `primary` (rosso), `secondary` (contorno inchiostro),
  `ghost`, `invert` (bianco su rosso), `outline-light` (contorno bianco su scuro). Taglie `sm` (42px),
  `md` (48px, predefinita), `lg` (54px). Testo in grassetto, senza frecce accodate.
- **Etichetta della sacca** (`app-bag-label`): testata con filetto pieno, valore grande condensato,
  barra di separazione delle componenti, elenco con campione di colore. È il modello per ogni
  "etichetta" del sito: testata, campi, filetti.
- **Compatibilità gruppi** (`app-blood-compat`): pulsanti a riquadro con bordo inchiostro;
  selezionato = fondo inchiostro; esito = fondo rosso. `aria-pressed` sui pulsanti e risultato in
  `aria-live`.
- **Riga centro** (`app-center-card`): nome condensato grande, dati con icone rosse, azioni
  `secondary` + `primary` in taglia `sm`.
- **Requisiti** (`app-eligibility`): griglia di campi dentro un bordo pieno; elenco numerato solo
  perché è una sequenza nel tempo.
- **Assistente virtuale Telegram** (`app-telegram-assistant`): pulsante tondo inchiostro, hover rosso. Si
  ritira quando è visibile un elemento con l'attributo `data-nasconde-assistente` (banda Telegram,
  chiusura, footer), così non copre azioni equivalenti.
- **Pagine operative** (prenotazione): fascia rossa bassa in testa con titolo condensato
  (2–2.75rem, non `.t-mega`), eventuale avviso a tutta larghezza su blush attaccato sotto, poi il
  contenuto su carta. Toni sobri: titoli dei passi a 1.25rem, numeri dei passi in cerchi rossi da
  28px, bordi sottili `--c-border`, il colore solo sulle scelte. Riepilogo laterale con testata su
  blush; su mobile diventa una barra fissa in basso con il passo corrente.
- **Campi del form**: bordo 1px `--c-ink-soft`, altezza 46px, errore con bordo rosso da 2px e
  messaggio rosso in grassetto sotto il campo. Data di nascita in tre campi (GG / Mese / AAAA),
  cellulare con prefisso +39 fisso.
- **Header**: bianco, fisso in alto, logo + un solo pulsante. **Footer**: inchiostro, colonne con
  titoli bianchi, icone telefono `--c-red-on-dark`.

### Movimento

Un solo momento animato per pagina. In home è la barra della sacca che si separa nelle componenti.
Curva `--ease` (esponenziale in uscita), durate 200–1100ms. Tutto è disattivato con
`prefers-reduced-motion`.

### Stati

- Focus: anello da 3px `--c-focus-ring` (rosso su chiaro, bianco su scuro), sempre visibile da tastiera.
- Selezione del testo: rosso con testo bianco.
- Disabilitato: opacità 0,55 e cursore `not-allowed`.

## Do's and Don'ts

**Sì**

- Usare dati reali come grafica: millilitri, giorni, gruppi, orari.
- Tenere il rosso pieno per l'hero e le azioni; l'inchiostro per selezioni e strutture.
- Comporre con filetti, bordi pieni e cambi di fondo.
- Scrivere testi diretti in seconda persona; i pulsanti dicono cosa fanno ("Prenota ora").

**No**

- Card tutte uguali con icona + titolo + testo come struttura della pagina.
- Barre colorate laterali, sfumature, testo sfumato, vetro e blur decorativi.
- Un terzo colore d'accento (niente oro, niente blu).
- Etichette in maiuscolo sopra i titoli, numerazioni 01/02/03 su contenuti che non sono sequenze.
- Frecce "→" in coda a link e pulsanti.
- Più di un'animazione d'ingresso per pagina.
