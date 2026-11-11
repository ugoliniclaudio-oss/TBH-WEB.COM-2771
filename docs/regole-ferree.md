# REGOLE FERREE — TBH-WEB

Documento di servizio. Va letto PRIMA di toccare il sito, a ogni turno.

---

## 0. BOZZA E RITORNO INDIETRO (ordine di Claudio del 05/09/2026)

Questa regola nasce da un problema concreto: **l'anteprima non si comporta come il sito
pubblicato**, e ogni errore dell'agente costa crediti a Claudio. Quindi:

1. **Punto di ritorno obbligatorio.** Prima di ogni modifica strutturale si crea uno snapshot
   della versione funzionante, chiamato **«un passo indietro»**, in
   `/home/user/backup-tbh-web/`. Si crea PRIMA di toccare i file, non dopo.
2. **Le rifacimenti si propongono come BOZZA, non si applicano.** La bozza si chiama
   **«Check web»** e vive su una rotta separata (`/check-web`). La versione attuale del sito
   **non si tocca** finché Claudio non ha visto la bozza e ha detto di sì.
3. **Se la bozza non va bene si torna indietro**, ripristinando lo snapshot più recente.
4. Nessun rifacimento della homepage, del menu o del footer «al volo» direttamente in
   produzione. Mai più.

Snapshot esistenti: vedi `/home/user/backup-tbh-web/`.
Ripristino: `bash /home/user/backup-tbh-web/ripristina.sh <nome-file.tar.gz>`

---

## 1. Contenuti

- **Niente dati inventati.** Nessun contatto, prezzo, sconto, percentuale, classifica, risultato
  sportivo, data, URL, social, codice fiscale o P.IVA che non sia verificato. Dove manca:
  «da verificare», «da definire», `null`, oppure il campo non si mostra.
- **Dove il contenuto vero non c'è si scrive «In allestimento».** Non si riempie con link
  ripetuti, blocchi doppi o testo di circostanza. È peggio del vuoto.
- **Niente testi legali scritti dall'agente** (privacy, cookie, termini): li fornisce Claudio.
- **Niente foto finte, niente stock, niente loghi ricreati con l'IA.** Se manca il logo, non si
  inventa: si lascia lo slot del pannello di allestimento.
- **Niente badge App Store / Google Play** finché non esiste un'app pubblicata.
- **Compenso e condizioni economiche non compaiono negli annunci di lavoro.**

## 2. Struttura

- **Si aggiorna, non si sostituisce. Nessuna destinazione del menu deve andare persa.**
- **Una pagina può essere promossa ovunque, ma deve esistere una sola volta.** I doppioni di
  navigazione (stessi link ripetuti in più blocchi) sono un difetto, non ricchezza.
- **Proporzioni.** Gli spazi li decide l'agente e devono essere proporzionati: una homepage non
  è un elenco infinito. Riferimento misurato il 05/09/2026: la home era arrivata a **23.274 px,
  24,5 schermate, 29 sezioni, 722 link**. Fuori scala.
- **Nessun bottone morto**: ogni CTA apre qualcosa. Dove manca l'URL, etichetta non cliccabile.

## 3. Verifica

- Un HTTP 200 non prova niente: si verifica il **DOM renderizzato**, la **console senza errori**
  e, per le immagini, `naturalWidth > 0`.
- Ogni lavoro ha il suo script in `scripts/verifica-*.py` e si riporta il punteggio reale.
- Prima di creare un file in `pages/` si fa `ls`. **Non esiste git**: una sovrascrittura è
  irreversibile.
- Dopo ogni modifica critica si rilegge il file: una `edit` può rispondere «fatto» senza aver
  scritto.
- Regressione obbligatoria quando si toccano `layout.tsx`, `index.tsx` o `app.tsx`.

## 3-bis. Contenuti nuovi — catena obbligatoria

**SORGENTE → PRE-ALLESTIMENTO → CONTROLLO → PUBBLICAZIONE.**

- Ogni materiale nuovo (URL, sito, logo, immagine, video, documento) entra dal **Content Hub**
  (`/allestimento/hub`) e diventa **un solo record canonico**, riusabile su home, canale e
  vetrina. Non si duplica il contenuto per farlo comparire in più posti.
- **Niente pubblicazione automatica.** Un record nasce sempre in **bozza**: diventa visibile
  solo quando qualcuno lo porta a «attivo» a mano, dopo l'anteprima.
- Gli indirizzi ammessi sono solo `https://` o interni `/…`. `http://` si rifiuta: finirebbe
  bloccato dal browser, cioè un bottone morto.

## 4. Pubblicazione

- **L'agente non pubblica.** Il deploy lo fa Claudio dal pannello, **meglio dal computer che
  dall'iPhone**. Va ricordato a ogni consegna, una volta sola e con garbo.

## 5. Identità

- Il sito si chiama **TBH-WEB** (`tbh-web.com`). «TiBiHacca» è bocciato come nome del sito
  (05/09/2026). Unica eccezione: le email `@tibihacca.com`, che sono recapiti reali.
- Sorgente unica del nome: `lib/identita-tbh.ts` (`NOME_SITO`, `DOMINIO_SITO`, `URL_SITO`).
- **DM Comunicazioni è media partner autonomo, NON società del gruppo TBH.**

## 6. Loghi e stemmi — misura standard (regola tecnica, 06/09/2026)

Nasce da un difetto misurato sulla home: `verucchio-1957.png` (nativo 1024x1536) veniva
reso **260x390 e 377x565 dentro riquadri da 192 px**, e `overflow-hidden` ne ritagliava la
fascia centrale. Non era «piccolo»: era **tagliato**. Sulla stessa pagina si contavano
**17 altezze renderizzate diverse**.

- **Il riquadro decide la misura, mai l'immagine.**
- **Mai `max-h-full` / `h-full` su un logo dentro un contenitore `grid place-items-center`**:
  le percentuali di altezza non si risolvono (verificato a video: non basta nemmeno
  `self-stretch`, ne' forzare `height:100%` inline) e l'immagine torna alla misura naturale.
- **Ricetta unica, misurata e valida per quadrati e rettangoli**: contenitore `relative`
  + immagine `absolute inset-0 h-full w-full object-contain`, con l'aria data dal
  **padding dell'immagine** (`box-sizing:border-box`).
- **Mai `object-cover` su un logo o uno stemma**: taglierebbe il marchio. `object-cover`
  e' ammesso solo su foto e video di scena.
- `loading="eager"` sui loghi: sono file piccoli e a lazy-load si misuravano `0x0`
  (era il caso di `rimini.png`), facendo ballare il layout.
- Componente di riferimento: `components/tessera-logo.tsx`
  (`RiquadroLogo`, `TesseraLogo`, `FilaTessere`, tre sole misure: `sm` / `md` / `lg`).
- Verifica: `python3 scripts/verifica-anteprime.py` (101/101 al 06/09/2026).

---

## §7 — MODULO TRE MONITOR (aggiunta del 15/09/2026)

Il modulo «STRUTTURA UNIVERSALE A TRE MONITOR» approvato da Claudio il 15/09/2026 sta in
**`docs/modulo-tre-monitor.md`** e vale come istruzione permanente **in aggiunta** a tutto
quanto già approvato: ogni pagina interna è «homepage di se stessa» (logo ufficiale, titolo,
categoria, selettore di periodo, TRE monitor coordinati, sponsor, pulsanti attivi, correlati,
archivio), un solo record collegato per ID (`match_id`, `release_id`, `entity_id`), mai tre
pagine separate, mai doppioni. Componente unico: `components/triple-monitor.tsx`.
