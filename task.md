# Task — TOUCH RADIO / TOUCH TV (canali) · TOUCH MUSIC / DM ON AIR / DM HIGHLIGHTS (rubriche)

Regola: TBH = gruppo · TOUCH RADIO (audio) + TOUCH TV (video) = 2 canali · TOUCH MUSIC = rubrica.
Fase 1: 1 palinsesto condiviso, 2 player, 2 rendiconti. Fase 2: 2 calendari DB già pronti.

## Decisioni
- Loghi canali: NESSUN logo assegnato finché Claudio non approva → slot "IN ATTESA DI APPROVAZIONE".
  Anteprima candidati su /check-web/loghi-canali.
- Logo rubrica TOUCH MUSIC = allegato originale → public/brand/loghi/rubrica-touch-music.jpg.
- DM ON AIR / DM HIGHLIGHTS: logo IN ALLESTIMENTO (nessun file originale), appartenenza DM.
- DM HIGHLIGHTS: nessuna fascia nel palinsesto attuale → orari "da confermare"; contenuti = video reali dm-video.ts.
- Modalità palinsesto in tabella `settings` (key touch_palinsesto_modalita).
- Tabelle nuove: touch_palinsesto (slot per canale), touch_eventi (statistiche/spot per canale). db:push.
- Carosello SEGUI LA DIRETTA ORA: sulle pagine canale + in bozza su /check-web (layout live invariato).

## Stato
- [x] data/touch-canali.ts
- [x] rubrica sugli elementi scaletta
- [x] schema + db:push
- [x] lib/touch-canali.ts + routes/canali-touch.ts
- [x] web: queries, hook, player canale, sezione, scheda canale, carosello
- [x] pagine /radio /tv /rubriche /rubriche/:slug /allestimento/canali-touch /check-web/loghi-canali
- [x] verifiche + build + lint + deliver

## Fatto 15/10 (sessione 2)
- Rotte: /radio, /radio/palinsesto, /tv, /tv/palinsesto, /rubriche, /rubriche/:slug, /allestimento/canali-touch, /check-web/loghi-canali. pages/radio.tsx resta (non instradata).
- radio-sezione (/musica): H1 «TOUCH MUSIC» + «rubrica in onda su TOUCH RADIO e TOUCH TV»; DM Live → DM ON AIR; TV_RADIO.nome = TOUCH TV.
- check-web: voce unica → TOUCH RADIO / TOUCH TV / RUBRICHE. Mappa sito + pannello allestimento aggiornati.
- Verificato: Playwright desktop+390 senza overflow né errori; pannello sbloccato col codice; rendiconto TV registra avvii/passaggi.

## Annuncio «Lavora con noi · Selezioni 2026–2027» (15/10)
- slug selezioni-audiovisivo-2026-2027: bacheca-annunci.ts (in cima), annunci-lavoro.ts (modulo online, 4 ruoli), scheda components/annuncio-selezioni-audiovisivo.tsx.
- Locandina public/lavoro/selezioni-audiovisivo/locandina.jpg (originale convertita).
- Oggetto mail «CANDIDATURA AUDIOVISIVO TBH — [RUOLO]»; avviso modulo online include il ruolo (oggettoConRuolo).
- Da chiedere: nota locandina «inoltrate ad amministrazione@gmail.com» non riportata nel sito.

## Import 13 canali + archivio 73 (15/10)
- Asset: public/brand/archivio-73/ (73 file originali, max ~1,04 MB). Dati: src/web/lib/archivio-73.ts (ARCHIVIO_73, MONITOR_61_73).
- Anteprime: /check-web/canali-61-73, /check-web/archivio-73 (rotte in app.tsx, voci bozza in mappa-sito). Palinsesto/home/menu/loghi NON toccati.
- Esiti 13: pronti 061 062 066 067 069 070 071 · variante 063 (→Security) · bozza 064 068 073 · bloccati 065 (conflitto TOUCH RADIO) 072 (testo deformato).
- Destinazioni corrette: Spotlight → /tbh/p/touch-spotlight; TBH-003 Match Music → /anagrafica (MEDIA-RADIO-005; /master/match-music-tv non risolve, RADIO_MASTER fuori da schedaMaster).
- Verificato: 27 destinazioni aprono pagine reali; immagini 13/73 caricate, alt ok, nessun overflow 1366/390, 0 errori console; tsc/build ok, lint solo errore scansione noto.
- Da chiedere: approvazione integrazione in CANALI + loghi; 008 La Gemma, 019 Radio Touch, 031 touchpay.store, 040 Giovanile Rimini, 045 Beach vs Beach & Sea; touchmisscoolweb.com senza DNS.

## Home · TOUCH RADIO + TOUCH TV in primo piano (15/10) — SOLO ANTEPRIMA
- /check-web/home-canali (pages/check-web-home-canali.tsx): banner anteprima + components/canali-ufficiali-home.tsx (2 monitor indipendenti, ognuno col suo palinsesto; ASCOLTA RADIO/GUARDA TV, PALINSESTO 24/7, ORA IN ONDA, A SEGUIRE; striscia DIRETTE DM) + sezione artistica DJ J.C. Hugò (jc-hugo.png → /musica/jc-hugo) + <Index/> invariata sotto.
- CanalePlayer: prop `compatto` (schermo sopra/dati sotto). /radio e /tv invariati.
- Motore canali (api/lib/touch-canali.ts): con palinsesti separati le dirette DM restano su entrambi i canali (fuoriDalleDirette taglia gli spazi del canale). Testato.
- Loghi: TOUCH TV = /brand/loghi/touch-tv.png (solo in anteprima, CANALI_TOUCH.logo resta null). TOUCH RADIO: NESSUN originale «TOUCH RADIO» negli asset → slot dichiarato.
- Home vera / menu / AREE non toccati.

## Touch Plaza · 9 nuovi articoli Stripe Checkout (15/10)
- Record nel listino `api/data/catalog.ts` (PRODUCTS): tbh-sport-essential/-connect/-media-pro/-arena, now-gingerblast-500ml, now-polarberry-500ml, now-tropical-500ml, now-lime-peppermint-500ml, now-discovery-box (autonomo).
- Campi nuovi Product: status/visible/shop/checkoutProvider; vetrina filtra visible=false e status=draft (`inVetrina`). CampiCommerciali.notaPrezzo («+ IVA / anno») mostrato in card + PrezzoDettaglio.
- Categorie: «SERVIZI / SPORT», «PRODOTTI / FOOD & BEVERAGE / NOW». Nessuna promo attiva.
- Descrizioni = testo Stripe (pagina pubblica Payment Link) senza frase prezzo. Discovery Box: Stripe scrive «€16,00» nel testo ma incassa 32,00 € → segnalato.
- Immagini public/shop/touch-plaza-9/<slug>.jpg (~145 KB) = logo TBH orizzontale + sigillo Touch Plaza + QR; QR <slug>-qr.png generati dal link esatto (zbarimg ok). Originali Stripe dei QR NON ricevuti → da sostituire se arrivano.
- Tabella stripe_prodotti non usata: serve stripeProductId (nessuna chiave Stripe).
- Locandine TBH SPORT non usate: riportano PROMO PER TUTTI / FIDELITY TBH non attive.

### Verifica finale 9 articoli (15/10) — CHIUSA
- Schede 9/9 OK a 1366 e 390 px (browser nuovo per URL): h1, immagine, Acquista ora = link Stripe, QR = stesso link, prezzo, blurb ≤500, box Circuito, no promo, no overflow, zero errori console.
- Filtri: SERVIZI / SPORT = 4, PRODOTTI / FOOD & BEVERAGE / NOW = 5 (tab e ?categoria).
- tsc OK, build OK, lint solo scansione.ts (noto).

## 17/10 — RISPOSTE DI CLAUDIO APPLICATE (anteprima, non pubblicata)
- Rimini: «Lasciala com'è, solo il nastro cambia» → `VIDEO_DM_CONFERMATI=[]` (Rimini Channel di nuovo IN ALLESTIMENTO, 4 video da confermare, +h3nMOxelr3g). Nastro: Rimini resta ultimo.
- dm-video.ts: +18 inserimenti (Coriano 3, Novafeltria 2, Pietracuta 1, Verucchio 3, Victoria 3, San Marino 4, Bellaria 2), titoli nativi RSS/oEmbed, data solo da feed. Non abbinati: Bellariva vs S.Ermete, 2 interviste «post (J.)Gambettola» (Verucchio o Victoria?).
- dm-puntate.ts: + Anteprima SportUp 7a (sU-o9NBTvjk, 17/10) → 29 puntate. Junior Gambettola preview +2 video.
- Verifiche: tele/tele2/marq/squad OK, tsc/build OK, lint solo scansione.

## DM PUNTATE 2026-27 + RIMINI IN CODA AL TRENO (16/10) — ANTEPRIMA CONSEGNATA (non pubblicata)
- Nuovo `api/data/dm-puntate.ts`: 28 puntate reali (CdR 7+2 speciali agosto, TgSport 6, Il calcio D tutti 7, Anteprima SportUp 6) + «LIVE AMICHEVOLE VERUCCHIO VS Rimini». Titoli/ID/durate dalla scheda /streams del canale DM; date solo da RSS (5), altre null.
- `tbh.ts`: `ultimaPuntata` dei 4 programmi = `ultimaPuntataDa()` (prima solo Ft9hDwhjQUo) → cambia anche /dm e /dm/programmi (live, dati).
- `routes/telecomando.ts`: DM Channel 24h = DIRETTA agli orari ufficiali, REPLICA a rotazione (un programma per volta, partenza diversa ogni giorno) in tutto il resto; TOUCH TV `dm.tv` = 3 fasce 00/12/18 con le ultime puntate a turno. Monitor DM: regola, fasce del giorno (scroll alla fascia in onda), archivio puntate a schede.
- `stemmi-marquee.tsx`: Rimini entra nel nastro SEMPRE ultimo (live /sport/squadre e /sport/highlights-dm). Telecomando: `VIDEO_DM_CONFERMATI=["rimini"]` → Rimini Channel CONTENUTI DISPONIBILI (3 video). `sport.ts territorio:true` e pagina /sport/squadre/rimini NON toccati: da chiedere.
- Verifiche: tele.py/tele2.py 0 errori, marq.py (Rimini ultimo), tsc/build OK, lint solo scansione.
- Aperti: pagina Rimini live, video squadre post 30/09 dal feed RSS (Coriano, Russi-Novafeltria, Pietracuta, Verucchio-Victoria, San Marino, Bellariva) non ancora in dm-video.ts.

## TELECOMANDO MULTICANALE · 17 canali (16/10) — ANTEPRIMA CONSEGNATA (non pubblicata)
Spec: /home/user/Attachments/pasted-1_qy8gLG.txt
Inventario collaudato (Playwright, browser nuovo per URL, 1366+390): /tv /radio (player ok, cover suno 403), /dm (embed Ft9hDwhjQUo),
8 squadre DM ok (stemma+monitor), /sport/squadre/junior-gambettola = «Società non trovata», /sport/squadre/rimini = territorio (0 DM),
/lavoro-casting/bacheca ok, /shop ok, /sport/motorsport (nessun video/logo), /eventi/miss-cool ok (Fotomania assente).
Piano: anteprima su /check-web/home-canali (Telecomando al posto dei 2 monitor) + /check-web/canali/:slug (17 pagine-canale).
API nuova routes/telecomando.ts (data/telecomando.ts). Fasce DM 12/18/00 = REPLICA ultima puntata reale (solo anteprima, /tv invariato).
Loghi: candidati marcati «da approvare» (TBH-019 radio, TBH-070 lavoro, TBH-071 plaza, TBH-069 miss cool); Gambettola/Motorsport = LOGO IN ALLESTIMENTO.

FATTO (16/10): /check-web/telecomando (intestazione, 8 accessi → monitor, 17 schede con APRI CANALE, #squadre-dm) +
/check-web/canali/:slug (17 pagine, frecce prec/succ, pagina esistente, problemi). Link al telecomando in cima a /check-web/home-canali.
File: components/telecomando-pannello.tsx, components/telecomando-monitor.tsx, pages/check-web-telecomando.tsx,
pages/check-web-canale-telecomando.tsx, queries/telecomando.ts, routes in app.tsx. Home/menu/layout invariati.
Palinsesti: scaletta di oggi TV/Radio (musica · pubblicità · diretta DM; TV + 3 fasce replica DM che sostituiscono i passaggi).
Caroselli: rubriche Prodotti Touch Plaza / Corsi Touch Academy / Servizi ed eventi TBH (dalla categoria reale), 18 articoli con
immagine su 35 (17 senza immagine esclusi). Programmazione provvisoria ON AIR + sottofondo su canali IN ALLESTIMENTO
(Motorsport, Junior Gambettola, Rimini). Sottofondo verificato in riproduzione. Collaudo: 17/17 pagine 1366+390 ok, 0 errori console,
0 overflow, 0 immagini rotte. tsc ok, build ok, lint = solo scansione.ts.
APERTO: fonte repliche DM, Gambettola video+logo, Rimini 3 video, approvazione loghi candidati, logo Motorsport, Fotomania,
estratti audio radio autorizzati, cover Suno 403.

## 17/10 — LOGHI FONTI + PALINSESTI CANALI — ANTEPRIMA CONSEGNATA (non pubblicata)
Richiesta: «LOGO TUTTO CAMPO · tuttocampo.it · romagnasport.com · CREA I PALINSESTI CHANNEL».
- Loghi: `public/brand/fonti/` 7 file ritagliati dagli originali (tuttocampo, romagnasport, romagnasport-banner, marchesport,
  emiliaromagnasport, sportapp-wordmark, sportapp-icona). Anteprima su /check-web/loghi-canali (sezione «LOGHI DELLE FONTI», da approvare).
  Sono loghi di FONTI: non sono loghi di canali TBH. Usati solo nel palinsesto partite dell'anteprima.
- Palinsesto partite canali squadra: `api/data/fonti-calcio-squadre.ts` (gir/id_squadra Romagna Sport + link classifica Tutto Campo da indice di ricerca),
  `api/lib/romagnasport.ts` (lettura calendario.php + classifica.php, cache 30', attesa 2' dopo errore, latin1; usa node:https perché
  Cloudflare dà 403 al fetch di Node/undici), `api/routes/calendari.ts` (calendari.squadra, calendari.canali), `web/queries/calendari.ts`,
  `web/components/palinsesto-partite.tsx` (in MonitorSquadra + lista «Palinsesto partite dei canali squadra» su /check-web/telecomando).
- Tutto Campo: 403 alla lettura automatica → solo collegamento.
- NON toccati: sport.ts, esterni.ts, pagine live. Link rotti in esterni.ts (romagnasport.com/calcio 404) da correggere solo con ok.
- Discordanza: San Marino sport.ts «Serie D» vs Romagna Sport «Eccellenza Girone B» (-2 punti in classifica, 18°).

## 17/10 sera — DIAGNOSI PREVIEW vs PRODUZIONE (sola lettura, nessuna modifica al codice)
- Prod www.tbh-web.com = pubblicazione vecchia (~16/10): manca calendari.* (404), /brand/fonti/* = fallback HTML, ultimaPuntata null, conteggi video squadre vecchi.
- Stesso DB (procedure DB-backed identiche).
- BUG SOLO PROD (anche nel codice attuale): /api/logo/<formato>/<file di public/> → 404 "File di partenza non trovato." perché in prod il server non ha public/ su disco (readFile(process.cwd()/public)). Rotte: home 24, /sport/squadre 19, /dm 1, /check-web 29. Nessun onError in logo-box/tessera-logo. Da correggere SOLO con ok utente.
- Diff stringhe "solo prod" = falso allarme (presenti anche in src).
- Script: /tmp/diag/cmp.py, pw.py, logo.py

## 17/10 sera — FASE 2 RIPRISTINO RISORSE (fatta, in anteprima; pubblicazione = Publish dell'utente)
- api/index.ts /api/logo: file del sito non su disco (server pubblico) → 302 all'originale statico (Cache-Control 1h, X-TBH-Cache originale-statico). Prima: 404.
- web/components/logo-box.tsx: urlVariante ?v=2 (scavalca i 404 in cache Cloudflare 4h); urlOriginale(); <ImmagineMarchio> con riserva onError → originale. Usato da LogoBox e RiquadroLogo (tessera-logo.tsx).
- web/lib/esterni.ts: Romagna Sport Calcio/Basket/Pallavolo 404 → /tuttocalcio/tuttocalcio.php, /tuttobasket/tuttobasket.php, /tuttovolley/tuttovolley.php (menu ufficiale, 200).
- Verifica: server di build avviato da cartella senza public/ (simula prod) → 0 errori su / /sport/squadre /dm /check-web /check-web/telecomando /calcio; test con /api/logo forzato a 404 → 49/49 e 29/29 loghi caricati dall'originale.
- Tuttocampo 403 = anti-bot (non verificabile), lasciato. capitan/apparizione 500 una volta, non riprodotto (5/5 200).
- NON toccati: San Marino categoria, loghi fonti (attesa approvazione). Fase 3: consultare l'utente prima.

## 17/10/2026 sera — Piano Fase 3 (consegnato, in attesa di approvazione)
- San Marino → "Eccellenza girone B Emilia-Romagna" (sport.ts, catalog.ts nota, header fonti-calcio-squadre.ts). tsc 0, build OK, lint solo scansione.
- Report piano: /home/user/piano-fase3.report/content.md (loghi fonti 1-7, candidati A-H, mosaici home/anteprime, proposta-home.png, mappa entità→ID, diciture superate, 11 decisioni).
- NIENTE implementato della Fase 3. Staging proposto: /check-web/home-ordine (A) o estendere /check-web/home-canali (B).
- Nota: telecomando.ts dm-channel.pagina = "/dm" (proposta: /dm/programmi, da decidere).
- Publish non ancora fatto dall'utente → dopo Publish rifare cmp.py/audit.py/an.py.
- 17/10 22:30 GMT — Publish confermato. Verifica prod: bundle nuovo (index-B76R5uUs.js), /api/logo/*?v=2 → 302 originale-statico, 33/37 endpoint identici (4 diversi solo per orari/contatori/feed edicola più fresco), telecomando/canali e calendari/canali identici, ultimaPuntata piena, 6/7 /brand/fonti immagini.
  Unico residuo: /brand/fonti/tuttocampo.png servito come HTML dalla cache Cloudflare (HIT, age 5253 / max-age 14400) → si risolve da solo entro ~2,5h; con ?cb= il file è già immagine. 6 img "non caricate" sulla home = lazy nel carosello shop, uguali in preview (file OK 200).

## Sessione 18/10/2026 — Home "Canale 0" (fase 1) + palinsesti automatici Channel
- Staging: /check-web/home-ordine (3 monitor + 27 Channel testo + 5 caroselli titolo). `/` NON toccata.
- Pannello: /allestimento/channel (codice TBH_CODICE_ALLESTIMENTO).
- File: api/data/channel-home.ts, api/lib/channel-palinsesti.ts, api/routes/channel.ts, web/queries/channel.ts, pages/check-web-home-ordine.tsx, pages/pannello-channel.tsx; schema +3 tabelle (channel_contenuti, channel_impostazioni, channel_fasce), db:push fatto (DB condiviso preview/prod).
- Sync auto ogni 30 min, dedup (channel,sorgente), mai cancellare: solo disattivare.
- Verifiche: tsc 0, lint solo scansione, build OK, Playwright 1440/820/390 OK.
- Aperti: Arm Wrestling, Touch Cinema/Spot senza pagina, Reality vs Giovanile Rimini, Hugoland/Travels stessa pagina, Influencity vs Edicola, DM /dm vs /dm/programmi, h1 J.C. Hugò "TOUCH MUSIC", Junior Gambettola, video Rimini non confermati, casting vuoti.
- In attesa: approvazione per spostare su `/` + Publish utente.

## 18/10/2026 — FASE 2 «Canale 0»: collaudo completato (in attesa di autorizzazione)
- Ambito dati: colonna `ambiente` (staging = Vite dev, produzione = server Bun, collaudo = TBH_AMBIENTE_COLLAUDO=1 solo test). Chiavi settings `channel_sync_ultimo:<ambito>`, `home_attiva:<ambito>`, `home_attiva_storico:<ambito>`.
- Verificato: bun senza Vite → "produzione"; server collaudo (build reale) parte vuoto, sincronizza da solo 318 righe sue, staging resta 318; timer 5' → sync 30' ripartito da solo (17:33 UTC) dopo retrodatazione.
- Interruttore home: canale0 → `/` mostra Canale 0 (dev e build); classica → `/` torna a TBH-WEB. Staging e collaudo lasciati su CLASSICA.
- Squadre: 0 video estranei, attribuzione DM unica; Rimini/Gambettola 0 righe. Video «in più squadre» = partite tra due squadre seguite.
- Link: 27 APRI CHANNEL + 3 monitor + extra tutti OK, 0 errori console, nessun overflow 1440/820/390, 0 <img> (10 svg = frecce caroselli approvate).
- Ripuntati su /hugoland: 4 schede fiere/hotel medialibrary (paginaTbh) + logo Hugoland (loghi-tbh). /touch-travels = IN ALLESTIMENTO.
- Mappa sito: aggiunti /spot, /arm-wrestling, /touch-travels, /sport/squadre/junior-gambettola, /check-web/home-ordine.
- h1 sr-only "TBH-WEB" su Canale 0.
- Righe di test `ambiente='collaudo'` (318 + chiavi settings :collaudo) lasciate nel DB, inerti: rimuovibili su richiesta.
- Produzione www.tbh-web.com: API channel 404 (fase 1 non pubblicata) → nessuna interferenza.
- PROSSIMO: autorizzazione utente → Publish → in /allestimento/channel (prod) IMPORTA DALLO STAGING (facoltativo) + ATTIVA CANALE 0.
- 18/10/2026 (dopo "Continue" = autorizzazione): home_attiva:staging=canale0 (verificato `/` = Canale 0 in anteprima) e home_attiva:produzione=canale0 PRE-IMPOSTATA (storico registrato). Produzione non ancora pubblicata (API channel 404). Dopo Publish: `/` pubblico = Canale 0; dati prod si sincronizzano ~15 s dopo l'avvio. Ripristino: RIPRISTINA HOME PRECEDENTE in /allestimento/channel del sito pubblico.
- Dopo conferma Publish: rieseguire cmp.py/audit.py/an.py, controllare /brand/fonti/tuttocampo.png, channel.home (atteso canale0/produzione), conteggi ambiente=produzione.
- 18/10/2026 FASE 3: prod non ancora pubblicata (channel/home 404). Collaudo build: con Canale 0 su `/` header+footer presenti, 122/122 link di menu/footer funzionano (10 = redirect previsti). Link della home vecchia: tutte le destinazioni restano raggiungibili da menu, tile Canale 0 o pagine di sezione (/shop, /sport/squadre, edicola, hospitality). In attesa del Publish dell'utente → poi punto 4 (cmp/audit/an + channel.home + conteggi produzione + tuttocampo).
- 18/10/2026 MONDO OLISTICO CHANNEL (28°): channel-home.ts slug `mondo-olistico`, titolo esatto "MONDO OLISTICO CHANNEL" (nuovo campo `titolo?`), categoria `benessere`, in coda alla fila F (ordine dei 27 invariato, 6 file). Pagina /channel/mondo-olistico (pages/channel-mondo-olistico.tsx): titolo, IN ALLESTIMENTO, ambiti indicati da Claudio, avvertenza benessere ≠ sanità; playlist reale se l'archivio si riempie. Nessuna fonte automatica (default []), archivio manuale dal pannello. Collaudo (ambito collaudo): aggiungi/doppione 409/casuale/spot ogni N/sync non tocca manuali → OK, righe di prova eliminate, impostazioni riportate ai default. Mappa sito aggiornata, testi "27"→"28".
- components/ritorno-in-alto.tsx: scroll in alto al cambio pagina (no hash, no primo caricamento). Prima i link da Canale 0 aprivano le pagine a metà.

## 18/10/2026 — Layout ufficiale 28 Channel: 5 blocchi, 4 caroselli
- home_attiva:produzione e :staging riportati a `classica` (erano stati pre-impostati a canale0): `/` invariata.
- channel-home.ts: FilaChannel A–E, CHANNEL_HOME riordinato (A01–06, B07–12, C13–18, D19–24, E25–28), campo interno `numero` (mai a schermo), Hugoland D→A, DM → «DM Comunicazioni» (nome del sito; tabella diceva «Comunicazione»).
- CAROSELLI_HOME: attivita-tbh (A), carosello-2 (C), carosello-3 (D), casting-concorsi (E); plaza-shop/corsi/candidature conservati con dopoFila null. CAROSELLI_VISIBILI per la home.
- check-web-home-ordine: xl:grid-cols-6, stato su 2 righe (niente troncamento), banner aggiornato.
- fashion.tsx: sezione testo + link a /eventi/miss-cool (prima mancava).
- Verifiche: /home/user/diag/lay.py (5 larghezze), lnk.py (28 link + miss-cool) su collaudo build; elenco staging == collaudo; channel_contenuti 318/318 invariati.

- 18/10: Claudio non vedeva i Channel su / in anteprima → home_attiva:staging rimesso a canale0 (produzione resta classica). Verificato / su 4200: 28 tessere, 4 caroselli, 3 monitor.

- 18/10: dopo il Publish di Claudio il sito pubblico mostrava la home classica (home_attiva:produzione=classica). Messo canale0 in produzione. Verificato su https://www.tbh-web.com/: 28 tessere, 4 caroselli, 3 monitor identici all anteprima a 5 larghezze, 28 link OK, dati elenco identici (318 contenuti).

## 18/10/2026 — Richiesta «Sistema contatori e marketing»: SOLO DIAGNOSI (nessun codice scritto)
- Verificato: palinsesto TV/Radio pubblico == anteprima (md5 identico, 565 elementi), elenco 28 Channel identico.
- Esistenti: statistiche.ts (contatori aggregati in settings, NO ambito, NO filtro bot → include test/anteprima), touch_eventi (57, dedupe sessione, solo TV/Radio), monitor_eventi (1032, solo promo TBH di riserva id<0, nessun indice unico), prodotto_eventi (10 viste). schede/marchi/monitor_campagne/orders/adv_pratiche/stripe_eventi = 0 righe. Nessun GA4/pixel, nessun banner cookie, testi privacy/cookie «in arrivo».
- In attesa dell'autorizzazione di Claudio sulle fasi.
- 18/10 REPORT diagnosi contatori consegnato: /home/user/tbh-web-contatori.report/content.md. Palinsesto 19/10: 87 pause, 174 passaggi spot/giorno (~22 per spot). touch_eventi: 12 passaggi spot reali (con test). monitor_eventi: 1032 righe dal 16/09, solo promo id<0, no ambito. Rischi: statistiche.registra pubblico senza limiti; campagne.elimina cancella eventi; 35.040 non tracciabile (=96×365, palinsesto ne fa 87/giorno). In attesa di autorizzazione Fase 0.
- 18/10 PIANO 4 CAROSELLI (solo verifica, nulla modificato): /home/user/tbh-web-caroselli.report/content.md. Touch Plaza 16/16 payment link Stripe attivi e prezzi coincidenti (no STRIPE_SECRET_KEY, stripe_prodotti 0). DM: PALINSESTO_DM == dmsportlive ?p=596; feed YouTube RSS OK. Bacheca TBH 12 attivi + 1 scaduto; castings 0. Cerco Lavoro in Hotel: no API/RSS, robots libero, sitemap 62 jobs; snapshot 06/10 = 31 ancora attivi, 27 tolti (4 in 404) → bug bacheca esistente. Autorizzazione Federalberghi Riccione mancante. In attesa decisioni (corsi C1/C3, antincendio 0€, Rimini, richiesta Federalberghi, titoli) + autorizzazione fasi A–E.

## 18-19/10/2026 — Touch Cinema HEDDY + 4 caroselli vivi + contatori giornalieri
- Touch Cinema: /channel/touch-cinema = tutti i 118 film pubblicati su heddy.video (fotografia 18/10/2026), 7 categorie, ricerca titolo/regia,
  ogni scheda → pagina del film su heddy.video (nuova scheda). Tile CHANNEL touch-cinema ripuntata lì (slug invariato); /tbh/produzioni?ambito=cinema resta.
  Nessun orario né prezzo: il modello di prezzo di HEDDY NON è verificato. Film in channel_contenuti tipo "film": collaudo sincronizzato (118+6);
  staging/produzione si popolano alla prima sincronizzazione (automatica alla lettura o pulsante nel pannello).
- Caroselli (titoli da specifica ufficiale, slug e posizioni invariati): C1 TOUCH PLAZA 15 articoli Stripe >0 € · C2 PALINSESTO DM (prossime dirette,
  ultima puntata per programma = più recente tra feed RSS ufficiale e PUNTATE_DM, ultimi video del feed; niente Rimini) · C3 annunci non scaduti +
  casting aperti + Miss Cool · C4 CERCO LAVORO IN HOTEL in allestimento (attesa autorizzazione Federalberghi Riccione).
  Ordine casuale del giorno (seme giorno+carosello), cache 5 min.
- Contatori: tabella carosello_eventi, beacon POST /api/caroselli/evento (vista ≥50% per 1 s, clic), 1 riga per sessione/scheda/tipo/giorno/ambito,
  robot esclusi. Pannello /allestimento/channel → «Caroselli di CANALE 0 · passaggi giornalieri». Righe di collaudo di test cancellate.
- Collaudo 4391: 28 tile invariate su 5 viewport, nessun overflow, 0 immagini rotte, 0 errori console.

## 19/10/2026 — Loghi originali dei Channel (13 approvati)
- Fonte unica: `packages/web/src/api/data/loghi-channel.ts` (LOGHI_CHANNEL, chiave = slug CHANNEL_HOME; md5, misure, data approvazione).
- File in `public/channel/loghi/` byte-identici agli allegati (md5 verificato in public/ e dist/): dm, vis-novafeltria, pietracuta, verucchio, victoria, san-marino, gabicce-gradara, bellaria-igea-marina, tropical-coriano, rimini-calcio, touch-tv, touch-plaza-shop, touch-rfa.
- Estensioni `.jpe` / `.apng`: l'asset-optimizer del template (file `__`, non modificabile) ricomprime .png/.jpg/.webp in dist (JPEG q80). Con queste estensioni li salta; Bun li serve come image/jpeg e image/apng.
- Ripuntati: telecomando (ufficiale), home Canale 0 (TesseraChannel, 12 tessere con logo), /dm, /tv, /shop (logo Touch Plaza in testata), /sport/squadre/* (9), stemmi marquee, anteprime, palinsesto, catalog, medialibrary MP-001, design.
- Vecchi file lasciati in public/ (non cancellati, non più usati da questi Channel): /teams/*.png, /brand/dm-comunicazioni.jpg, /brand/loghi/touch-tv.png, /brand/archivio-73/TBH-071.jpg.
- Junior Gambettola: nessun logo, tessera solo testo.
- Touch R.F.A.: registrato con `fuoriElenco: true`, nessun numero, non in home; stemma società /societa/rfa/stemma.png non toccato. In attesa di indicazioni.
- Didascalie aggiornate: squadra.tsx (solo per loghi approvati), squadre.tsx, check-web-home-canali, check-web-loghi-canali, commento canali-ufficiali-home.
- Test: tsc 0 / app 25 (baseline), build OK, lint solo «scansione»; collaudo 4391 desktop 1440 + mobile 390 su 16 pagine: 0 immagini rotte, 0 overflow, 0 vecchi file; 12/12 tessere home con logo anche su mobile. Un 500 isolato su tropical-coriano non riprodotto (3 tentativi puliti). Collaudo chiuso, 36 righe carosello_eventi di collaudo cancellate.
- NON pubblicato: Publish resta a Claudio.

## 21/10/2026 — 10 Channel approvati il 19/10 (grafiche + schede in anteprima)
- Archivio: `public/channel/loghi/originali/<slug>.apng` = allegati byte-identici (md5 verificati). Copie sito `<slug>.jpe` JPEG q88, stesse dimensioni, 0,22–0,42 MB.
- `loghi-channel.ts`: +10 voci (campi nuovi `originale`, `md5Copia`, `byteCopia`, `inPreparazione`). Totale 23 loghi.
  - Touch Reality Show (n. 26, già fra i 28): aggiornata solo la grafica, nessun doppione.
  - Gli altri 9: `inPreparazione`, esclusi da `logoChannel`/`datiLogoChannel` → niente home, caroselli, numeri.
- Nuovo `src/api/data/channel-in-preparazione.ts` (9 Channel, categorie alla lettera, link solo da rete.ts).
- Nuova scheda `src/web/pages/channel-scheda.tsx` → route `/check-web/channel/:slug`: logo, anteprima tessera, monitor IN ALLESTIMENTO, palinsesto e archivio vuoti (predisposti), collegamenti, da fornire.
- `/check-web/loghi-canali`: ogni logo apre la sua scheda (Reality → /media/reality-show/academy); etichetta «NUOVO CHANNEL · NESSUNA POSIZIONE».
- Touch ACI TV: non esiste da nessuna parte → nulla da rinominare. Logo TBH compatto: non allegato.
- Verifiche: tsc 0 / app 25; lint solo `scansione`; build OK (prima dell'ultimo ritocco CSS dell'anteprima); dist identico per i file controllati; 3 pagine desktop+mobile: 0 immagini rotte, 0 overflow.
- NON pubblicato.

## 23/10/2026 — TBH-WEB 3.0 · template paginato, PRIMA FASE (solo Pagina 1, anteprima privata)
- `/check-web/pagine/1` (`src/web/pages/check-web-pagina.tsx`): 15 Channel TBH (ordine CHANNEL_HOME, esclusi DM + squadre), 5 righe × 3, un carosello dopo ogni riga.
- Monitor = `TesseraChannel` della home-ordine (ora esportata, prop opzionale `scheda` → APRI CANALE + APRI SCHEDA). Home-ordine invariata (senza prop = come prima).
- Caroselli: 4 ufficiali esistenti + posizione 5 «DA ASSEGNARE» vuota. `CaroselloOrizzontale` ha prop opzionale `autoplay` (5 s, rotazione continua, pausa su mouse/tocco/fuoco); default spento, gli altri caroselli non cambiano.
- APRI SCHEDA → `/check-web/channel/<slug>`: la scheda ora vale anche per i Channel ufficiali (dati da CHANNEL_HOME, palinsesto rimandato alla pagina del Channel, nulla di inventato).
- Distribuzione calcolata: Pagina 1 = 15 TBH, Pagina 2 = 11 DM (DM + 10 squadre), Pagina 3 = 2 TBH (Touch Cinema, Touch Spot). Pagine 2–3 NON create. I 9 Channel in preparazione restano fuori finché TBH non assegna la posizione.
- Verifiche: tsc 0 / 25, lint solo scansione, build OK, desktop+mobile: 5 righe, 15 tessere, 15 doppi pulsanti, 5 caroselli, autoplay avanza, 0 immagini rotte, 0 overflow.

## 28/10/2026 — Ampliamento Channel + Offerta 122 €
- Registro unico `src/api/data/channel-registro.ts` (+ route `channelRegistro.elenco` / `channelRegistroAdmin.impostaSpazio`): 46 Channel deduplicati = 28 ufficiali + 9 in preparazione + R.F.A. + Miss Cool + 7 spazi vuoti. Sezioni: Home TBH 17, DM 11, NOVA TV 3 (spazi), BEST ENTERTAINMENT 3 (spazi), Altri/liberi 12. Gruppi 3/6/12.
- Appartenenze (solo dati confermati): TBH 17, DM 11, da assegnare 17, libero 1. Stati: IN ALLESTIMENTO 30, PLAYLIST AUTOMATICA 13, PALINSESTO CONDIVISO 2, REPLICA 1.
- Nuove pagine: `/channel` (3 monitor + 5 sezioni + caroselli), `/channel/scheda/:slug` (scheda pubblica, slot «Logo da caricare» `channel-logo:<slug>`, modulo spazio con codice). Home commutabile `tbh3` (NON attiva: si attiva da /allestimento/channel; le home precedenti restano riattivabili).
- Palinsesti channel: aggiunta modalità `commerciale` (B = commerciale H24) accanto all'editoriale (A). Palinsesto TV/Radio `radio-palinsesto.ts` NON toccato (supporta solo spot YouTube).
- Offerta 122 €: prodotto shop `tbh-art-entertainment-network` (Stripe dRmcMZdiJ9QJ29l8iIfQI0i, QR dal vivo decodificato OK con zbarimg); riserva −8 in campagne-monitor (locandina .apng intera `object-contain`, 20 s, `sempreInRotazione`, rotazione casuale senza ripetizioni consecutive), presente in ogni SpazioPubblicitario, monitor centrale /channel, schede dei Channel liberi, box `#pubblicita` Touch TV/Radio. Interruttore ATTIVA/SPEGNI in /allestimento/monitor → tab Promo di riserva (settings `chiaveAmbito("promo_riserva_spente")`).
- `TESTI_PULSANTE` esteso con «SCOPRI L'OFFERTA — 122 €». QR stampato sulla locandina non decodificabile → QR dal vivo sulla scheda shop.
- Mancano: nomi/URL/loghi NOVA e BEST (TBH-009 non confermato), ordine dei 9 in preparazione, collocazione ACI TV / Touch Beach & Sea / R.F.A., logo Junior Gambettola, logo Miss Cool (solo candidato). Lavoro: bacheca 71 annunci (70 attivi + 1 archivio al 28/10); ANNUNCI_LAVORO (5) senza stato/scadenza; castings 0; monitor_campagne 0.
- Verifiche: tsc 0 / 25, lint solo scansione, build OK; Playwright desktop+mobile 11 pagine 200, 0 immagini rotte, 0 overflow, 75 link tessere tutti 200, swipe mobile OK. Un 500 intermittente su risorsa (dev server sotto carico) non riprodotto in 8 tentativi.

## 28/10/2026 — Loghi DM TV (9 Channel)
- Allegati utente (9 PNG 1672×941) = loghi co-brandizzati Channel + DM TV. Usati SOLO dove compare il Channel.
- Originali byte-per-byte: `public/channel/loghi/originali/dm-tv/<slug>.apng` (md5 = allegato). Copie JPEG q88 senza ritaglio: `public/channel/loghi/dm-tv/<slug>.jpe`.
- Slug: dm, bellaria-igea-marina, vis-novafeltria, pietracuta, gabicce-gradara, verucchio, san-marino, victoria, tropical-coriano.
- `loghi-channel.ts`: tipo `VarianteLogoChannel`, campo `dmTv?` (approvato 28/10/2026, md5/md5Copia/byteCopia/originale), `logoDelChannel(slug)`, `srcLogoChannel(slug)`; `logoChannel`/`datiLogoChannel` preferiscono `dmTv`.
- Usato in: channel-registro `logoDi`, tessere `/channel` (flag `largo` aspect ≥1.5), `/channel/scheda/*`, telecomando (9 voci), palinsesto canale 7, `/check-web/loghi-canali` (blocco «VERSIONE DM TV», testo header ancora «23 loghi»), `/check-web/home-ordine`.
- NON cambiati: stemmi squadre (`logoSquadra`, `/sport/squadre/*`, catalogo, sport.ts), logo aziendale DM Comunicazioni (`LOGO_DM`, `/dm`, marquee, medialibrary, ecc.). Rimini Calcio e Junior Gambettola: nessun banner DM TV fornito → invariati.
- `channel-sezioni.tsx` `GRIGLIA[6]` = `grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3` (prima xl:6): vale per TUTTI i gruppi da 6 (anche Home TBH, Altri).
- `catalogo-touch-plaza.ts` `catalogoCompleto()`: try/catch su lettura stripe_prodotti → cache o solo listino PRODUCTS.
- Known issue: 500 intermittenti (~1/6 caricamenti) su catalog/products, statistiche/riepilogo, media/perPrefisso; curl 12× = 200, nessun log. Probabile errore transitorio DB Turso, non legato a DM TV.
- Verifiche: tsc 0 / app 25, build ✓, lint solo `scansione`, Playwright 22 pagine 200, 0 img rotte, 0 overflow.

## 28/10/2026 — Channel TBH delle società (9 card co-firmate TBH)
- Scelte di Claudio: 8 nuovi Channel in HOME TBH + R.F.A. spostato da «Altri» a HOME TBH; Touch Music = Channel a sé (rubrica TOUCH MUSIC invariata); solo Touch Music Channel sopra le società; inserirli nel palinsesto, schede come deciso.
- Ordine HOME TBH dopo i 17 ufficiali (invariati): 18 Touch Music Channel, 19 Touch Village, 20 Touch Be Proud, 21 Touch Hello, 22 Touch Home Consulia, 23 Touch R.F.A., 24 Touch Metropolitan Media, 25 Touch Production, 26 Touch Business Holding. Registro 46 → 54 (Home TBH 26, DM 11, Altri 11, NOVA 3, BEST 3).
- Slug nuovi: touch-music-channel, touch-village, touch-be-proud, touch-hello, touch-home-consulia, touch-metropolitan-media, touch-production, touch-business-holding. touch-rfa invariato.
- Asset: originali byte per byte `public/channel/loghi/originali/tbh/<slug>.apng` (md5 = allegato), copie JPEG q88 senza ritagli `public/channel/loghi/tbh/<slug>.jpe` (md5 in /tmp/diag/tbh-loghi.txt e in loghi-channel.ts). R.F.A.: campo nuovo `tbh` (variante come `dmTv`), il vecchio logo touch-rfa.jpe resta registrato.
- `channel-registro.ts`: `CHANNEL_SOCIETA_TBH`, fonte "societa-tbh", campo `collegamenti` (scheda società /tbh/societa/<codice>, Touch Music → /musica). pagina = null → IN ALLESTIMENTO + promo in attesa; palinsesto A/B dal pannello /allestimento/channel (registro → channel-palinsesti automatico).
- `channel-scheda.tsx`: collegamenti del registro + riquadro palinsesto con stato vero e A/B. `check-web-loghi-canali.tsx`: blocco «VERSIONE TBH», link scheda per i fuori elenco, testo header aggiornato.
- NON toccati: loghi società (kit-societa, /brand/loghi), homepage, palinsesto vecchio /canale/N (canale 1 TBH e 9 Touch Production tengono i loghi di prima: usati anche in home/menu), telecomando.
- Verifiche: tsc 0 / 25, build ✓ (dist md5 = copie), lint solo scansione; Playwright desktop+mobile /channel, 3 schede, loghi-canali, pannello, home: 200, 0 immagini rotte, 0 overflow. ampl.py: unica immagine rotta = 2 copertine cdn2.suno.ai (403 esterno) su /tv e /radio.

## 28/10/2026 — Canali tematici Touch Music / Influencity / Arm Wrestling

- Canali (JSON in `settings`, chiave `canali_tematici`; estendibili dal pannello senza codice): `touch-music`, `touch-influencity-magazine`, `arm-wrestling`. Stati: In allestimento / Attivo / Temporaneamente non disponibile.
- Contenuti: righe `channelContenuti` con `channel="tematico:<slug>"`, `fonte="canale-tematico"`, meta JSON in `descrizione`. Stati voce: bozza → approvato → pubblicato / non disponibile. Ogni URL entra in bozza; approvazione e pubblicazione di un video richiedono una verifica riuscita (oppure `forza`).
- Backend: `src/api/lib/canali-tematici.ts`, `src/api/routes/canali-tematici.ts` (pubblico `canaliTematici`, admin `canaliTematiciAdmin` con `TBH_CODICE_ALLESTIMENTO`). Query: `src/web/queries/canali-tematici.ts`.
- Player `components/canale-tematico-player.tsx`: coda casuale diversa per ogni spettatore, niente ripetizioni finché il catalogo non è finito, avanzamento a fine video (YouTube ENDED, Vimeo ended, file `<video>`; Dailymotion solo con durata nota), salto e registrazione degli errori, pulsante «AVVIA CANALE» se l'autoplay è bloccato, aggiornamenti del catalogo senza interrompere il video in corso. Influencity: articoli/immagini/numeri sono schede, mai in coda video.
- Pagine: `/canali`, `/canali/:slug`, `/arm-wrestling` (stesso URL, ora canale tematico), pannello `/allestimento/canali-tematici` (collegato da `/allestimento` e dalla mappa del sito). Striscia canali su `/channel`, `/influencity` e nelle schede Channel collegate.
- Loghi: `public/channel/loghi/tematici/*` (copie web) + `originali/tematici/*` e `originali/partner/best-entertainment.apng` (byte per byte). `touch-influencity` e `touch-arm-wrestling` ora registrati in `loghi-channel.ts` → compaiono anche nelle tessere di Canale 0. Logo BEST usato solo nell'avviso del pannello (decisione in sospeso).
- Cataloghi VUOTI: nulla inventato. Test fatto con un video YouTube pubblico (id 1312/1313) poi eliminato; registro errori svuotato.
- bestentertainment.it dietro captcha SiteGround: inserimento manuale (copiare dall'articolo l'URL del video YouTube/Vimeo). Videoclip musicali → TOUCH MUSIC, presentazioni modelle → INFLUENCITY, scelta a mano.
- Verifiche: tsc 0 / app 25 (base), build ok, md5 dist = sorgente per tematici/* e partner/*, lint solo «Missing export scansione», Playwright desktop e mobile ok (nessun overflow, nessuna immagine rotta).

## 28/10/2026 — Channel Touch Talent & Professionals

- Logo: originale byte per byte `public/channel/loghi/originali/tbh/touch-talent-professionals.apng` + copia web JPEG q88 senza ritaglio `public/channel/loghi/tbh/touch-talent-professionals.jpe` (2172×724). Registrato in `loghi-channel.ts` (`fuoriElenco`), voce nel registro unico `channel-registro.ts` (sezione HOME TBH, appartenenza TBH, collegamento a /hugoland).
- Dati (nessuna modifica allo schema): monitor = righe `channelContenuti` del Channel; impostazioni, palinsesto memorizzato e registro errori in `settings` con `chiaveAmbito` (`touch_talent_*:<ambito>`). Backend `src/api/lib/touch-talent.ts`, rotte `src/api/routes/touch-talent.ts` (`touchTalent` pubblico, `touchTalentAdmin` con `TBH_CODICE_ALLESTIMENTO`), query `src/web/queries/touch-talent.ts`.
- Pagine: `/channel/touch-talent-professionals` (monitor 9:16 letterbox, audio solo sul monitor IN ONDA con alone, filtri Artisti/Staff/Crew/Indipendenti, «A seguire», carosello «ULTIMI TALENTI E CONTENUTI» = ultimi 30 in ordine casuale stabile, protagonista linkato solo a pagine esistenti, catalogo vuoto → «Channel in allestimento»); pannello `/allestimento/touch-talent` (Incolla URL → Verifica → Attiva, modifica/disattiva/elimina, doppioni e URL non riproducibili segnalati, «Anteprima controllata» obbligatoria per Facebook/Instagram).
- Integrazioni: telecomando (`palinsesto.ts` CANALI numero 24, logo), Canale 0 (`CHANNEL_HOME_AGGIUNTI` in `channel-home.ts`, tessera in coda al blocco E: i 28 e i loro palinsesti automatici NON cambiano), `/channel` (registro), Touch Hugoland (programmazione canale 10 + riquadro su /hugoland), `/allestimento`, mappa del sito.
- Palinsesto H24 memorizzato sul server: giro completo prima di rimescolare, niente ripetizioni immediate, peso emergenti e nuovi caricamenti, mai lo stesso protagonista di seguito, ripartenza automatica, nuovi monitor inseriti nel futuro senza interrompere quello in onda, errori saltati e registrati, ingresso a metà video sull'ora del server. Simulazione (ambito collaudo, ripulito): 6 monitor × 8 h → 0 ripetizioni immediate, 0 protagonisti consecutivi, 15/15 giri completi, emergenti in media 1,91/6.
- YouTube: se il server viene bloccato come «bot» si accetta l'oEmbed (titolo/miniatura) e la durata la legge il player o si inserisce a mano.
- Catalogo VUOTO: test con 3 video pubblici (id 1314–1316) poi eliminati, registro errori svuotato, palinsesto nullo.
- Verifiche: tsc 0 / app 25, build ok, md5 dist = sorgente (jpe 1a222b3a…, apng b01da30f…), lint solo «Missing export scansione», Playwright desktop e mobile ok su channel, pannello, /hugoland, /, /channel, telecomando.

## 28/10/2026 — Struttura comune Home → Canale → Attività → Scheda
- Loghi nuovi (card allegate, 1672×941): originali byte-copia `public/channel/loghi/originali/tbh/<slug>.apng`, copie sito JPEG q88 `public/channel/loghi/tbh/<slug>.jpe` (nessun ritaglio).
  - touch-tv 6b8e7b46… / jpe d34376aa… · touch-fashion 13f49c90… / 4ac96848… · touch-cinema ca4056f3… / 9a1b5d0c… · touch-radio 5e64639c… / 41b85c4e….
  - La card «Touch Music Radio» è diventata il logo del Channel 3 Touch Radio (nome invariato) — DA CONFERMARE. «Touch Cinema Studios» → touch-cinema.
- Dati: `src/api/lib/struttura.ts` (STRUTTURA da CHANNEL_REGISTRO, senza slot vuoti) → rotta `struttura.mappa` → `useStruttura()`.
  - Attività = programmazione CANALI con url = pagina del Channel + collegamenti + entità presenti sulla pagina.
  - Destinazione UNICA: pagina Channel se è un Channel, altrimenti `/e/<id>` se una sola entità è su quell'URL, altrimenti l'URL originale. Immagini solo da loghi entità / anteprime reali.
- Componenti `src/web/components/struttura.tsx`: CardModello (scheda intera cliccabile, seconda azione a parte senza link annidati), Briciole, GrigliaAttivita, PresenteNeiChannel, PercorsoStruttura + AttivitaInPaginaChannel (montati in app.tsx).
- Pagine: home (TesseraChannel), /channel (Tessera), /channel/scheda/<slug> (percorso Home › Channel › nome, SCHEDA COMPLETA, attività), /e/<id> (percorso Home › Channel genitore › entità, «Presente nei Channel»), pagine Channel esistenti (percorso + attività in fondo).
- Verifiche: tsc 0 / app 25, build ok, md5 dist = sorgente sugli 8 file, lint solo «Missing export scansione», Playwright desktop e mobile: click su tutta la scheda, APRI SCHEDA separato, briciole, nessun overflow, nessuna immagine rotta.

## 28/10/2026 — Zapping, monitor a rotazione, Touch Cinema 3 film, anteprime link

**File nuovi:** src/api/data/touch-cinema-film.ts · src/api/routes/monitor.ts (monitor.impostazioni, monitorAdmin.impostaRotazione, settings `monitor_rotazione_sec`) · src/api/lib/anteprima-link.ts · src/web/queries/monitor.ts · src/web/lib/{audio-unico,anteprima-pagina,voci-monitor}.ts · src/web/components/{monitor-rotante,proiezioni-touch-cinema,pulsante-condividi}.tsx · src/web/pages/touch-cinema-film.tsx (route /channel/touch-cinema/film/:slug) · 3 miniature in public/channel/touch-cinema/.
**File modificati:** src/api/index.ts (route monitor + `GET /api/condividi/*`) · app.tsx · styles.css · zapping.tsx (BarraZapping + PannelloCanali) · layout.tsx (fermaTuttoAudio al cambio pagina, padding fondo) · struttura.tsx (PERCORSO_PROPRIO) · channel-touch-cinema.tsx · check-web-home-ordine.tsx (MonitorRegia → SchermoPalinsesto/SchermoSpot) · channel-sezioni.tsx (MonitorSpot) · pannello-channel.tsx (SezioneRotazioneMonitor, 3–120 s).

**Decisioni**
- Monitor: rotazione immagini subito, 8 s (modificabile da /allestimento/channel); Play al clic mette in pausa quel monitor, a fine contenuto riparte dal successivo; immagine visibile durante il caricamento; player bloccato → «Guarda su YouTube» + nota Paese; spot indipendenti; audio fermato al cambio canale/pagina.
- Touch Cinema: 3 film in ordine -TAPcj1H1Lw, U-XejC20eEw, MGBmy3dBpUQ; una scheda per film; briciole Touch Production → Cinema → Proiezioni; «Contenuti disponibili», niente orari; catalogo HEDDY.video mantenuto SOTTO le Proiezioni.
- Film 1: anno 2022 (IMDb tt22819556, MYmovies); cgtv indica 2023 → segnalato in scheda (notaAnno). Film 1 e 2 prequel/sequel, tutti e 3 distinti.
- YouTube: film 1 e 3 visibili solo dall'Italia, film 2 Italia/San Marino/Vaticano → dal sandbox non riproducibili, testato il fallback.
- Anteprime link: __server.ts serve lo stesso index.html per tutte le rotte (non modificabile) → anteprime per pagina via `https://www.tbh-web.com/api/condividi/<percorso>` (meta og/twitter + redirect interno, redirect esterni bloccati); pulsante CONDIVIDI usa quel link. Gli URL normali mostrano l'anteprima generica statica.
- Barra zapping alzata sopra il badge Runable su mobile (copriva «Successivo»).
- Verifiche: tsc 0/25, build ok, md5 loghi ok, lint solo `scansione`; Playwright desktop+mobile senza errori. Audio Suno nel monitor radio non verificato (in locale solo voci YouTube).

## 28/10/2026 — Limite 90 minuti, ARM WRESTLING in sequenza H24
- Regola: max 90 min (5400 s) per singolo video in TUTTI i canali (lib `src/api/lib/durata-video.ts`). Durata letta dall'URL (YouTube: pagina pubblica, se bloccata dall'anti-robot → risultati di ricerca pubblici) o scritta a mano. Oltre 90 min: avviso PRIMA dell'inserimento + conferma esplicita, mai tagli. Approvare/pubblicare un video richiede la durata nota.
- Palinsesto = somma dei contenuti (max 24 h); se più corto, «Ciclo continuo H24» lo ripete. Immagini: secondi configurabili per canale (`secondiImmagine`, default 7).
- Canali tematici: nuovi campi `riproduzione` (casuale/sequenza), `cicloH24`, `secondiImmagine`; procedura `ordina`; pannello con ↑/↓, durata, avvisi, riepilogo scaletta. Pannello Channel: stesso limite su video/film/spot.
- ARM WRESTLING (staging, id 1335–1339, tutti «pubblicato», sequenza + H24): ktxjXao8WUo 1:29:29 · f4bbb1zdWGI 16:31 · BO_sDlaHFPU 17:38 · PcOFAgc5ihY 2:24 · 7JypaeRbzUc 2:01 → totale 2:08:03. Nessuno oltre 90 min. Embed/paese non leggibili dal server (anti-robot YouTube).
- Già presenti oltre 90 min (solo segnalati, non tagliati): Touch Cinema film 1 -TAPcj1H1Lw (5620 s, pagina dal server «Video non disponibile») e film 2 U-XejC20eEw (5440 s); varie puntate DM (dm-puntate.ts, es. Calcio di Rigore 7415–8865 s, «il calcio D tutti» 5823 s).
- Messaggio errore YouTube 101/150 riformulato (incorporamento, area o verifica di YouTube). «Svuota errori» azzera anche i contatori per contenuto. Verifica: se la durata non viene riletta resta quella registrata (niente «inserirla a mano» fuorviante).
- Produzione: dopo Publish vanno inseriti i 5 URL su www.tbh-web.com (/allestimento/canali-tematici) — righe separate da staging.
- Test: tsc 0/25, build ok, md5 loghi ok, lint solo «scansione». Playwright desktop+mobile /arm-wrestling e pannello: shots /home/user/shots/r12-*.

## 28/10/2026 — Round 13: scarto anteprima/www, Gestione contenuti e palinsesto, Home illimitate, barra Lavoro
- **Causa scarto ARM WRESTLING**: anteprima e www girano la stessa build; il pannello scriveva solo righe `staging` (chiave `canali_tematici:staging`), Publish porta solo il codice. Risolto portando i dati su produzione con `pubblicazioneAdmin/promuoviTematici {slug:"arm-wrestling"}` (verificato www desktop+mobile: 5 video, 2:08:03, H24).
- **Copie**: file `/home/user/backup/r13-pre-1793220536234.json`; in DB `copia_sicurezza:1793220695602` (manuale), `…695891` (pre-promozione) + copie automatiche dei test. Nessun reset distruttivo; il ripristino unisce (`unisciCms`), non sovrascrive.
- **Fix duraturo**: il nuovo pannello usa chiavi condivise `cms_v1:*` (stesso dato su anteprima e www) → Salva/Publish/riavvii non riportano ai dati iniziali. Tab «Copie» con confronto staging/produzione e «Porta su www» per i canali tematici.
- **Nuovo pannello** `/allestimento/contenuti-palinsesto` (codice Super Admin): tab Contenuti (scheda unica con URL video/immagine/destinazione, titolo, descrizione, fonte, pulsante; Analizza URL con titolo/copertina/durata YouTube modificabili; embed rifiutato → motivo + link fonte; caricamenti MP4/WEBM/immagini con limiti visibili; Anteprima / Salva bozza / Pubblica / Sospendi / Rimuovi; posizioni Home/Channel/carosello/playlist con ordine, inizio/fine, ripetizione, passaggi, stato, nessun doppione), Palinsesto (playlist Play o Diretta sincronizzata, ciclo continuo, ora di partenza, durata totale, anteprima player), Home, Channel e pagine, Caroselli, Copie, Errori.
- **Limite «29»**: l'unico 29 è `touch-talent-professionals numero: 29` in `channel-home.ts`; Home 0 resta 28+1 invariata (si aggiungono solo palinsesti). Home 2.0, 3.0 e successive senza limite su `/home/<slug>`; Channel/pagine extra su `/pagina/<slug>`; compaiono in guida (/guida, «ALTRE HOME» / «NUOVI CHANNEL E PAGINE»), ricerca e pannello zapping.
- **Barra CERCO / OFFRO LAVORO** (Home 0): schede Subito.it · Bakeca · Indeed · Cerco Lavoro in Hotel, frecce, rotazione 8 s, swipe su tutta la barra (non interferisce con le file che scorrono), linguetta attiva sempre in vista su mobile. Subito: nessun annuncio TBH attivo (663065249 chiuso). Bakeca: candidati indicizzati non verificabili dal server (Cloudflare 403) → non pubblicati. Indeed: link it.indeed.com in attesa del link diretto. Hotel: attesa Federalberghi Riccione.
- Ritocchi dopo test: tab del pannello seguono l'hash (#home, #palinsesto…); avviso «non ancora collocata» decade quando esiste una posizione; Pubblica Home avvisa se un palinsesto collegato non è attivo; righe posizioni/Channel leggibili su mobile; export di convenzione `pubblicazione` / `contenutiPalinsesto` per il lint.
- Test (dev, dati «TEST AGENTE» poi rimossi: 0 schede, 0 playlist, Home 0/2-0/3-0): API e2e, upload S3, Playwright desktop+mobile del flusso scheda→Analizza→Anteprima→Bozza→Pubblica→posizioni→/pagina, playlist diretta su /home/<slug>, guida, zapping, barra lavoro. tsc 0/25, node 4 note, build ok, md5 loghi ok, lint solo «scansione». Shots `/home/user/shots/r13-*`.
- **Da fare dopo Publish**: verificare su www pannello, Home 0 barra lavoro, `/arm-wrestling` 5 video.

## 28/10/2026 — Round 14: 10 banner TBH, card Channel uniformi, player, Regia logo/sito/collegamenti
- Banner (2172×724) copiati identici in `public/channel/loghi/originali/tbh/<slug>.apng` + copia JPEG q88 `public/channel/loghi/tbh/<slug>.jpe`; mostrati interi (`object-fit: contain`).
- AGGIORNATI (contenuti e link invariati): Touch Village, Touch Be Proud, #4 Deejay Hugò Channel (solo titolo), #24 Touch Lavoro = «Touch Human Resources Channel» (stesso Channel, nessun doppione). CREATI: Touch Fit & Wellness, Touch Pay (→ /pagamenti), Touch Rent (→ tbh-b11), Touch Care Assistance, Touch Booking Host (→ tbh-a16), Touch Security (→ tbh-b04). Nessun sito esterno inventato (www.touchpay.store non confermato → non usato).
- `CardChannel` unica (banner, monitor col palinsesto vero, APRI CHANNEL, APRI SCHEDA, VAI AL SITO solo se configurato) su home e /channel; `GrigliaChannelPaginata`: pagine da 15 in blocchi da 6, frecce/numeri, tastiera ←/→/Home/End, swipe touch.
- Nuova rotta `/channel/play/:slug` (player: sequenza + ciclo, scaletta, collegamenti; vuoto = «PALINSESTO IN PREPARAZIONE»).
- Regia `/allestimento/channel`: tipo immagine, modifica tipo/titolo/URL/link, form Logo·Sito·Collegamenti (chiave condivisa `cms_v1:canali` → vale su www e resta dopo Publish). `impostaExtra` con tutti i campi vuoti ora elimina la voce (nessun residuo).
- Collaudo: desktop/tablet/mobile (click, tap, tastiera, swipe) ok, 0 pageerror; Regia salva→ricarica→player/card mostrano il dato; dati di test rimossi (cms_v1:canali `{"extra":[],"modifiche":{}}`, 0 righe TEST).
- Nota sandbox: in Vite dev con 2 CPU le navigazioni ripetute nella stessa scheda a volte si bloccano (caricamento moduli); in isolamento ogni pagina carica in 1–4 s. Non è un problema della build.
- `channel_contenuti` resta per ambiente: su www usare «Importa da staging» per i palinsesti inseriti in anteprima.
- Da verificare su www dopo Publish: card/griglia/player r14 + punti r13 (contenuti-palinsesto, barra lavoro Home 0, /arm-wrestling 5 video).

## 29/10/2026 — Round 15: Channel 11–20 (banner originali), schede informative, Regia scheda, frecce su tutti i caroselli
- Banner originali (10) in `public/channel/loghi/originali/tbh/<slug>.apng` + JPEG `public/channel/loghi/tbh/<slug>.jpe`, interi (`object-fit: contain`, sfondi originali — anche bianchi —, nessun marchio aggiunto; #17 Giovanile senza TBH).
- Abbinamento per contenuto: 11 touch-miss-cool, 12 touch-project (NUOVO), 13 touch-hugoland, 14 touch-spotlight (NUOVO, → /tbh/p/touch-spotlight), 15 touch-casting, 16 touch-lavoro, 17 giovanile-rimini-show, 18 touch-reality-show, 19 touch-motorsport, 20 touch-travels. Nessun doppione (0 «slug doppio»), nessun terzo «Touch Reality Show».
- Decisioni: #24 touch-lavoro → banner nuovo come logo (variante `tbh`), titolo «Touch Lavoro Channel», banner HR resta registrato, collegamento HR `/tbh/societa/tbh-a03` invariato. #26 → variante `tbh`, titolo «Touch Reality Channel», promo 19/10 resta in `src`. Miss Cool → appartenenza TBH (banner co-firmato), da «altri» a `home-tbh`, pagina `/eventi/miss-cool` invariata. CHANNEL_HOME (28) invariato: Project/Spotlight/Miss Cool stanno in /channel (pagina 3).
- Pulsanti: «APRI CHANNEL» / «APRI SCHEDA» / «APRI IL SITO» (ex «VAI AL SITO»; solo se c'è un sito reale — oggi solo Giovanile → giovanilerimini.org).
- Scheda pubblica `/channel/scheda/:slug`: sezione `#informazioni-channel` (appartenenza, descrizione, servizi, telefono, WhatsApp, e-mail, social, indirizzo/Maps, indicazioni, gruppi Travels/Motorsport). Dati mancanti = «da fornire». Base in `src/api/data/channel-schede.ts`.
- Regia `/allestimento/channel` → GESTISCI: nuovo form «Scheda informativa · separata dal palinsesto» (`channelRegistroAdmin.impostaScheda`, chiave condivisa `cms_v1:canali`); poi il palinsesto (URL video/immagini/spot, durata, ordine; vuoto = «PALINSESTO IN PREPARAZIONE»). Errori di validazione con frase comprensibile.
- Caroselli: hook comune `useFilaScorrevole` + `FrecceFila` + `FilaConFrecce` (carosello-orizzontale.tsx). Desktop: frecce affiancate (non più sopra le schede). Telefono: barra INDIETRO/AVANTI sotto la fascia. Spente ai limiti, tastiera ←/→, swipe. Applicato a CaroselloOrizzontale, RulloTbh (+ IN EVIDENZA di home classica e /check-web/regia), catalogo musica, casting, annuncio 3 collaboratori, segui-diretta, carrellata ambienti (non montata), parete monitor Touch Talent. Non montati e lasciati: LoghiBrandNastro, BloccoSchede. Le linguette (giorni, filtri) non sono caroselli.
- Collaudo: Playwright desktop/tablet/mobile 0 pageerror, 0 scroll orizzontale di pagina, 0 frecce sovrapposte; Regia scheda salva→ricarica→pubblico ok, poi svuotata (cms_v1:canali `{"extra":[],"modifiche":{}}`, 0 righe TEST). Checks: tsc 0/25/4 note, build ok, md5 68 file ok, lint solo «scansione».
- www al 29/10: ancora 55 channel → round 14 e 15 NON pubblicati. Dopo Publish: verificare round 13, 14, 15 su www.
- Da fornire: descrizione/servizi Touch Project e Spotlight, indirizzi/Maps/indicazioni, social specifici per Channel, siti reali degli altri Channel.

## 04/11/2026 — Round 16: uscite musicali, scheda brano, calendario uscite, Touch Music Records Channel
- Dati: chiave condivisa `cms_v1:uscite` (settings, nessuna tabella nuova) → stessa scheda su anteprima e www, resta dopo Publish. Regole in `src/api/data/uscite-musicali.ts`; API `src/api/routes/uscite-musicali.ts` (`usciteMusicali.elenco`, `usciteMusicaliAdmin.elenco/salva/rimuovi/creaBrano`).
- Campi per uscita: tipo (singolo/album), data di uscita (solo a mano, mai dedotta dai link; vuota = «Data da confermare»), etichetta discografica, messaggio senza link (default «Collegamenti di ascolto in arrivo»), nota materiali. Per link: piattaforma (HyperFollow, Spotify, Apple Music, Amazon Music, YouTube Music, video ufficiale YouTube, Deezer, Tidal, altro store, Facebook/Instagram/TikTok con «profilo ufficiale» o «link del brano»), data programmata, disponibilità confermata, ultima verifica, nota verifica. Controlli: https, dominio per piattaforma, HyperFollow = distrokid.com/hyperfollow/…, un link di brano non può stare su due uscite (CONFLICT).
- Pagine nuove: `/musica/brano/:id` (ogni brano del catalogo; audio/video solo se esistono, altrimenti «non ancora disponibile»), `/musica/calendario-uscite` (per mese + «Data da confermare»). Catalogo: «Apri scheda» su ogni card + pulsanti uscita sui brani senza audio. `/musica` e `/musica/jc-hugo`: «Uscite · singoli e album» + «Area musica · collegamenti». `/radio`: + Calendario uscite + Touch Music Records Channel (senza doppioni).
- Channel: NUOVO `touch-music-records` («Touch Music Records Channel», banner co-firmato TBH `public/channel/loghi/tbh/touch-music-records.jpe`, fuori elenco HOME; CHANNEL_HOME 28 invariato). `touch-music-channel` collegamenti ampliati. Marchio TBH Records della pagina artista invariato.
- Asset (originali JPEG non ritoccati): `public/musica/records/touch-music-records-channel.jpe`, `public/musica/records/touch-music-records.jpe` (il testo «TOUCH MUSIC» è bianco su fondo chiaro nel file → illeggibile, non usato in pagina; chiesto file su fondo scuro/trasparente), `public/musica/uscite/e-ora-di-derby.jpe`.
- Dati reali: `mus-rzjkxt50` «TBH - Happy Birthday Anthem (feat. Touch Music Channel)» (DJ J.C. Hugò, singolo, cover assente, 1 link HyperFollow con trattino lungo, disponibilità NON confermata, nessuna data: pagina DistroKid protetta da Cloudflare, non verificabile). `mus-2wnp6qmd` «È ora di derby!» (cover consegnata, etichetta Touch Music Records, 0 link → «Collegamenti di ascolto in arrivo», nota «Audio e videoclip in arrivo.»). Catalogo 257 → 259.
- Pannello: `/allestimento/musica` → tab «Uscite e store» (anche `?vista=uscite`): crea brano+scheda, scheda per brano esistente, editor uscita con righe link, errori in italiano, Togli scheda.
- Collaudo: API (dominio errato, http, HyperFollow fuori percorso, altro store senza nome, codice errato, brano inesistente, titolo doppio, link HB su Derby → 409); UI admin crea→link errato bloccato→salva→ricarica→scheda/calendario/artista/catalogo ok; conflitto mostrato; TEST rimosso (uscita + brano). Playwright desktop/tablet/mobile 0 pageerror, 0 scroll orizzontale. Shots `/home/user/shots/r16-*`.
- Mancano (da Claudio): audio e video di «È ora di derby!», cover di Happy Birthday Anthem, link store diretti, logo Touch Music Records su fondo scuro.
- www: round 14, 15, 16 NON pubblicati. Dopo Publish verificare r13–r16 su www.

## 04/11/2026 — Round 17: NUOVE USCITE DISCOGRAFICHE, Discografia, Happy Birthday Anthem completo
- Sezione permanente `NuoveUsciteDiscografiche` (`src/web/components/discografia.tsx`): carosello di copertine 1:1 dalla più recente (data decrescente, senza data in fondo), legge `cms_v1:uscite` → una nuova uscita salvata da «Uscite e store» entra da sola. Montata subito sotto il player in `/channel/play/touch-music-records` e sotto il monitor in `/channel/scheda/touch-music-records`. Pulsanti per card: ASCOLTA (→ scheda#ascolta, solo se ascoltabile) · APRI SINGOLO/APRI ALBUM · TUTTE LE PIATTAFORME (→ scheda#piattaforme, solo con link verificati) · CONDIVIDI. Copertina intera, nessun badge sopra.
- Pagina nuova `/musica/discografia` (`pages/discografia.tsx`): logo Records originale, carosello, sezioni Singoli pubblicati · Album pubblicati · Prossime uscite · Produzioni DJ J.C. Hugò · Videoclip e contenuti promozionali. Ricorrenze (Natale/Capodanno/compleanno/Avvento) = solo badge, mai raggruppate in album.
- Scheda brano: player Spotify ufficiale (`#ascolta`, attributi esatti di Claudio, solo da link Spotify CONFERMATO), dati di pubblicazione (artista distribuito, distribuzione, genere, ISRC, UPC), badge stato/ricorrenza, ASCOLTA · TUTTE LE PIATTAFORME · CONDIVIDI · DISCOGRAFIA, `#piattaforme` sulla tabella, scroll all'ancora al caricamento.
- Regola nuova: un servizio compare come pulsante solo con «Disponibilità confermata»; altrimenti chip «In verifica: …» senza link.
- Dati uscita (tutti facoltativi, stessa chiave): artistaDistribuito, distribuzione, isrc (controllo formato), upc (12–13 cifre), stato (null = automatico dalla data), ricorrenza, produzioneJcHugo; ISRC/UPC unici fra le uscite (409). Dal pannello si modificano anche titolo/artista/cover/genere del brano (solo brani `brani_master`; controllo doppioni sul titolo). Piattaforma nuova «iTunes».
- Pannello «Uscite e store»: campi nuovi con errori ISRC/UPC in tempo reale, stato, ricorrenza, «Produzioni DJ J.C. Hugò», blocco «Dati del brano».
- Navigazione: «Discografia» nei collegamenti di touch-music-records e touch-music-channel (`channel-registro.ts`), nei collegamenti radio (`canale-touch.tsx`), in `VOCI_MUSICA` (Area musica), nello zapping (pulsante in alto nel pannello: in basso a destra lo copre il badge Runable). Anteprime condivisione statiche per `/musica/discografia` e `/musica/brano/mus-rzjkxt50`.
- Asset: `public/musica/uscite/tbh-happy-birthday-anthem-3000.jpe` (master 3000×3000 dall'artwork ufficiale Apple Music, invariato) + `tbh-happy-birthday-anthem.jpe` (1000×1000, usato in pagina).
- Dati `mus-rzjkxt50`: singolo, 2026-11-02, artista sito «DJ J.C. Hugò», artista distribuito «J. C. Hugò Deejay», DistroKid, ISRC QTAEV2679933, UPC 700149429129, Electronic / Dance / House, ricorrenza compleanno, etichetta «Touch Music Channel» (dalla copertina ufficiale). Link verificati il 04/11/2026: HyperFollow (URL NUOVO; il vecchio con trattino lungo restava sulla verifica Cloudflare), Spotify, Apple Music, iTunes (?app=itunes). Stesso id link HyperFollow (nessun doppione).
- Collaudo: API (ISRC errato 400, UPC errato 400, ISRC doppio 409, titolo doppio 409; Derby invariato), UI admin (precompilazione, errore ISRC blocca il salvataggio, salva ok), click ASCOLTA da carosello → scheda#ascolta, zapping → Discografia (mobile). Playwright desktop/tablet/mobile su 9 pagine: 0 pageerror, 0 scroll orizzontale. Shots `/home/user/shots/r17-*`.
- Mancano (da Claudio): audio/video «È ora di derby!», logo Touch Music Records su fondo scuro, conferma dell'etichetta.
- www: round 14–17 NON pubblicati. Dopo Publish verificare r13–r17 su www (desktop e mobile) + «Importa da staging».

## 04/11/2026 — Round 18: tutti i Channel in Home, guida e zapping; galleria immagini per scheda; posizioni in blocco senza limite
- Causa: la home live (`canale0` → `CheckWebHomeOrdinePage inHome`) mostrava solo i 28 di Home 0 + Touch Talent; Records e altri 35 Channel del registro stavano solo su `/channel`; `/guida` e zapping leggevano solo `CANALI` (~25).
- Home: nuova sezione «TUTTI GLI ALTRI CHANNEL · N» (`home-altri-channel`) dopo le file A–E, per sezione (HOME TBH, NOVA TV, BEST ENTERTAINMENT, ALTRI), paginata 15 per pagina, senza tetto. I 28 invariati. Records = HOME TBH pos. 2.
- `/guida` + zapping: `components/guida-registro.tsx` (50 voci dal registro, salta spazi vuoti e doppioni con `CANALI`/catalogo CMS).
- Scheda Channel: «IMMAGINI UFFICIALI · N» (`immaginiDelChannel`): Records 3, Touch Music Channel 2, Lavoro 2, Village 2, squadre DM 2 (DM TV + stemma), Rimini 1.
- Allestimento → CHANNEL E PAGINE → «Posizioni in blocco · nessun limite»: `contenutiAdmin.aggiungiSpazi` (1–200 per volta, ripetibile) e `rimuoviSpaziVuoti` (copia di sicurezza prima). Test con 100 spazi (164 voci, altri 8 pagine) poi rimossi (copia 1793786203053) → registro 64.
- Componenti: `components/tessera-registro.tsx` (TesseraRegistro, SezioneRegistro, ETICHETTA_STATO).
- Collaudo Playwright desktop/tablet/mobile: schede, /guida, /channel, home, zapping→/channel/play/touch-music-records, pannello; 0 pageerror, 0 scroll orizzontale; regressioni pw17 ok. Check 1–7 ok, bundle `index-Do3Ra4U_.js` (www ancora `CTG8tdXF`).
- Palinsesti: 50 Channel del registro su 64 senza contenuti attivi (CMS: 0 schede/0 posizioni/0 playlist). Nessun contenuto inventato.
- Mancano (da Claudio): contenuti dei palinsesti, logo Records su fondo scuro, conferma etichetta, logo Junior Gambettola, loghi Mondo Olistico e Touch Spot.

## 09/11/2026 — Round 19: TOUCH SOCIAL — directory social gestita da pannello
- Pagina `/contatti-social` (stesso URL; `/social` vi rimanda): «TOUCH SOCIAL — SEGUICI OVUNQUE!», banner «UN LIKE NON COSTA NULLA…», In evidenza, ricerca, filtri piattaforma/categoria/tipo/persone-pagine-canali (filtri senza profili nascosti), card con verbo giusto per piattaforma, ANTEPRIMA (solo embed ufficiali YouTube/FB page plugin/Spotify/Apple Music, altrimenti scheda info), APRI, CONDIVIDI, COPIA LINK, QR, PREFERITI (localStorage `tbh-touch-social-preferiti`), deep link `?voce=<id>`. `SlotContenuti social:pulsanti` mantenuto.
- Dati: `src/api/data/touch-social.ts` (45 voci; 10 FB Ugolini attive; nessun rosso fuori DM). API `src/api/routes/touch-social.ts`: `touchSocial.{elenco,collegati,registraClic}`, `touchSocialAdmin.{quadro,salva,rimuovi,ripristina,importaUrl,metadati,verificaLink,ordina}`. Archivio `cms_v1:social`, clic aggregati `cms_v1:social_clic` (azzerato dopo i test). Lettura OG fino a 2,5 MB (YouTube mette i meta oltre 800 KB).
- Controllo link giornaliero: segnala, non cancella. 404 → resta in archivio, fuori pagina: `x-reteromatvradio`, `youtube-giovanile-rimini`. Instagram 429, FB share/wa.me 400, FB pagine → login: «non verificabili dal server», restano visibili.
- Pannello `/allestimento/touch-social` (card in Allestimento): aggiungi/modifica/togli (copia di sicurezza prima)/ripristina, import URL, metadati, verifica, ordine, evidenza/campagna, collegamento a più Channel/pagine, statistiche.
- Collegamenti: menu, footer, ambienti, Contatti (pulsante + SocialCollegati `/contatti`), Home canale0 e `/channel` (StrisciaTouchSocial), schede Channel (SocialCollegati per slug, es. dm 3, touch-music-records 4).
- Collaudo Playwright desktop/tablet/mobile ok, 0 pageerror; regressioni pw17/pw17ui/pw17z/pw18b/pw18c/pw18d ok. Nota: `/channel/scheda/dm` su tablet 820 → viewport 856 già prima di questo round (non dipende da TOUCH SOCIAL). Check 1–7 ok, bundle `index-fqgVszES.js` (www ancora `CTG8tdXF`).
- Mancano (da Claudio): LinkedIn pagina aziendale, BIGO (codice invito 10573217228), OK.ru, TikTok 2, VK/Pinterest/TopTop/Twitch/Discord/Spotify/Apple Music; conferma @touchveejay vs @touchtvlegal e link Telegram; link corretti per ReteRomaTvRadio su X e YouTube Giovanile Rimini.
