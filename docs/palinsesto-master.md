# PALINSESTO TBH-WEB — tabella canali e navigazione a zapping

Stato: **fase 1 completata** (turno 30 · 05/09/2026).
Verifica automatica: `python3 scripts/verifica-palinsesto.py` → **351/351 controlli superati**.
`bun run lint` → 0 errori. `bun run build` → OK.

## Idea

Il sito funziona come una televisione: un contenitore generale con **canali numerati**,
ognuno con numero, nome, funzione, categoria, badge, stato e **programmazione propria**.
Il canale **0** è la HOME (guida generale), il canale **99** è l'area istituzionale TBH / CEO.
Lo **zapping** (CANALE − / CANALE +) è ciclico e sempre disponibile.

## Regola madre rispettata

> «Una pagina può essere promossa ovunque, ma deve esistere una sola volta.» (punto 43)

Nessuna pagina nuova di contenuto è stata creata: ogni voce di programmazione punta a una
rotta **già esistente**. Nessuna voce di menù è stata rimossa (il punto 44 — potatura dei
duplicati — **non è stato eseguito**: serve un ordine esplicito di Claudio).

## Tabella canali (0–22 + 99)

| # | Nome | Categoria | Pagina canonica | Colore |
|---|---|---|---|---|
| 0 | TBH-WEB | Home | `/` | `#d7ff00` |
| 1 | TOUCH BUSINESS HOLDING | Business | `/tbh/pagine` | `#d7ff00` |
| 2 | SOCIETÀ TBH | Business | `/tbh/societa` | `#d7ff00` |
| 3 | TBH SERVICES | Servizi | `/tbh/servizi` | `#e2c37a` |
| 4 | TOUCH PAY · TOUCH FINANCE | Finanza | `/pagamenti` | `#33e0ff` |
| 5 | CIRCUITO TBH | Network | `/network/circuito` | `#d7ff00` |
| 6 | TERRITORIO TBH | Territorio | `/territorio/mappa` | `#33e0ff` |
| 7 | DM COMUNICAZIONI | Media partner | `/dm` | `#ff2b2b` |
| 8 | TOUCH MEDIA | Media | `/media` | `#9dff3c` |
| 9 | TOUCH PRODUCTION | Produzioni | `/tbh/produzioni` | `#ff5bb0` |
| 10 | HUGOLAND | Entertainment | `/hugoland` | `#33e0ff` |
| 11 | TOUCH SPORTS | Sport | `/sport` | `#2f7bff` |
| 12 | MOTORSPORT | Sport | `/sport/motorsport` | `#2f7bff` |
| 13 | TOUCH HIGH VISIBILITY SCOUT | Visibilità | `/hvs` | `#d7ff00` |
| 14 | TOUCH HOST | Hospitality | `/hospitality` | `#33e0ff` |
| 15 | TOUCH JOBS | Lavoro | `/lavoro-casting` | `#e2c37a` |
| 16 | TOUCH CASTING | Casting | `/lavoro-casting/bacheca` | `#e2c37a` |
| 17 | TOUCH SOCIAL | Social | `/contatti-social` | `#ff3df0` |
| 18 | TOUCH SHOP | Shop | `/shop` | `#ff8a00` |
| 19 | VETRINA | Vetrina | `/network` | `#d7ff00` |
| 20 | TOUCH FASHION | Fashion | `/fashion` | `#ff3df0` |
| 21 | GUADAGNA CON NOI | Referral | `/servizi-referral` | `#e2c37a` |
| 22 | CONTATTI | Contatti | `/contatti` | `#d7ff00` |
| 99 | TBH / CEO | Istituzionale | `/ceo` | `#e2c37a` |

I numeri **23–98** sono liberi: stato `SPAZIO LIBERO`. `/canale/77` (o qualsiasi numero non
assegnato) mostra «CANALE NON ASSEGNATO» con il rimando alla guida.

## Badge (punti 7-8)

Essere su TBH-WEB non significa appartenere a TBH. Badge disponibili:
`TBH`, `CIRCUITO TBH`, `CLIENTE`, `PARTNER`, `SPONSOR`, `FRIEND`, `TERRITORIO`,
`EDITORIALE`, `ATTIVITÀ`, `ESTERNO`.
DM Comunicazioni (canale 7) è marcato `PARTNER` + `ESTERNO`, **mai** `TBH`.

## Stati (punto 36)

`ATTIVO`, `IN ALLESTIMENTO`, `LINK MANCANTE`, `URL MANCANTE`, `LOGO MANCANTE`,
`IMMAGINE MANCANTE`, `CONTENUTO MANCANTE`, `NASCOSTO`, `SOSPESO`, `SPAZIO LIBERO`.
**Se manca un logo non viene inventato**: ogni canale ha lo slot di allestimento
`canale-N:materiali` (modo `loghi`, 4 colonne) da riempire dal pannello `/allestimento`.
Slot vuoto = blocco non visibile.

## Livelli di esposizione (punti 24-28)

`NORMALE`, `EVIDENZA`, `ALTA VISIBILITÀ`, `PREMIUM`, `APPUNTAMENTO FISSO`, `SPONSOR`,
`PRIORITARIO`. In fase 1 il livello è un **dato**: la rotazione pubblicitaria vera arriva in
fase 2.

## File

| File | Contenuto |
|---|---|
| `packages/web/src/web/lib/palinsesto.ts` | tabella canali, tipi, funzioni di zapping |
| `packages/web/src/web/components/zapping.tsx` | `BarraZapping`, `PulsanteCanale`, `CarrellataCanali`, `SchedaContenuto` |
| `packages/web/src/web/pages/guida-canali.tsx` | rotta `/guida` — guida generale del palinsesto |
| `packages/web/src/web/pages/canale.tsx` | rotta `/canale/:numero` — mini-homepage del canale |
| `scripts/verifica-palinsesto.py` | verifica automatica (351 controlli) |

Modificati: `app.tsx` (rotte `/guida`, `/canale/0` → redirect home, `/canale/:numero`),
`components/layout.tsx` (voce di menù «Guida canali · Palinsesto» + `<BarraZapping />`),
`pages/index.tsx` (`<CarrellataCanali />` dopo la hero).

API di `lib/palinsesto.ts`: `canalePerNumero`, `canaleDiPercorso`, `canaleSuccessivo`,
`canalePrecedente`, `percorsoCanale` (0 → `/`, altrimenti `/canale/N`), `CANALI`,
`NUMERI_CANALE`, `CONTENUTI_IN_HOME`.

## Decisioni prese (da confermare con Claudio)

1. **TOUCH PAY e TOUCH FINANCE uniti nel canale 4**: puntano alla stessa pagina canonica
   `/pagamenti` (`/touch-pay` e `/finanziamenti` sono già redirect). Tenerli separati avrebbe
   creato il doppione vietato dal punto 43. → domanda 117.
2. **Slogan**: il punto 41 del documento indica «MORE THAN A NETWORK.», ma dal turno 26 quel
   testo è nella lista dei testi vietati in `lib/identita-tbh.ts` e il payoff ufficiale è
   **«VISIBILITÀ SENZA CONFINI»**. **Non è stato cambiato nulla.** → domanda 116.
3. **Punto 44 non eseguito**: nessun menù e nessuna pagina eliminati. → domanda 118.
4. **Barra zapping** in basso a sinistra (per non coprire il badge Runable a destra),
   nascosta sotto i 640px. → domanda 119.
5. Le ripetizioni volute (stessa URL promossa su più canali): `/cremona-circuit-2026` su 12 e
   15, `/crew-academy` su 13 e 16, `/servizi-referral` su 4 e 21.

## Bug trovati dalla verifica e corretti

1. `canaleDiPercorso` non riconosceva `/canale/N`: sulla pagina di un canale la barra diceva
   «Sei sul canale 0». Corretto con match diretto `/^\/canale\/(\d+)$/`.
2. Aria-label ambigui fra la barra del layout e quella interna alla pagina di canale:
   aggiunti `data-zap="prec|succ"` e `data-zap-barra="prec|corrente|succ"`.

## Cosa copre la verifica (351 controlli)

`/guida` con 23 pulsanti-canale e blocco «in primo piano»; homepage con carrellata e blocco
storico «Un sito, tante homepage» non perso; barra zapping montata e coerente col canale
corrente; per ogni canale titolo, barra ±, programmazione non vuota e tutta interna, link alla
pagina canonica, precedente/successivo corretti; zapping **ciclico** (99 → `/`, 1 → `/`);
`/canale/0` reindirizza alla home; numero non assegnato gestito; **88 destinazioni della
programmazione verificate una per una** (nessuna cade sulla pagina di cortesia); nessun `<a>`
senza href; console senza errori. Desktop 1440×950 e mobile 420×900.

## Fasi successive

- **Fase 2** — motore di rotazione e pubblicità (punti 24-28): tabella campagne in
  `api/database/schema.ts` (priorità, peso, date, impression min/max, territorio, categoria,
  sponsor, livello) + route + pannello. Coincide con la fase E del restyling.
- **Fase 3** — programmazione fissa giorno/ora (punto 25), footer generato dalla stessa
  struttura dati (punto 38), header compatto con canale ± (punto 37), SEO/canonical/Open Graph
  per canale (punto 42), censimento URL + redirect (punto 45).
- **Fase 4** — potatura dei menù e delle pagine duplicate (punto 44), **solo su ordine
  esplicito**.
