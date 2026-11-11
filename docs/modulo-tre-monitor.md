# MODULO STRUTTURA UNIVERSALE A TRE MONITOR — istruzione TBH-WEB

**Approvato da Claudio Ugolini il 15/09/2026.**
Questo modulo si **AGGIUNGE** alle istruzioni TBH-WEB già approvate
(`docs/regole-ferree.md`, `docs/palinsesto-master.md`, `docs/master-list.md`,
`docs/capitan-touch-specifica.md`, `docs/piano-ampliamento-ecosistema.md`):
**non sostituisce e non cancella nulla di quanto già stabilito.**
In caso di conflitto valgono comunque le regole ferree (niente contenuti inventati,
niente pulsanti morti, niente doppioni, niente zoom, loghi mai tagliati).

---

## 1. STRUTTURA UNIVERSALE A TRE MONITOR

Ogni pagina interna è **«homepage di se stessa»** e contiene:

- logo / stemma / immagine ufficiale;
- titolo e categoria;
- selettore di periodo, stagione o raccolta;
- **tre monitor coordinati**;
- sponsor, pulsanti attivi, correlati e archivio.

I tre monitor **cambiano funzione in base al tipo di pagina**.
**Non si creano tre pagine**: esiste **un solo record** e i contenuti si collegano
tramite **ID** (`match_id`, `release_id`, `entity_id`, id evento / uscita / attività).

## 2. SQUADRE E CAMPIONATI

Tre filtri di periodo, uguali per Verucchio, Victoria 1968 e ogni altra società:

| Filtro | Significato |
| --- | --- |
| **ATTUALI** | nuovo campionato dal **30/08/2026**, stagione **2026/2027** |
| **RECENTI 2026** | amichevoli, preparazione e contenuti **precedenti al 30/08/2026** |
| **ARCHIVIO** | stagioni **2025/2026**, **2024/2025** e precedenti |

Per ogni partita, collegata da un **`match_id`**:

- **MONITOR 1 — PARTITA INTEGRALE**: video completo, data, avversario, competizione,
  giornata, risultato, sponsor;
- **MONITOR 2 — HIGHLIGHTS**: sintesi della **stessa** partita, durata, azioni principali.
  Etichetta aggiornata il 29/09/2026 su ordine di Claudio: a schermo si legge
  **HIGHLIGHTS**; il ruolo tecnico interno resta `sintesi` perché è agganciato al
  riconoscimento dei titoli del canale del media partner;
- **MONITOR 3 — INTERVISTE FINE GARA**: allenatore, giocatori, protagonisti della **stessa** partita.

Se un video manca: **anteprima + «In pubblicazione»**, la pagina non si blocca.
**Frecce** partita precedente / successiva.
Desktop: tre monitor affiancati. Mobile: verticali.

## 3. MUSICA

Per ogni uscita un **`release_id`** e tre monitor:

1. **BRANO INTEGRALE** — audio o esecuzione completa;
2. **VIDEOCLIP MUSICALE** — video ufficiale;
3. **BACKSTAGE** — studio, interviste, dietro le quinte.

Più copertina ufficiale, artista, titolo, data, etichetta, sponsor e pulsanti
**Ascolta / Guarda / Acquista**. **ON AIR solo durante una diretta vera.**

## 4. AZIENDE E ATTIVITÀ

Per ogni attività un **`entity_id`** e tre aree:

1. **FOTOGALLERY** — immagini reali;
2. **VIDEO PROMO** — spot o presentazione;
3. **PRENOTA ORA / RICHIEDI PREVENTIVO** — calendario o modulo con WhatsApp, telefono, email.

Più logo ufficiale, categoria, indirizzo, Maps, orari, servizi, offerte, sponsor, sito esterno.
Se manca la foto: **icona di categoria + «Contenuto in allestimento»**.
**Vietati loghi inventati e riquadri grigi.**

## 5. COMPONENTE DINAMICO «TripleMonitor»

Un **unico** componente configurabile (`components/triple-monitor.tsx`):

| tipo | monitor 1 | monitor 2 | monitor 3 |
| --- | --- | --- | --- |
| sport | integrale | highlights (ruolo tecnico `sintesi`) | interviste |
| musica | brano | videoclip | backstage |
| azienda | fotogallery | video promo | prenotazione |
| corso | presentazione | programma | iscriviti |
| prodotto | gallery | video dimostrativo | acquista |
| servizio | descrizione | esempio | richiedi |
| evento | anteprima | diretta o replay | biglietti |

Homepage, menu, ricerca e caroselli **richiamano lo stesso record originale. Nessun doppione.**

## 6. TOUCH PLAZA E STRIPE — prima in TEST MODE

Stripe in **test mode** per: prodotti fisici/digitali, corsi e iscrizioni, servizi,
acconti e saldi, prenotazioni, attività e prodotti dei negozi, abbonamenti/Fidelity previsti.

Ogni elemento vendibile porta: `product_id` interno, `stripe_product_id`, `stripe_price_id`,
nome, categoria, prezzo pieno, prezzo promozionale, IVA, disponibilità, immagine, venditore,
commissione TBH, stato, URL checkout.

Pulsanti ammessi: **ACQUISTA ORA · ISCRIVITI · PRENOTA · PAGA ACCONTO · SALDA · RICHIEDI PREVENTIVO**.

**Nessuna chiave Stripe nel frontend.** Checkout Session creata **lato server**, con
`success_url`, `cancel_url` e **webhook verificati** per pagamento completato, fallito, rimborsato.

Dopo il pagamento: ordine/protocollo, registrazione cliente-prodotto-importo, conferma,
aggiornamento disponibilità e stato, avviso amministrazione TBH, ricevuta/fattura se configurata.

Venditori esterni: **Stripe Connect solo in test**, commissione TBH configurabile.
**Nessun pagamento live senza approvazione e verifica account.**

## 7. PANNELLO AMMINISTRATIVO

Deve permettere di: scegliere il modello TripleMonitor; collegare contenuti allo stesso ID;
gestire Attuali / Recenti / Archivio; ordinare caroselli e sponsor; configurare prezzi Stripe;
attivare-disattivare il checkout; controllare ordini, prenotazioni, iscrizioni e rimborsi.

## 8. VERIFICA

Da testare e riportare: partita Verucchio dal 30/08/2026; partita archiviata; contenuto
Victoria 1968; brano musicale; attività con prenotazione; prodotto, corso, servizio;
checkout Stripe test riuscito e annullato.
**Consegna: anteprima navigabile + risultati dei test. Nessuna pubblicazione live senza approvazione.**

---

## NOTE DI ATTUAZIONE (stato reale, aggiornato 15/09/2026)

- I filtri **ATTUALI / RECENTI 2026 / ARCHIVIO** sono attivi. La classificazione di un
  contenuto avviene **solo** con una data confermata: i video del canale DM Comunicazioni
  non portano la data nel titolo, quindi finché DM non fornisce le date restano in
  **ARCHIVIO — data da confermare** e ATTUALI dichiara «nessun contenuto pubblicato».
  **Non viene assegnata nessuna data per somiglianza.**
- Il `match_id` viene costruito dal titolo ufficiale del video (squadra + avversario +
  risultato dichiarato dal titolo). Dove il titolo non nomina l'avversario, il contenuto
  resta in un gruppo «senza partita collegata», non viene abbinato a caso.
- Stripe: chiave **non ancora fornita**. `checkout.status` espone `configured:false` e
  la UI mostra il percorso WhatsApp. Il codice è pronto per la **test mode**: appena arriva
  `sk_test_...` il checkout si accende senza altre modifiche.

---

## MONTAGGIO SUL SITO — verificato il 15/09/2026

Il componente unico è `packages/web/src/web/components/triple-monitor.tsx`.
Due montature lo usano:

- `tre-monitor-partite.tsx` — pagine società (`/sport/squadre/:slug`): selettore dei tre
  periodi collegato ai conteggi reali, titoli-pulsante di ogni partita, frecce PREC./SUCC.,
  elenco a parte dei contenuti della società non abbinati a una partita.
- `tre-monitor-serie.tsx` — serie senza periodi: usato su `/musica` per le 40 uscite reali
  del canale Touch Music Radio TV (un record per `release_id`).

Pagina attività (`/e/:slug`): `TripleMonitor` montato direttamente, un record per
`entity_id`, monitor 1 fotogallery, 2 video promo, 3 PRENOTA ORA / RICHIEDI PREVENTIVO.
Il terzo monitor è dichiarato `azione: true`: non è un video che manca, quindi non
mostra «in pubblicazione» ma i pulsanti reali.

Test eseguiti (Chrome, 1440px e 390px), nessun errore JavaScript:

| Verifica | Esito |
|---|---|
| Verucchio — 13 partite, un record per `match_id` | ok, `verucchio__casa__civitella__0-2` come primo record |
| Victoria 1968 | ok, 4 partite |
| Bellaria Igea Marina 1956 | ok, 16 partite |
| Vis Novafeltria / Pietracuta / San Marino / Tropical / Gabicce | ok (15 / 17 / 21 / 10 / 2) |
| Società senza video del canale (es. Rimini) | il modulo non compare, la pagina resta intera |
| Titoli cliccabili + frecce PREC./SUCC. | ok, il record cambia senza cambiare pagina |
| Monitor con video → player reale | ok, iframe YouTube acceso al click |
| Monitor senza video | «monitor ancora spento» + «in pubblicazione» + SEGNALA |
| Fascia ATTUALI vuota | messaggio dichiarato, nessun record finto |
| Mobile 390px | i tre monitor in verticale, nell'ordine 1-2-3 |
| Musica — 40 uscite | ok, `hugo-release-1…40`, videoclip e backstage dichiarati |
| Attività — A.C. San Marino Calcio | ok, prenotazione e preventivo attivi via WhatsApp |

Restano da fare: corsi, prodotti, servizi ed eventi sullo stesso componente; pannello
amministrativo del modulo; Stripe in test mode (manca `sk_test_...`); date ufficiali delle
partite per popolare ATTUALI e RECENTI 2026.

---

## Secondo livello: contenuto temporaneo dei monitor liberi (16/09/2026)

Specifica di Claudio, punti 1–4 e 10: «nessun monitor deve apparire morto». Ogni monitor
ha due livelli — il **contenuto principale** (ufficiale) e il **contenuto temporaneo**
(pubblicità, promo TBH, partner del canale) che riempie il vetro finché il principale non
arriva. La sostituzione avviene dentro la stessa pagina: l'URL non cambia mai.

**Pezzi del modulo**

| File | Ruolo |
|---|---|
| `src/api/data/campagne-monitor.ts` | tipi, etichette ammesse e 7 promo TBH di riserva (solo pagine e immagini reali del portale) |
| `src/api/routes/campagne.ts` | `campagne.perSpazio` (selezione per tema/spazio/dispositivo/date/priorità), `campagne.traccia`, `campagneAdmin.*` (CRUD protetto dal codice di allestimento), `registraEventoMonitor` per il beacon |
| `src/api/index.ts` | `POST /api/monitor/evento` — endpoint `navigator.sendBeacon` per i click che portano fuori dalla pagina |
| `src/web/components/spazio-pubblicitario.tsx` | `SpazioPubblicitario` (vetro 16:9), `StrisciaCampagna` (striscia sotto i monitor), `useCampagneSpazio` |
| `src/web/components/triple-monitor.tsx` | innesto: monitor libero → spazio temporaneo; contenuto ufficiale presente → campagna in striscia sotto i tre monitor |
| `src/web/pages/pannello-monitor.tsx` | pannello `/allestimento/monitor`: campagne, viste e click, promo di riserva |
| Tabelle | `monitor_campagne` (campagne del pannello), `monitor_eventi` (viste e click reali) |

**Regole rispettate**

- etichetta sempre visibile sulla creatività: `SPAZIO PUBBLICITARIO`, `PROMO TBH`,
  `PARTNER DEL CANALE`; sopra la pubblicità non compare mai «in allestimento», la nota
  discreta sta sotto il vetro: «Contenuto ufficiale del canale in preparazione.»;
- video MP4/WebM: autoplay muto, loop, `playsinline`, senza controlli, in pausa quando
  esce dallo schermo, poster di riserva se il file non parte; YouTube/Vimeo via embed;
- rotazione a tempo (10–20 s, impostabile per campagna) solo per le immagini: un video va
  lasciato finire; ordine per priorità, finestra `dal`/`al`, frequenza massima per sessione;
- monitor interamente cliccabile, link interno o esterno; viste e click sono righe vere in
  `monitor_eventi`, nessun numero stimato;
- gerarchia: quando arriva il contenuto ufficiale la campagna **non si cancella**, scende
  nella striscia sotto i tre monitor e continua a girare;
- nessuno sponsor inventato: le promo di riserva sono solo del gruppo TBH e puntano a
  pagine reali del portale; i partner veri li inserisce Claudio dal pannello.

**Verifiche eseguite (Chrome vero, 16/09/2026)** — `scripts/verifica-pannello-monitor.py`,
`scripts/verifica-rotazione-monitor.py`, `scripts/verifica-adv.py`, `bunx tsc --noEmit` pulito:

| Verifica | Esito |
|---|---|
| `/allestimento/monitor` con codice di allestimento | pannello aperto, tre schede, cartellini di stato reali |
| Creazione campagna dal form | riga salvata, visibile in tabella e in onda sul monitor libero |
| Rotazione multi-campagna (2 campagne, 10 s) | campagne alternate nello stesso monitor (`data-campagna-titolo` cambia) |
| Eliminazione dal pannello | campagna e suoi eventi rimossi, il monitor torna alla promo di riserva |
| Vista reale | righe in `monitor_eventi` con spazio (`verucchio__casa__civitella__0-2:2`) e dispositivo |
| Click reale con navigazione | registrato via `sendBeacon` e arrivo su `/tv-streaming-adv` |
| Mobile 390px (Verucchio, Musica) | spazio pubblicitario leggibile nel vetro, nessun errore JS |
| Lazy loading | le immagini delle campagne partono a 0 e caricano entrando nello schermo |

**Resta da fare su questo modulo**: caricamento dei file di campagna dall'archivio del
sito (oggi si incolla l'URL), campagne per corsi/prodotti/eventi, e i punti 5–9 della
specifica (homepage, loghi ufficiali, filtri periodo su DM/Sport, performance, correzioni
obbligatorie).
