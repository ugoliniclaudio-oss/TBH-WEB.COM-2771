# MASTER LIST TBH — Stato di attuazione

Documento madre archiviato in `docs/master-list.md` (51 punti + regola finale, base vincolante).
Questo file è la mappa **già fatto / da fare**. Si aggiorna, non si riscrive.

Legenda: ✅ fatto · 🟡 parziale · ⬜ da fare · 🔒 bloccato su materiale di Claudio

---

## Fondamenta (01–02)

| # | Punto | Stato | Note |
|---|---|---|---|
| 01 | Portale multi-funzione (media, network, directory, sport, shop, adv, job, community) | 🟡 | Online: Home, Shop, TBH, Network hub (`/network`), Media, Sport hub (`/sport`), Eventi, Territorio, Job & Casting, Crew & Academy (`/crew-academy`), Business Desk (`/business-desk`), Community (`/community`), Streaming hub (`/media/streaming`), ricerca globale (`/cerca`). Manca: Advertising engine |
| 02 | Anti-doppione — crea una volta, collega ovunque | ✅ | Registro unico in `data/registro.ts` + pagina `/tbh/registro`: 125 entità con ID stabile, qualifiche multiple, anagrafiche di origine e link a tutte le pagine dove compaiono. 3 doppioni già risolti (R.F.A. società+squadra, Touch Restaurant attività+luogo+Circuito, Copacabana Beach luogo+prospect) |

## Mondo TBH (03–07)

| # | Punto | Stato | Note |
|---|---|---|---|
| 03 | Società con P.IVA | ✅ | 8 società con P.IVA e codice TBH su `/tbh/societa`; separazione netta dalle attività tramite la nuova pagina `/tbh/attivita` e la procedura `tbh.entita` |
| 04 | Attività senza P.IVA (Touch Fashion, Miss Cool, Hugoland, J.C. Hugò…) | ✅ | `ATTIVITA_GRUPPO` + pagina `/tbh/attivita` (voce di menu sotto TBH) e inserimento nel Registro unico con qualifica «attività». Codici TBH mancanti restano `null`: nessuna attività promossa a società |
| 05 | Produzioni (Touch TV, Music, Cinema, Influencity Magazine, Reality, Miss Cool) | ✅ | Pagina `/tbh/produzioni` online: Touch Production, Metropolitan Media, Communications, Touch TV, Music TV, Music Radio, Cinema + Reality Show e HEDDY con pagina propria |
| 06 | Servizi con indicazione di chi eroga | ✅ | `/tbh/servizi` raggruppa i servizi per settore indicando erogatore, codice TBH e P.IVA |
| 07 | Prodotti separati dai servizi, ognuno con CTA | ✅/🟡 | 17 prodotti nello Shop; CTA WhatsApp precompilata da aggiungere (v. 23–24) |

## Network e Circuito (08–09)

| # | Punto | Stato | Note |
|---|---|---|---|
| 08 | Qualifiche multiple (cliente, sponsor, partner, media partner, location…) | ✅ | Pagine `/network/clienti`, `/network/sponsor`, `/network/partner` + registro `/tbh/registro`: 12 qualifiche (società, attività, produzione, prodotto, squadra, luogo, Circuito TBH, prospect, cliente, partner tecnico, media partner, programma TV) assegnabili alla stessa entità |
| 09 | Circuito TBH in massima evidenza | ✅ | `CircuitoBanner` random + pagina `/network/circuito` con i luoghi del circuito raggruppati per categoria e CTA vetrofania |

## DM Comunicazioni e Media (10–15)

| # | Punto | Stato | Note |
|---|---|---|---|
| 10 | Pagina DM, separata dalle società TBH, solo logo ufficiale | 🟡 🔒 | Pagina online su `/media/dm`: DM è media partner autonomo, NON società TBH. Logo assente per scelta (monogramma + nota) finché non arriva quello ufficiale |
| 11 | 4 programmi DM + Calcio di Rigore lun 19:45 con stati automatici | ✅ | `/media/dm/:slug` per i 4 programmi, stato calcolato sull'ora italiana (PROSSIMAMENTE/QUESTA SERA/ORA IN DIRETTA/RIVEDI) + data prossima messa in onda. Orari degli altri 3: «da confermare» |
| 12 | 9 società sportive seguite | ✅ | 10 voci in `TEAMS` con link ufficiali verificati. Rimini: sito `null` da riconfermare. Loghi ufficiali mancanti → monogramma |
| 13 | Radio media partner (5) | 🟡 | Elencate in `RADIO` dentro `/media` |
| 14 | HEDDY.video | 🟡 | Pagina `/media/heddy-video` online, catalogo in allestimento |
| 15 | Reality Show Giovanile Rimini | 🟡 | Pagina `/media/reality-show` online; 5M visualizzazioni indicate come case history dichiarata, da documentare |

## Brand (16–17)

| # | Punto | Stato | Note |
|---|---|---|---|
| 16 | Touch Fashion | 🟡 | Pagina `/tbh/touch-fashion` online (attività senza P.IVA) |
| 17 | Miss Cool / Miss & Mister Cool | 🟡 | Pagina `/eventi/miss-cool` online; regolamento e tappe da fornire |

## Territorio (18–20)

| # | Punto | Stato | Note |
|---|---|---|---|
| 18–19 | Database unico REGIONE → CITTÀ → CATEGORIA → ATTIVITÀ | 🟡 | `LUOGHI` (~33) + `TERRITORI` (12) + `/mappa`. Da unificare in una gerarchia sola con ~30 categorie e 11 regioni |
| 20 | Pagina attività/azienda completa con CTA | ⬜ | Oggi solo schede in griglia, nessuna pagina singola |

## Regole operative (21–23)

| # | Punto | Stato | Note |
|---|---|---|---|
| 21 | URL ufficiale subito se noto, mai «qui andrà il sito» | ✅ | Rispettato |
| 22 | Nessun bottone morto | ✅ | Catch-all → «Stiamo lavorando per voi» |
| 23 | WhatsApp commerciale con messaggio precompilato | ✅ | `lib/whatsapp.ts` + bottone «Ordina su WhatsApp» su ogni prodotto con nome, codice e PREZZO precompilati |

## Shop e pagamenti (24–28)

| # | Punto | Stato | Note |
|---|---|---|---|
| 24 | Flusso senza checkout → ORDINA SU WHATSAPP | ✅ | WhatsApp è sempre la CTA primaria; «Acquista con carta» compare solo se `checkout/status.configured === true` |
| 25 | Flusso con checkout Stripe (account esistente) | ✅ 🔒 | Codice pronto, manca `STRIPE_SECRET_KEY` |
| 26 | Modalità di pagamento e finanziamento | ✅ 🔒 | **Area dedicata `/pagamenti`** (+ alias `/finanziamenti`, `/touch-pay`) alimentata da `api/data/pagamenti.ts` — 13 modalità in 5 gruppi con istruzioni passo passo: Stripe · PayPal · Revolut · Wise · Bonifico SEPA · Satispay · BANCOMAT Pay · Poste Italiane · Klarna · Scalapay · HeyLight · JataPay · Johix. `components/pagamenti.tsx` legge la stessa fonte (una sola verità) e rimanda a `/pagamenti`. Domini ufficiali verificati; Satispay/BANCOMAT Pay/JataPay/Johix restano «link ufficiale da confermare» finché Claudio non conferma account e referral. Nessun IBAN, TAEG o numero di rate pubblicato |
| 27 | Rateizzazione o «RICHIEDI FINANZIAMENTO» via WhatsApp | ✅ | Bottone sui prodotti rateizzabili; messaggio WhatsApp con nome, codice e prezzo |
| 28 | Touch Plaza Shop: prodotti TBH vs esterni | 🟡 | Shop unico, da separare in due sezioni |
| — | Brand & Personalizzazioni (hub) + sottosezione «Brand in intervista · studio · diretta» | ✅ 🔒 | Hub `/tbh/brand-personalizzazioni` (aggiunto, nessuna sezione rimossa) + sottosezione `/tbh/brand-personalizzazioni/visibilita-in-onda`: 6 scene (Intervista 12 · Studio TV 16 · Programma sportivo 10 · Diretta 13 · Radio/Podcast 9 · Evento 10 = 70 posizioni numerate cliccabili), blocco PRIMA · DURANTE · DOPO, marchio dimostrativo «IL TUO BRAND», nessun prezzo, CTA «Richiedi una simulazione» su WhatsApp. Le 6 immagini sono simulazioni generate senza marchi: 🔒 da sostituire con foto reali studio/interviste DM |
| — | Loghi mancanti: nome per esteso + pulsante al sito (iniziali eliminate) | ✅ | `LogoBox` in `components/tiles.tsx` non usa più monogrammi/iniziali: dove il logo ufficiale manca mostra il nome completo + pulsante «Apri il sito» (o WhatsApp/scheda interna) + nota «Logo ufficiale da ricevere». Aggiornati tutti i call site (Home, Sport, Pagine TBH, Pagamenti, Produzioni, Attività, Registro, Brand, DM) |

## Livelli, lavoro, istituzioni (29–31)

| # | Punto | Stato | Note |
|---|---|---|---|
| 29 | 25 LIVELLI TBH (Essenziale → All Inclusive) | 🟡 🔒 | `/tbh/livelli`: 25 livelli per 5 fasce. Prezzi e benefit «da definire» — non forniti, mai inventati |
| 30 | Lavoro & Casting con annunci strutturati | 🟡 | `/lavoro-casting` online con 1 solo annuncio reale (PR Pride Village 2026) + candidatura spontanea |
| 31 | Link istituzionali (Impiego, SIUL, INPS, INAIL, AdE, CCIAA) | ✅ | `/istituzioni`: 3 gruppi di portali con URL verificati + disclaimer «TBH non è un ente pubblico» |

## Community, streaming, palinsesto, media library (32–39)

| # | Punto | Stato | Note |
|---|---|---|---|
| 32 | Community | 🟡 | Pagina `/community` con canali reali (WhatsApp, YouTube DM), iniziative e conteggi. Social ufficiali TBH e forum/area utenti: in attesa dei dati da Claudio |
| 33 | Streaming hub (embed/link fonte) | ⬜ | |
| 34–35 | Programmazione e ricorrenze | ⬜ | Serve per Calcio di Rigore |
| 36 | Media Library unica | ⬜ | |
| 37 | Loghi solo ufficiali, mai AI | ✅ | Fallback monogramma già attivo |
| 38 | Immagini caricate una volta sola | ✅ | `public/` |
| 39 | QR solo per accrediti/pass | ⬜ | |

## Advertising (40–42)

| # | Punto | Stato | Note |
|---|---|---|---|
| 40–42 | Motore campagne + carosello appuntamenti separato dal pubblicitario | 🟡 | Solo ticker e `CircuitoBanner`. Manca il motore targettizzabile |

## Struttura del sito (43–47)

| # | Punto | Stato | Note |
|---|---|---|---|
| 43 | Homepage a 10 blocchi, mai card duplicate | ✅ | Home rifatta sullo schema del mockup: fascia superiore, header con ricerca, menu 10 voci, hero + colonna LIVE, breaking news automatica, partner TBH/esterni, 10 macroaree, fascia media, accessi rapidi, shop, società sportive, servizi finanziari. Nessun dato del mockup copiato (contatti/P.IVA finti esclusi) |
| 44 | Menu TBH · NETWORK · MEDIA · SPORT · EVENTI · TERRITORIO · SHOP · LAVORO & CASTING | ✅ | Menu a 8 gruppi mantenuto e, in aggiunta (ordine 5), barra a 10 voci: Home · Touch Plaza · TBH Network · Media Hub · TV•Radio•Streaming · Community · Job & Casting · Crew & Academy · Sport Hub · Business Desk |
| 45 | Ricerca unica su tutte le entità | ✅ | `ricerca.cerca` + pagina `/cerca`: registro entità, prodotti, programmi DM, pagine TBH, territori, circuiti, radio/TV/riviste e sezioni del sito. Zero risultati → fallback WhatsApp |
| 46 | URL SEO (`/tbh/societa`, `/media/dm/…`, `/sport/…`) | 🟡 | Nuovi URL attivi; i vecchi restano come redirect, nessun link rotto. Da fare gli URL territoriali `/emilia-romagna/rimini/hotel` |
| 47 | CMS / back office | ⬜ | Lavoro grosso, da pianificare a parte |

## Qualità dei dati (48–51)

| # | Punto | Stato | Note |
|---|---|---|---|
| 48 | Stato dato: VERIFICATO / DA VERIFICARE / DA AGGIORNARE / NON PUBBLICARE | 🟡 | Usato a parole, non come campo strutturato |
| 49 | Link checker periodico con avviso backend | ⬜ | |
| 50 | Principio di allestimento: pubblica tutto ciò che è pronto | ✅ | |
| 51 | Crescita per aggiornamento progressivo, mai riscrittura | ✅ | Regola adottata: questo file è il controllo pre-consegna |

---

## Due conflitti che decide Claudio, non io

1. **Menu (punto 44)** — cambiarlo è veloce, ma cambia la navigazione già vista.
2. **URL SEO (punto 46)** — cambiare gli indirizzi rompe i link già condivisi. Proposta: creare i nuovi URL e lasciare i vecchi come redirect, così nessun link muore.

## Tre cose bloccate su Claudio

1. `STRIPE_SECRET_KEY` — senza, il checkout resta spento (il codice è già pronto).
2. Loghi ufficiali TBH e logo DM ufficiale — finché non arrivano, monogramma testuale.
3. URL playlist YouTube «Spot a Vista».

## Ordine di lavoro proposto

1. CTA WhatsApp precompilata su ogni prodotto (punti 23–24) — massimo valore, subito.
2. Registro entità unico `data/tbh.ts`: società / attività / produzioni / servizi / prodotti senza doppioni (02–07).
3. Pagina DM + 4 programmi con stato automatico Calcio di Rigore (10–11).
4. Le 9 società sportive seguite (12).
5. 25 Livelli TBH (29).
6. Touch Fashion, Miss Cool, Reality, HEDDY.video (14–17).
7. Lavoro & Casting + link istituzionali (30–31).
8. Menu e URL SEO, dopo approvazione (44, 46).
9. Advertising engine, ricerca unica, CMS (40–42, 45, 47).


## Ecosistema in 8 fasi — completato il 29 agosto 2026
✅ FASE 1 pagina entità `/e/:slug` · ✅ FASE 2 Home vetrina nell'ordine del mockup ·
✅ FASE 3 schede prodotto `/shop/p/:slug` e servizio `/shop/s/:slug` ·
✅ FASE 4 `/club` con prezzi definitivi €72 / €91,50 / €915 e i 25 Livelli `/tbh/livelli/:slug` ·
✅ FASE 5 `/hospitality` e `/tbh-assist` · ✅ FASE 6 `/offerte` (motore pronto, nessuno sconto inventato) ·
✅ FASE 7 edicola `/influencity` dal N°0 Giugno/Luglio 2022 + `/news` · ✅ FASE 8 menu esteso e ricerca.
🔒 In attesa: offerte e codici reali, prezzi dei Livelli, copertine del magazine, loghi e foto ufficiali, chiave Stripe.

## PORTALE A MONITOR — 29 agosto 2026
✅ Area Sport: template unico `/sport/squadre/:slug` per 11 società (monitor partita/highlights,
   prossima partita, risultati, classifica, calendario — strutture visibili e dichiarate VUOTE,
   nessun dato sportivo inventato) · ✅ `/sanremo` con mappa a pin e 9 luoghi + pagine interne ·
✅ `/musica/jc-hugo` (Suno, playlist YouTube, Facebook: solo link confermati) ·
✅ Home con sezioni-monitor aggiunte sotto i blocchi esistenti · ✅ menu + Area Sanremo e Musica.
🟡 Loghi: solo lo stemma ufficiale ASD Verucchio 1957; per le altre società compare il nome per esteso.
🟡 Foto Sanremo: reali solo Teatro Ariston, Palafiori, Piazza Bresca (3 su 9).
🔒 In attesa: URL dei monitor, loghi e foto ufficiali mancanti, risultati/classifiche/calendari,
   stato commerciale reale degli spazi, social ufficiali, discografia J.C. Hugò.

## SIGILLO DM + DM CREW (29/08/2026)
- ✅ Logo ufficiale DM Comunicazioni integrato (`/brand/dm-comunicazioni.jpg`) su `/media/dm` e sul sigillo.
- ✅ Sigillo «Squadra seguita da DM» su card Home e testata pagina squadra (solo dove DM risulta realmente tra i media).
- ✅ `/media/dm/crew` — album figurine operatori/giornalisti (2 confermati + 6 slot dichiarati).
- 🟡 Foto reali delle figurine DM Crew: da ricevere (nessun avatar generato).
- 🟡 Elenco completo operatori/giornalisti DM (nomi legati al Reality Spagna esclusi: da confermare).
- 🔒 Stemmi ufficiali delle società sportive: ricevuti solo Verucchio 1957 e DM. I mockup contengono stemmi IA, non utilizzabili.

## STEMMI + MONITOR CON URL + FRECCE — 29/08/2026

✅ Stemmi squadre estratti dai mockup e installati in `/teams/` (8 nuovi + Verucchio già ufficiale) — provenienza dichiarata in pagina.
⬜ `imolese`, `rfa-rimini-football-academy`: nessun materiale ricevuto, logo non pubblicato (niente monogrammi inventati).
✅ Monitor con SPAZIO URL su pagina squadra (partita integrale + highlights), J.C. Hugò (per brano) e luoghi di Sanremo.
✅ Frecce avanti/indietro: tra squadre, tra luoghi di Sanremo, tra brani.
✅ Blocchi dati squadra dichiarati: risultati, classifica, prossimo turno, marcatori, diffidati, giocatore della settimana, prossima partita.
✅ Spazi commerciali squadra con rete TBH / DM / TBH + DM.
✅ Blocco «Scarica l'app ufficiale» dichiarato in allestimento, senza badge App Store/Play finti.
✅ Sanremo: 6 luoghi geolocalizzati su coordinate reali (OpenStreetMap sugli indirizzi in scheda) + mappa ufficiale incorporata.
🟡 3 luoghi di Sanremo non posizionati: Hotel Des Anglais, Morgana Bay (indirizzo da confermare), Piazza Borromea (nome/indirizzo da confermare).
🔒 Bloccati su Claudio: URL reali dei monitor (partita, highlights, archivi, brani), titoli dei brani di J.C. Hugò, indirizzi esatti dei 3 luoghi, stemmi vettoriali se quelli dai mockup non corrispondono.

## STEMMI NELLE LISTE — 29/08/2026

✅ `/sport/squadre`: stemmi di tutte le società con logo (9), card con colore sociale, badge, sigillo DM.
✅ Home: sezione squadre estesa da 5 a 11 società.
✅ Allineati i 2 loghi vecchi di `catalog.ts` alle versioni nuove.
🔒 Imolese e RFA Rimini Football Academy: nessuno stemma ricevuto → nome per esteso, nessuna ricostruzione.
🔒 Stemmi vettoriali ufficiali: se un file estratto dai mockup non corrisponde, va sostituito.

## TOUCH TRAVELS · FIERE INTERNAZIONALI — 29/08/2026

✅ Pagina `/touch-travels` con 14 tappe estere raggruppate per paese (DE, PL, AT, CZ, SK).
✅ 5 siti ufficiali + 4 indirizzi verificati, link mappa solo dove l'indirizzo è verificato.
🟡 Periodi di tutte le tappe: «da confermare» (cronologia CV non certificata, in blocco separato).
🔒 Hotel Golem Praga e Four Points by Sheraton Bratislava: struttura non identificata, nessun link.
🔒 Fiere/eventi specifici, elenco Motel One e hotel partner, foto reali delle tappe.

## TURNO 29/08/2026 — date confermate, nuove tappe, video YouTube reali, Academy Reality

- ✅ Touch Travels: 33 tappe, 4 date confermate dalla direzione, punto mappa = centro storico dove l'indirizzo non è noto, video ufficiale Touch Travel nei dati API.
- ✅ Musica: catalogo reale dal canale Touch Music Radio TV (40 brani DJ Hugò, 16 sigle/spot, 6 servizi cinema, 3 video sport).
- ✅ Reality Show Rimini: 2 link ufficiali verificati + nuova pagina Academy & reclutamento.
- 🟡 Da confermare: Hotel Golem (Praga), Four Points by Sheraton (Bratislava), «Cosecha», terzo canale Reality Show, Instagram e TikTok, nome fiera per ogni città, indirizzi esatti, etichetta dei 2 video Verucchio (partita integrale o highlights?).

## TURNO 29/08/2026 — Media Library e censimento media

- ✅ Media Library TBH `/media/libreria`: tracciato di importazione massiva CSV/JSON, 14 categorie, 13 record verificati con fonte e stato.
- ✅ `/media/radio-tv`: m2o, Radio Deejay, Radio 105, RTL 102.5 (siti ufficiali verificati) + Showrunner Cinema Radio TV.
- 🟡 Da ricevere: URL Facebook Casting/Lavoro, profilo Facebook pubblico di Claudio (non /share/), loghi ufficiali delle emittenti, frequenze/DTT/app/Instagram, fotografie con provenienza dichiarata.

## Aggiornamento 29/08/2026 — Rimini territorio · Imolese eliminata · menu unico · nastro stemmi · highlights DM
- ✅ Imolese Calcio 1919 eliminata del tutto (anagrafica + Home + liste). Restano 10 società.
- ✅ Rimini Calcio: NON più fra le squadre seguite da DM. Ora "Società di calcio di interesse del territorio" (campo `territorio`), senza video DM e senza sigillo DM.
- ✅ Menu unificato: da tre barre a una. Topbar = solo contatti reali; tendine desktop da un'unica sorgente MENU; una sola barra scorrevole + "Tutte le sezioni".
- ✅ Nastro stemmi alternati DM → squadra, ordine random, Rimini escluso. Su Home, /sport/squadre, /sport/highlights-dm.
- ✅ Highlights scorse stagioni: video reali dal canale ufficiale Daniele Manuelli abbinati in automatico alle società. Hub /sport/highlights-dm + blocco Home + sezione nella pagina società.
- ✅ Corretto il percorso rotto del logo DM (/media/dm-logo.png inesistente → /brand/dm-comunicazioni.jpg).
- 🔒 Restano da Claudio: stagioni/annate dei video (YouTube non le espone), URL monitor sportivi, stemma RFA, loghi vettoriali ufficiali.

### 29/08/2026 — Menu pratico e Hugoland
- ✅ Voci chiave fuori dalle tendine (barra EVIDENZA): Touch Plaza Shop, DM Comunicazioni, Hugoland, Sport, TBH Club.
- ✅ Titoli dei mondi cliccabili + stato attivo esteso alle sotto-pagine + transizioni morbide.
- ✅ «Fiere internazionali» rinominata **Hugoland** (etichette e titolo pagina); rotte storiche invariate + alias /hugoland.
- 🔒 In attesa: logo ufficiale Hugoland e conferma del rapporto fra Hugoland fiere internazionali e Hugoland di J.C. Hugò.

## Turno 13 (29/08/2026) — Identità visiva ufficiale
- ✅ Logo ufficiale TBH (tondo) in header, footer, favicon e og:image.
- ✅ 11 marchi del gruppo ritagliati dal layout ufficiale su fondo nero e pubblicati come fascia
  cliccabile (Home, /media, /musica).
- ✅ Skyline/paesaggi randomizzati disegnati in codice come sfondo di sezione (Home, /musica,
  /influencity, /touch-travels).
- ✅ Locandina ufficiale Deejay Hugò su /musica/jc-hugo.
- ✅ Copertina reale Touch Influencity N°31 · Gennaio 2025 in edicola.
- ✅ Logo Hugoland Music Festival su /touch-travels.
- 🔒 Layout J.C. Hugò e scheda servizi Deejay Hugò: salvati, NON pubblicati (Claudio deciderà dove).
- 🔒 Da chiarire: N°31 vs N°30 per Gennaio 2025; rapporto Hugoland fiere ↔ Hugoland Music Festival.

### Turno 14 (29/08/2026)
- ✅ Favicon ufficiale dal logo olografico inviato da Claudio (512/256/180 + ritaglio tondo trasparente).
- ✅ Card Open Graph 1200x630 su misura (logo + skyline in codice + payoff) collegata in index.html con og/twitter tags.
- 🟡 Da confermare: leggibilità favicon a 16-32 px (alternativa: solo monogramma TBH).

## Aggiornamento 29/08/2026 (turno 15)
- ✅ Logo MASTER TBH: versioni fondo bianco, cromato, neon, neon su bianco in /brand/loghi/. Favicon 512/256/180 + apple-touch-icon rifatte. Card OG doppie (nera e bianca).
- ✅ Menù riordinato nei 10 mondi voluti da Claudio (HOME · TBH · SERVIZI · MEDIA · EVENTI · BUSINESS · SHOP · COMMUNITY · LAVORO · CONTATTI); barra mobile derivata dallo stesso array.
- 🟡 Rimossi i 5 chip in evidenza (duplicavano voci delle tendine): ripristinabili su ordine di Claudio.
- ✅ Regola «MI TROVI QUI» attiva: sito ufficiale → pagina interna → Google Maps. Applicata a fiere internazionali (33), Sanremo (9 + schede), schede squadra, contatti.
- ✅ Nuova pagina /contatti con i soli contatti reali.
- ✅ Touch Music Radio TV / Touch Production Ltd: dati canale, Suno, 9 aree di produzione, selezioni aperte, 3 siti e 8 social pubblicati su /musica (fonte: scheda inviata dalla direzione il 29/08/2026).
- 🔒 Da confermare: proprietà/DNS di TBH-WEB.COM, claim definitivo, OG/favicon di default (bianco o cromato), dato ambiguo «2.2K 23» della scheda Suno, indirizzo sede per /contatti.

### 30/08/2026 — turno 17
- Menù unico (barra rapida fissa rimossa). Footer con caroselli orizzontali. Contatore reale in alto in home.
- /tbh-app: download e archivio. Manca: brand book, listini, presentazione PDF, conferma app store.
- /management: indice contratti senza testi legali. Manca: modelli validati, CCNL applicato, intestazione societaria, decisione su accesso riservato.

## 04/09/2026 — HVS
- pages/hvs.tsx collegata: rotta /hvs + alias /high-visibility-scout (redirect).
- Locandina hvs-annuncio.png PRIMA del testo; logo ufficiale hvs-logo.png (quello generato dall%s agente e scartato).
- Blocco corso HVS aggiunto DENTRO crew-academy.tsx (sezione aggiuntiva, nulla rimosso): 4 settimane, 72 EUR, caparra 250/500/1000, +25%, cashback, primi 3 assunti; regolamento "in consegna".
- Verificato a video: /hvs h1 ok, immagini naturalWidth 1448/1672, 0 errori console; /crew-academy blocco corso presente, link a /hvs#corso funzionante.
- salvaLink (immagine via URL) provato via API: salvata e riletta da perSlot, poi eliminata. Archivio pulito.
- lint 0 errori, build exit 0.
- APERTO: punto (1) di Claudio, pulsanti con logo+titolo+link.

## 04/09/2026 — Loghi ufficiali TBH-WEB.com (icona + favicon)
- Ricevuti da Claudio: icona quadrata 1254x1254 e logo orizzontale 1536x1024.
- Salvati in public/brand/: tbh-icona-app.png, tbh-logo-orizzontale.png (usati come sono, non ridisegnati).
- Rigenerati dallicona: favicon.png 512, favicon-256.png, favicon.ico (64/48/32/16), apple-touch-icon.png 180.
- Nuova immagine di condivisione og-tbh-web.png 1200x630 dal logo orizzontale su fondo nero.
- index.html: favicon.ico dichiarata, canonical https://tbh-web.com/, theme-color #0d0d0d, og:url e og/twitter image su tbh-web.com.
- lib/loghi-tbh.ts: nuovi export LOGO_TBH_ICONA e LOGO_TBH_ORIZZONTALE; entrambe le versioni aggiunte a LOGO_TBH_VERSIONI (pagina brand).
- Icona ufficiale al posto della lettera T nellheader; usata anche in footer e /contatti (angoli arrotondati, non tonda: non taglia le lettere TBH).
- Verificato a video: naturalWidth 1254x1254, canonical e og corretti, 0 errori console; favicon.png/-256/.ico/apple-touch/og-tbh-web tutti 200.
- lint 0 errori, build exit 0.
- NON toccata la foto reale del CEO su /cv: se intendevi anche quella, dimmi quale immagine metterci.

## 04/09/2026 — Annuncio HVS pubblicato nelle pagine del lavoro
- `api/data/tbh.ts` → nuovo annuncio in cima a `ANNUNCI`: slug `tbh-high-visibility-scout`, stato `verificato`, scadenza `null` (selezioni sempre aperte). Compare in `/lavoro-casting` e nei dati home.
- `pages/lavoro.tsx` → mappa `PAGINE_ANNUNCIO` (slug annuncio → rotta scheda): sull'annuncio HVS compare il pulsante «Leggi l'annuncio completo» → `/hvs`, sopra il pulsante WhatsApp. Nulla rimosso.
- `pages/bacheca.tsx` → sezione in evidenza «Annuncio attivo · candidature aperte» con logo ufficiale HVS, i tre livelli 20/€250 · 50/€500 · 100/€1.000, il +25% sui clienti acquisiti e i pulsanti `/hvs`, `/hvs#corso`, WhatsApp.
- Verificato a video: `/lavoro-casting` 3 card (HVS in prima posizione), click «Leggi l'annuncio completo» → `/hvs`; `/lavoro-casting/bacheca` logo HVS naturalWidth 1448, link `/hvs` e `/hvs#corso`; nessuna immagine rotta, errori console `[]`. `bun run lint` 0 errori, `bun run build` exit 0.
- Regolamento del corso HVS: resta «in consegna», in attesa del testo di Claudio (nessun testo contrattuale scritto da noi).

## 04/09/2026 — Contatti Social + Touch Academy + correzione nomi brand

- NUOVA pagina `/contatti-social` (alias `/social`): directory social visuale, 8 macro aree
  (Bump, BIGO LIVE, Facebook, Instagram, X/Twitter, LinkedIn, TikTok, OK.ru), 27 account.
  Nessun URL stampato in pagina. Ogni card: anteprima (logo ufficiale se in archivio, altrimenti
  iniziali), loghino della piattaforma, nome + handle, pulsante "Apri profilo".
  Pulsanti attivi 13 (11 Instagram + X @touchtvmusic + TikTok @touchveejay), ricavati SOLO dagli
  handle scritti da Claudio. 14 account senza indirizzo → etichetta non cliccabile
  "Link da incollare" (nessun URL inventato).
  Dati in `src/web/lib/social-tbh.ts`, pagina `src/web/pages/social.tsx`.
- Collegamento da `/contatti` alla nuova pagina.
- NUOVA sezione "Touch Academy" dentro `pages/crew-academy.tsx` + rotta `/touch-academy`
  (stessa pagina, nessun doppione): 4 tappe (Scritto · Teoria · Pratica · Poi si guadagna) e
  9 aree di reclutamento interno. Durata, quote e calendario: da confermare.
- CORRETTO bug pre-esistente: le card brand leggevano `b.nome` mentre l'API restituisce `b.name`
  → 3 titoli vuoti e chip vuoti su `/crew-academy` e `/touch-academy`. Ora i nomi si vedono e
  le card mostrano anche il logo ufficiale quando presente.
- Verifiche: lint 0 errori, build exit 0, DOM controllato su 5 pagine (nessun titolo vuoto,
  nessuna immagine rotta, errori console []).
- In attesa da Claudio: URL reali dei 14 profili mancanti, conferma handle TikTok, anteprime reali
  dei profili, durata/quote/calendario Touch Academy.

## 04/09/2026 — CAPITAN TOUCH · a caccia dei neuroni perduti

- NUOVO modulo di gioco completo, tradotto dalla specifica in 10 punti + le 2 modifiche
  finali di Claudio. Specifica applicata scritta in `docs/capitan-touch-specifica.md`.
- Avatar ufficiale: le 3 pose inviate da Claudio, scontornate a sfondo trasparente senza
  tagliare testa, cappello, mani o piedi → `public/capitan-touch/capitan-saluta.png`,
  `capitan-cerca.png`, `capitan-scappa.png`.
- Comportamento: comparsa casuale (probabilità impostabile, di partenza 35%), entra dal bordo
  destro o sinistro ad altezza casuale, fa la gag e dopo 5-10 secondi SCAPPA fuori dallo
  schermo. Se scappa l'utente non perde il tentativo (glielo dice la finestra).
  Un solo avatar per volta: l'overlay è montato una sola volta nel Layout.
- Limite: 3 RITROVAMENTI al giorno per utente (non 3 apparizioni), come chiesto nella
  modifica 1. Le apparizioni non consumano nulla.
- Scarsità blindata lato server: 5 Neuroni d'Oro reali in tutto. Contatore pubblico
  5 → 4 → 3 → 2 → 1 → ESAURITI, senza mai dire in quale pagina si trovano.
- 16 posizioni autorizzate (Home, Pagine TBH, Media/DM, Sport, Eventi, Shop, Community,
  schede attività `/e/*` e `/master/*`, Cercami-Seguimi-Trovami, Mappa TBH).
- Titoli della finestra secondo il punto 6/7: «HAI TROVATO CAPITAN TOUCH!» in generale,
  «CAPITAN TOUCH È PASSATO DA QUI» sulle schede attività, «MI HAI TROVATO! Guarda dove sono
  finito questa volta…» sulla mappa.
- Pagina pubblica `/capitan-touch` (alias `/neuroni`): regole, contatore d'Oro, le 3 pose,
  le 4 categorie di neuroni, area personale con Neuroni trovati / Premi conquistati /
  Premi utilizzati / Neuroni d'Oro e il pulsante «Segna come utilizzato».
- Pannello amministratore `/allestimento/capitan-touch` (codice TBH-ALLESTIMENTO-2026):
  schede Caccia · Posizioni · Premi e neuroni · Vincitori · Statistiche, attiva/disattiva,
  probabilità, periodo, orario, ritrovamenti al giorno, sponsor, disponibilità dei premi.
- Mappa `/territorio/mappa`: aggiunto SOLO un blocco «Capitan Touch è passato da qui» con
  la sagoma, il contatore d'Oro e il link alle regole. Google Maps non toccato.
- Tabelle nuove: `cacce`, `posizioni`, `premi`, `apparizioni`, `ritrovamenti` (`db:push` fatto).
  Route `src/api/routes/capitan.ts`, registrata in `src/api/index.ts`.
- PREMI: nessun premio inventato. I neuroni sono gettoni di gioco; finché Claudio non scrive
  i premi reali dal pannello la finestra dice «premio da definire».
- Verifiche: lint 0 errori, build exit 0 (tsc incluso); test API 5/5 (limite giornaliero,
  portafoglio, scarsità dell'oro, doppia cattura, pagina non autorizzata);
  DOM 14/14 su pagina e pannello; comparsa in home provata cliccando davvero l'avatar 5/5;
  dati di prova ripuliti, i 5 Neuroni d'Oro sono di nuovo tutti in scorta (5 su 5).
- LIMITE DA DIRE A CLAUDIO: senza area utente i 3 al giorno valgono per dispositivo/browser
  e si azzerano svuotando i dati del browser. La scarsità dei 5 Neuroni d'Oro è invece
  garantita dal server (provato: non escono mai 6).

## Slot universale «incolla e si vede subito» — 04/09/2026

Ordine: «crea la stessa cosa dei monitor per aggiungere foto loghi link pulsanti».

- Componente `web/components/slot-contenuti.tsx` → `SlotContenuti` (modi: pulsanti · loghi · foto).
  Due vie: incolla il link oppure carica il file. Anteprima dal vivo prima di salvare.
- API: `media.salvaPulsante` (titolo per esteso + link di destinazione + logo facoltativo);
  ammessi `https://…` e le pagine interne del portale (`/shop`).
- Montato in: `/` `home:pulsanti` · `/contatti-social` `social:pulsanti` · `/shop` `shop:pulsanti`
  · `/tbh/pagine` `pagine:pulsanti`. Scheda guida con i 4 spazi nel pannello `/allestimento`.
- Differenza dai monitor: i monitor tengono l'URL solo sul dispositivo (prova personale),
  questo slot lo salva nel portale → lo vedono tutti i visitatori.
- Spazio vuoto = invisibile ai visitatori (niente buchi in pagina).
- Verifiche a video: `scripts/verifica-slot-contenuti.py` → 14/14, console pulita,
  logo con `naturalWidth > 0`, link di destinazione corretto, dati di prova rimossi.

## Magazine — copertine una a una, tutte le pagine, inserti sportivi (turno 23)
Ordine di Claudio: «tutte le copertine dei magazine i vari numeri vorrei inserire foto una ad una
e anche poi la scheda dove ci sono anche le pagine di tutta la rivista numero per numero, numeri
speciali ed inserti sportivi che ci saranno da gennaio 2027».

Fatto:
- `web/lib/slot-magazine.ts`: tre spazi per ogni numero, con lo slug dentro il nome —
  `influencity:copertina:<slug>`, `influencity:pagine:<slug>`, `influencity:inserto-sport:<slug>`.
  `INSERTI_SPORT_DA = "Gennaio 2027"`, `INSERTI_SPORT_ANNO = 2027`.
- API `media.perPrefisso` (tutte le copertine in una chiamata) e `media.conteggi` (quante pagine
  per numero, senza scaricare le immagini). Hook `useMediaPrefisso` / `useMediaConteggi`.
- `/influencity/:slug`: la copertina caricata vince su quella nel codice; spazio copertina, spazio
  «Tutte le pagine di questo numero» (una foto alla volta) e spazio «Inserto sportivo» dichiarato
  da Gennaio 2027 (per i numeri precedenti la nota dice che l'inserto non esisteva).
- `/influencity`: le copertine caricate compaiono nelle card dell'edicola, con badge «N pagine
  caricate»; aggiunta la nota sugli inserti da Gennaio 2027. Vale anche per gli speciali «bis».
- Pannello `/allestimento`: voce «Magazine — copertine e pagine, numero per numero».

Verifica: `scripts/verifica-magazine.py` → 19/19, dati di prova creati e cancellati, console pulita.
`bun run lint` 0 violazioni, `bun run build` OK.

Aperto: l'elenco numeri si ferma ad Agosto 2026 (`ULTIMO_ANNO`/`ULTIMO_MESE` in
`api/data/editoria.ts`) — servono i numeri nuovi. Resta la discrepanza N°31 stampato / N°30
calcolato su Gennaio 2025: non corretta d'ufficio.

## Cremona Circuit 2026 — ricerca operatori (turno 24, 04/09/2026)

Fonte: annuncio integrale di Claudio + immagine ufficiale «CREMONA CIRCUIT — Piano Operatori
· 24–27 Settembre 2026» (loghi MOTUL, DORNA, SBK Superbike 2026).

Fatto:
- `packages/web/public/brand/cremona-circuit-2026-piano-operatori.jpg` — copia identica
  dell'immagine inviata, pubblicata così com'è (nessun ritocco).
- NUOVA pagina `web/pages/cremona-circuit.tsx`: header + 2 CTA (WhatsApp precompilato, mappa),
  piano operatori ufficiale in evidenza, 3 card riepilogo, tabella dei 6 turni con i totali
  (66 persone organico consigliato · 188 presenze/turno), banner «Attenzione: i 20 antincendio
  sono già compresi nei totali», 10 aree operative, reparti diurno/notturno, disponibilità
  richiesta, come candidarsi (7 dati da indicare), `SlotContenuti slot="cremona-2026:materiali"`.
- Rotte in `web/app.tsx`: `/cremona-circuit-2026` + redirect `/cremona` e `/cremona-circuit`.
- Annuncio `operatori-cremona-circuit-2026` in cima a `ANNUNCI` (`api/data/tbh.ts`), scadenza
  27 settembre 2026, stato «verificato». Gli annunci precedenti non toccati.
- `web/pages/lavoro.tsx`: `PAGINE_ANNUNCIO["operatori-cremona-circuit-2026"] = "/cremona-circuit-2026"`.

Non inventato: compenso, inquadramento e condizioni non erano nell'annuncio → in pagina è
scritto che li comunica la direzione in fase di candidatura. Nessun link al sito di Cremona
Circuit (partnership non confermata): la sede usa una ricerca Google Maps generica.

Verifica: `scripts/verifica-cremona.py` → 24/24, console pulita, immagine naturalWidth 1672.
`bun run lint` 0 violazioni · `bun run build` OK.

Aperto (domande 86–89): compenso/inquadramento · ruolo di TBH nell'evento (organizzatore o
fornitore) · scadenza candidature · se la pagina va anche nel menù (menù non toccato).

## Testate esterne, Pride Village, radio e area Fashion (turno 25, 05/09/2026)

Fonte: messaggio di Claudio del 05/09/2026. Tutti gli URL aperti e verificati dal portale lo stesso giorno.

**Dati** — nuovo file `packages/web/src/web/lib/esterni.ts`: `STAMPA_SPORTIVA`, `PRIDE_VILLAGE`, `ELENA_DI_CUORI`, `ELENA_DI_CUORI_PRODOTTI` (12 prodotti con prezzo e URL reali del venditore), `FASHION_LIFE`, `VERIFICATO_IL = "05/09/2026"`.
Anteprime reali in `packages/web/public/anteprime/`: `pridevillage.jpg`, `elenadicuori.jpg`, `fashionlife.jpg`, `romagnasport.jpg` (1280×800). Tutto Campo blocca la cattura automatica: `anteprima: null` e riquadro «anteprima non disponibile», nessuna immagine finta.

**Radio** — `api/data/anagrafica.ts` (`RADIO_MASTER`): Radio Montecarlo 2 da `www.MC2.net` (errato) a `https://www.rmc2.net`; Match Music da `matchmusic.tv` a `https://www.rmc2.net/webradio/mc2-match-music-channel`. `api/data/rete.ts` (`RADIO`): 5 siti ufficiali al posto dei `null`, aggiunta Radio Milano Lombardia, nota cambiata in «Palinsesto e diretta sul sito ufficiale». Radio Match Music Europa resta senza link (domanda 91).

**Rete** — `rete.ts`: Elena di Cuori portata a `circuitoTBH: false` con sito ufficiale e nota «Marchio presentato nell'area Fashion, non aderente al Circuito TBH»; Pride Summer Village con sito ufficiale; `FONTI_CALCIO` con Tutto Campo.

**Pagine** — nuove `web/pages/pride-village.tsx` (rotta `/pride-village`, redirect `/pridevillage`) e `web/pages/fashion.tsx` (rotta `/fashion`, redirect `/moda`). Pride Village: anteprima cliccabile, 7 link profondi alle sue pagine ufficiali, social, email, richiami a Touch Be Proud e alla bacheca PR; il programma non è copiato, lo aggiorna il Village. Fashion: Elena Di Cuori (posizione dichiarata, 8 categorie, 5 servizi, P.IVA IT10504480962, 12 prodotti con prezzo letto il 05/09/2026) + Fashion Life Magazine (14 sezioni, 3 edizioni, extra).

**Innesti** — `pages/calcio.tsx`: nuova sezione «Giornali e riviste sportive» dopo «Le nostre squadre», con Tutto Campo, Romagna Sport e la card DM Comunicazioni (dichiarata media partner autonomo, non società del gruppo). `pages/shop.tsx`: blocco «Fashion · Elena Di Cuori» con i 12 prodotti, ordine e incasso al venditore. `pages/influencity.tsx`: blocco «Riviste e testate» con Fashion Life Magazine; nota N°31/N°30 e slot magazine intatti. `components/layout.tsx`: la voce già esistente «Pride Village Padova» ora punta a `/pride-village` invece che a `/in-allestimento` — nessun'altra modifica al menu.

**Verifica** — `scripts/verifica-esterni.py`: 44/44, console pulita, tutte le anteprime con `naturalWidth > 0`, nessun link senza destinazione. `bun run lint` 0 violazioni, `bun run build` OK.

## RESTYLING — impianto visivo, homepage, menù a 16 voci (turno 26, 05/09/2026)

Fonte: mockup di Claudio `IMG_9027` (home), `IMG_9028` (pagina SPORT), `IMG_9031` (mappa «UN SITO,
TANTE HOMEPAGE») + specifica scritta di 505 righe. Principio: la home è il portale, ogni pagina
interna è una mini-homepage autonoma, comunque la si raggiunga.

**Identità in un solo file** — nuovo `packages/web/src/web/lib/identita-tbh.ts`: payoff ufficiale
«VISIBILITÀ SENZA CONFINI» + «Business. Media. Sport. Eventi. Territorio. Sempre presenti. Ovunque
conta.», `COLORE_TBH = #d7ff00`, `COLORE_DM = #ff2b2b` (il rosso resta del solo mondo DM), e le 16
AREE del mockup con tutte le destinazioni del vecchio menù ridistribuite. Da qui in avanti payoff,
palette e navigazione si modificano qui, non nelle pagine.

**Impianto riusabile** — nuovo `web/components/hero-sezione.tsx`: `HeroSezione` (occhiello, titolo,
sottotitolo, fino a 4 pulsanti, logo, slot immagine), `SfondoHero` (se Claudio ha caricato
l'immagine sullo slot `hero:<area>` da `/allestimento` la usa, altrimenti skyline in codice + logo
in filigrana: nessuna foto finta), `BloccoSchede` (2/3/4 colonne, swipe orizzontale su mobile, modo
`compatto`), `SchedaBlocco`. È la base per le pagine pilota della fase successiva.

**Menù** — `components/layout.tsx` passa alle 16 voci di Claudio: HOME · TBH · DM · SPORT · RADIO ·
FASHION · SHOP · EVENTI · TURISMO · COMMUNITY · LAVORO · MOTORSPORT · SQUADRE · PRODUZIONI ·
DJ HUGÒ · CONTATTI. Il gruppo «Altro» (19 voci) resta invariato: nessuna destinazione persa,
verificato a runtime (145 destinazioni interne raggiungibili dalla sola home).

**Homepage** — `pages/index.tsx`: hero col payoff ufficiale e 4 pulsanti (mondo TBH, promo, shop,
DM); nuovo blocco «Un sito, tante homepage» con le 16 aree; nuovo blocco «La vetrina che cambia»
a rotazione controllata (ogni 8 secondi + pulsante «Ruota la vetrina»), alimentato solo da dati
reali già in pagina (prodotti dello shop con prezzo, squadre con stemma, mondi TBH); fasce «Come
funziona la home» e «Istruzioni al sito». La colonna LIVE TV e i 6 numeri reali dell'anagrafica
restano intatti. Vietati e verificati assenti: «MORE THAN VISIBILITY», «MORE THAN A NETWORK»,
«PLAY DIFFERENT», «8+ AREE», «Un ecosistema. Infinite opportunità.», «© 2024».

**Bottoni morti chiusi** — griglia squadre in `index.tsx` e `sport-hub.tsx`: con sito ufficiale
apre il sito, senza sito apre la scheda interna `/sport/squadre/:slug`.

**Due rotte rotte da prima del restyling, corrette** — `/media/streaming` non esisteva (la pagina
vera è `/media/radio-tv`): corretti 11 riferimenti in `index.tsx`, `loghi-tbh.ts`, `app.tsx`
(redirect legacy di `/tv-radio-streaming`), `api/data/ecosistema.ts`, `api/routes/ricerca.ts`,
`api/routes/home.ts`. `/eventi/calendario` non esisteva: 3 riferimenti portati su
`/eventi/fiere-internazionali`.

**Verifica** — `scripts/verifica-restyling.py` 41/41: payoff negli `h1`, sottotitolo, occhiello, le
CTA, i testi vietati assenti, i blocchi presenti, la vetrina che cambia davvero al click, nessun
`<a>` senza `href`, payoff leggibile a 420px di larghezza, console senza errori. `bun run lint`
0 violazioni, `bun run build` OK.

**Resta aperto** — `/privacy`, `/cookie`, `/termini`, `/mappa-sito` sono linkate dal footer da
prima del restyling e cadono sulla pagina di cortesia: i testi legali li deve fornire Claudio.
Fasi ancora da fare: schede «soggetto esterno» (dati già pronti in `web/lib/esterni.ts`), pagine
pilota SPORT/FASHION/RADIO con il nuovo impianto, motore pubblicitario a random controllato
(tabella campagne con priorità, peso, date, impression min/max, territorio, sponsor + pannello).

## Editore · CEO · Artista · Imprenditore (05/09/2026)

Nuova pagina `/ceo` (alias `/claudio-ugolini` e `/editore`), raggiungibile dalla pagina Contatti
con una card grande e dalla voce di menù nell'area CONTATTI.

Ospita le 12 slide della presentazione ufficiale di Claudio Ugolini: **6 pubblicate** (i file
consegnati, convertiti in JPG e messi in `public/ceo/`, apribili a schermo intero), **6 in
attesa**, mostrate come riquadri «In arrivo». Le slide 7-12 si caricano da soli dal pannello
`/allestimento` sullo spazio `ceo:slide`: compaiono in pagina senza altro lavoro di codice.

Contenuti: Chi sono, Il mio percorso, Le mie società (con link alle pagine interne esistenti),
Cinema & Produzione, I nostri servizi, contatti reali. Tutti i testi sono trascritti dalle slide:
nessuna biografia, data, premio o incarico aggiunto dall'agente.

Verifica: `scripts/verifica-ceo.py` 28/28 · `scripts/verifica-restyling.py` sempre 41/41 ·
lint 0 · build OK.

Aperto: la numerazione stampata sulle slide ha due doppioni (due «3/12», due «5/12») → ordine da
confermare con Claudio; manca una foto vera per la testata (slot `hero:ceo`).

## /ceo completata: 13 slide + biglietto da visita con QR (05/09/2026)

Tutte e 12 le slide della presentazione sono online nella sequenza confermata da Claudio, più la
13ª: il biglietto da visita digitale fronte/retro. Spariti i riquadri «In arrivo».

Nuove sezioni in pagina, con i testi trascritti dalle slide: Media & Comunicazione, Eventi &
Entertainment, Touch Business Holding, Territori & Network, J.C. Hugò & Editoria, Obiettivi &
Contatti, e in fondo il Biglietto da visita digitale.

Il QR è generato dal vivo sull'indirizzo in cui il sito gira: in anteprima punta all'anteprima,
appena pubblicato punta da solo al dominio definitivo. C'è il bottone per scaricare il PNG da
mandare in stampa.

Check collegamenti: nuovo `scripts/verifica-link.py`. Trovati e corretti 3 link rotti storici
(`/lavora`, `/media-library`, `/rete-commerciale`). Resta `/mappa-sito` da creare.

Verifiche: `verifica-ceo.py` 50/50 · `verifica-restyling.py` 41/41 · `verifica-link.py` 0 rotti ·
lint 0 · build OK.

Da Claudio: URL veri per Instagram, TikTok, Bigo Live, Bump, X, LinkedIn, Telegram, Twitch,
Spotify (sul biglietto restano etichette non cliccabili) e una foto vera per la testata.

## Turno 28 — Hotel Aurora

Nuova pagina `/hotel-aurora` con la card ufficiale AgriBus Experience, i recapiti reali della
struttura (Via Bramante 2/A Misano Adriatico, tel +39 331 9624329, aurora@familyhotel.it, PEC,
P.IVA 00321000408, Instagram) e il blocco AgriBus verso la Tenuta Due Tigli, 20 posti.
Facebook e WhatsApp non sono cliccabili: mancano l'indirizzo della pagina e il numero.
Da `/hospitality` si arriva alla pagina con un blocco «Struttura in evidenza».

I due allegati mandati erano lo stesso identico file: la card ufficiale è una sola.

Verifiche: `verifica-aurora.py` 44/44 · `verifica-link.py` 0 rotti · `verifica-restyling.py` 41/41
· `verifica-ceo.py` 50/50 · lint 0 · build OK.

## Turno 28 (parte 2) — SBK Cremona Circuit 2026

`/cremona-circuit-2026` ora apre con la ricerca personale ufficiale divisa in tre squadre —
Antincendio Livello 3 (30 cercati / max 20), Servizio Ordinario diurno (60 / max 35) e Servizio
Ordinario notturno (10 / max 6) — con le tre locandine ufficiali, giornate, ritrovi, orari,
mansioni e il requisito dell'attestato Livello 3. Sotto, il blocco valido per tutti: divisa
TOTAL BLACK, App SBK, documenti obbligatori (anche per cittadini stranieri), conteggio sulle ore
effettivamente svolte e iter in quattro passi. Ogni squadra ha la sua candidatura WhatsApp.

Il piano operatori precedente non è stato tolto: resta sotto, invariato.
Da chiarire: quale conteggio vale, 66 di organico del vecchio piano o massimo 61 della nuova ricerca.

Verifiche: `verifica-sbk-cremona.py` 88/88 · `verifica-cremona.py` 24/24 · `verifica-aurora.py` 44/44
· `verifica-restyling.py` 41/41 · `verifica-ceo.py` 50/50 · `verifica-link.py` 0 rotti · lint 0 · build OK.

## Turno 29 — Servizi & Referral «Guadagna con noi»

Nuova pagina `/servizi-referral` (si apre anche da `/guadagna-con-noi` e `/referral`), con la sua
voce nel menu «Altro». Sette servizi, ognuno con due strade: il pulsante «Apri servizio» porta al
sito ufficiale del brand, il pulsante «Guadagna con noi» al link referral personale di Claudio.
Revolut Personal, Revolut Business, BIGO LIVE (codice invito 10573217228), Bump, bunq, Vivid Money,
Vivid Business. Sotto: tabella riepilogativa, «Come funziona» in quattro passi e i punti di forza.

bunq non ha ancora un link referral: il pulsante è un'etichetta non cliccabile «Invito da
confermare». Nessun link è stato inventato.

I loghi ufficiali dei sette brand non ci sono e non vengono ricreati: al loro posto il nome del
brand, cliccabile. Lo slot `servizi-referral:loghi` è già pronto nel pannello di allestimento.

Verifiche: `verifica-referral.py` 72/72 · `verifica-sbk-cremona.py` 88/88 · `verifica-cremona.py`
24/24 · `verifica-aurora.py` 44/44 · `verifica-restyling.py` 41/41 · `verifica-ceo.py` 50/50 ·
`verifica-link.py` 0 rotti · lint 0 · build OK.

## Turno 30 — Palinsesto e zapping (fase 1)

Il sito adesso si può usare come una televisione. C'è una tabella di canali numerati: 0 è la HOME,
99 è l'area TBH / CEO, in mezzo i 22 canali dei mondi del gruppo (Holding, Società, Services,
Touch Pay · Touch Finance, Circuito, Territorio, DM, Media, Production, Hugoland, Sports,
Motorsport, HVS, Host, Jobs, Casting, Social, Shop, Vetrina, Fashion, Guadagna con noi, Contatti).
I numeri da 23 a 98 restano liberi per i canali futuri.

Nuove pagine: `/guida` (la guida del palinsesto, con tutti i canali e i contenuti in primo piano)
e `/canale/N` (la mini-homepage di ogni canale, con la sua programmazione). In fondo a sinistra
c'è la barra CANALE − / CANALE + per zappare avanti e indietro senza fine; in homepage, sotto la
testata, la carrellata dei canali.

Nessuna pagina nuova di contenuto: ogni voce della programmazione porta a una pagina che esiste
già, come chiede la regola «una pagina può essere promossa ovunque, ma deve esistere una sola
volta». Nessuna voce di menù è stata tolta.

Non ho eliminato niente e non ho cambiato lo slogan: sono due cose che vanno decise da Claudio
(domande 116 e 118). Per i loghi dei canali c'è lo slot nel pannello di allestimento: dove il logo
non c'è non viene inventato.

Verifiche: `verifica-palinsesto.py` 351/351 · `verifica-referral.py` 72/72 ·
`verifica-sbk-cremona.py` 88/88 · `verifica-cremona.py` 24/24 · `verifica-aurora.py` 44/44 ·
`verifica-restyling.py` 41/41 · `verifica-ceo.py` 50/50 · `verifica-link.py` 0 rotti · lint 0 ·
build OK.

## Turno 31 — Il sito si chiama TBH-WEB

Ordine ricevuto: «Tibihacca bocciato, TBH-WEB promosso». Fatto.

Prima il sito portava due nomi contemporaneamente: la testata e i metadati dicevano TiBiHacca,
mentre il QR del biglietto da visita mandava già su tbh-web.com. Adesso il nome è uno solo, e
compare uguale dappertutto: testata, footer, titolo della finestra, anteprima quando il link viene
condiviso su WhatsApp o Facebook, messaggi precompilati, pagina contatti.

Il nome adesso è scritto in un punto solo del programma: se un domani cambia, si cambia lì e si
aggiorna ovunque da solo. C'è anche un controllo automatico che fallisce se il nome vecchio prova
a rientrare da qualche parte.

Le email che finiscono con @tibihacca.com le ho lasciate: sono recapiti veri, stampati sul
materiale ufficiale. Se ci sono i nuovi indirizzi mandameli e li cambio in un minuto.

Il materiale raccolto sul vecchio portale non è stato buttato: nei documenti di lavoro resta,
marcato come archivio storico.

Verifiche: `verifica-nome-tbh-web.py` 122/122 · `verifica-palinsesto.py` 351/351 ·
`verifica-referral.py` 72/72 · `verifica-sbk-cremona.py` 88/88 · `verifica-cremona.py` 24/24 ·
`verifica-aurora.py` 44/44 · `verifica-restyling.py` 41/41 · `verifica-ceo.py` 50/50 ·
`verifica-link.py` 0 rotti · lint 0 · build OK.

## Turno 32 — Bozza «Check web»: la home corta, senza perdere niente

La homepage era diventata lunga 24 schermate e mezzo, con 29 sezioni e 453 collegamenti nel
corpo: gli stessi link ripetuti in cinque blocchi diversi e il riquadro dei pagamenti stampato
due volte. È quello che vedevi come «dieci menù e quattordici footer».

Non ho toccato la home. Come da regola, ho fatto prima un punto di ritorno («un passo indietro»)
e poi ho messo la proposta su una pagina a parte: **/check-web**. Se non ti piace, si butta la
bozza e non è successo niente.

La bozza è 6 schermate e mezzo invece di 24 e mezzo, 9 sezioni invece di 29, 130 link nel corpo
invece di 453. Ma nessuna pagina è sparita: in fondo c'è l'indice «Dove trovo tutto» e un
controllo automatico verifica che ogni destinazione del sito resti raggiungibile. Zero orfane.

Nel farlo ho trovato due difetti che c'erano già:
- la testata sbordava di 17 px e faceva scorrere in orizzontale TUTTO il sito sul telefono;
- 13 attività del Circuito e le schede del registro avevano la loro pagina, ma nessuno le
  collegava: adesso il nome è cliccabile.

Verifiche: check-web 15/15 · nome 122/122 · palinsesto 351/351 · referral 72/72 · SBK 88/88 ·
Cremona 24/24 · Aurora 44/44 · restyling 41/41 · CEO 50/50 · link 0 rotti · lint 0 · build OK.

### Mappa del sito

Il footer aveva una voce «Mappa del sito» che non apriva niente: era l'unico link rotto rimasto.
Adesso la pagina c'è, a `/mappa-sito`: tutte le sezioni in ordine, i 24 canali del palinsesto, le
pagine di servizio e le aree riservate. Si aggiorna da sola quando nasce una pagina nuova.

Privacy, cookie e termini restano scritti «In allestimento» e non si aprono: quei testi devono
essere quelli veri e me li devi mandare tu.

### Turno 33 — Home 0, ambienti, header compatto

Ho eseguito la specifica delle 9 istruzioni. Sempre in bozza, su **/check-web**: la home vera
non è stata toccata e c'è un nuovo punto di ritorno del 06/09.

La home della bozza adesso è un **palinsesto**: non ripete i contenuti, li mette in vetrina.
C'è una carrellata dei **10 ambienti** che scorre lasciando vedere la card dopo, con la
**categoria sopra il nome** e il numero di canale. Ogni ambiente apre la sua **mini-homepage**
con tutto quello che contiene: 138 pulsanti in tutto, tutti funzionanti, tutti verso la pagina
ufficiale (niente scorciatoie doppie).

Testata nuova come chiesto: **logo, cerca, contatti, menu ☰**. Alta 61 px sul computer e 109
sul telefono. Dentro il ☰ c'è tutto il menù, quindi non si perde niente.

Misure con lo stesso metro: la home attuale è 23.274 px e 24,5 schermate, la bozza 6.156 px e
6,5 schermate; sezioni da 29 a 11; link nel corpo da 453 a 97. Nessuno scorrimento orizzontale
a 320, 375, 390, 768, 1024 e 1440 px.

Verifiche: ambienti 54/54 · header e misure 18/18 · check-web 15/15 · nome 122/122 ·
palinsesto 351/351 · referral 72/72 · SBK 88/88 · Cremona 24/24 · Aurora 44/44 ·
restyling 41/41 · CEO 50/50 · link 0 rotti · lint 0 · build OK.

Manca solo il tuo sì per portare questa struttura sulla home vera.

### Turno 34 — TBH Content Hub (pre-allestimento)

Ho fatto quello che mi hai chiesto: adesso c'è un posto solo dove si carica il materiale, e da
lì va ovunque. Si entra da **/allestimento/hub**, oppure dal pulsante grande in cima al
pannello di allestimento. Codice di ingresso: quello che usi già.

Dentro trovi otto pulsanti grandi: **collega un indirizzo, collega un sito, carica un logo,
carica un'immagine, scatta una foto, carica un documento, collega un video, aggiungi un
pulsante esterno**. Dal computer puoi anche **trascinare il file** nel riquadro: si sistema da
solo nel campo giusto. Dal telefono si apre direttamente la fotocamera o la galleria.

Ogni caricamento diventa **una scheda sola** — titolo, tipo, canale, categoria, logo, immagine,
video, documento, testo breve, fino a tre pulsanti — e tu scegli dove farla comparire: home,
canale, vetrina, territorio. Prima di tutto c'è l'**anteprima**: vedi la scheda come uscirà.

**Niente si pubblica da solo.** Una scheda nasce sempre in BOZZA. Diventa visibile solo quando
la porti tu su ATTIVO. È scritto sulla pagina e l'ho verificato con una prova vera sul
programma, non a occhio.

In più il sito adesso **si installa sul telefono** come un'app. Da lì, quando trovi un link
interessante e fai «Condividi → TBH-WEB», il link finisce dritto nel pre-allestimento già
pronto da completare.

Cosa non c'è ancora e te lo dico chiaro: i selettori diretti di **Google Drive, OneDrive e
Dropbox** (servono le loro chiavi di accesso — se le vuoi devo chiedertele) e la condivisione
dei **file** dal telefono, che oggi passa solo i link. Nessun pulsante finto: dove non c'è, c'è
scritto «in allestimento».

Verifiche: content hub 65/65 · ambienti 54/54 · misure 18/18 · check-web 15/15 · nome 122/122 ·
palinsesto 351/351 · referral 72/72 · SBK 88/88 · Cremona 24/24 · Aurora 44/44 ·
restyling 41/41 · CEO 50/50 · link 0 rotti · lint 0 · build OK.

Resta in attesa del tuo sì la **Home 0** su /check-web.

## Turno 34 — ter · anteprime reali e misure standard dei loghi (06/09/2026)

- Difetto risolto: `verucchio-1957.png` (1024x1536) era **tagliato** dentro riquadri da
  192 px (reso 260x390 e 377x565), `rimini.png` era a 0x0. Ora tutti i loghi e gli stemmi
  hanno **una sola misura di riquadro** e `object-fit: contain`: entrano interi.
- Nuovi: `components/tessera-logo.tsx`, `lib/anteprime-reali.ts`,
  `scripts/verifica-anteprime.py` (**101/101**).
- Vetrina delle anteprime reali sul **canale 0 di `/check-web`**: 23 tessere, tutte
  cliccabili, tutte caricate, tutte sulla stessa linea.
- 16 riquadri logo allineati allo standard, `LogoBox` compreso (~20 pagine).
- Regola tecnica scritta in `docs/regole-ferree.md` §6.
- Resta aperto: 18 canali su 24 senza marchio proprio (domanda 121).

## Turno 35-36 — palinsesto visuale, fasi 1 e 2 (08/09/2026)

Bozza su **`/check-web/regia`**: la home come regia generale, IN EVIDENZA + 10 rulli
orizzontali (pagine/canali, novita', circuito, media, sport, business, hospitality, lavoro,
eventi, shop). Nessun contenuto nuovo: sono i 24 canali e le 89 voci di programmazione gia'
presenti, resi come schermi. La home attuale non e' stata toccata.

Nuovi: `components/schermo-tbh.tsx`, `components/rullo-tbh.tsx`, `lib/schermi-palinsesto.ts`,
`pages/regia.tsx`, `scripts/verifica-palinsesto-visuale.py`.

Misurato: 146 schermi, 11 rulli, rapporto 16:9 unico a 320/390/768/1440, zero overflow di
pagina, 36 anteprime reali e 110 slot «in allestimento», 146 CTA tutte con destinazione,
console pulita. Verifiche: palinsesto-visuale 62/62 · lint 0 · build OK · regressione verde.

## Turno 37 — Corso Addetto Antincendio Livello 3 (15/09/2026)

Materiale ricevuto da Claudio: testo completo del corso + locandina ufficiale
(PNG 1536x1024). Pubblicata **una sola pagina canonica**:
**`/corsi/antincendio-livello-3`** (alias `/antincendio`).

Contenuto, tutto suo, niente aggiunte: 16 ore (12 teoriche + 4 pratiche), esame di idoneita'
tecnica presso i Vigili del Fuoco con assistenza fino all'attestazione, max 15 partecipanti
per corso, sedi Ravenna / Modena / Rimini, tre formule — gratuita (si paga solo l'esame VVF
piu' eventuali oneri e marche da bollo), completa **288 €** (da 366 €), corso + **TBH Fidelity
Consumer 244 €** (tessera da 72 € inclusa, braccialetto NFC, sconti antinfortunistica e Total
Black, gadget, bonus «Porta un amico»). Nota sui costi d'esame variabili per Comando VVF.

La locandina e' pubblicata come immagine reale (`public/corsi/antincendio-livello-3.jpg`,
`object-contain`, mai ritagliata), non ricostruita.

Nuovi: `pages/corso-antincendio.tsx`, `scripts/verifica-corso-antincendio.py` (**41/41**).
Toccati: `app.tsx` (rotta + alias), `crew-academy.tsx` (scheda del corso dentro Touch
Academy), `mappa-sito.tsx` (voce in elenco). Snapshot pre-modifica:
`un-passo-indietro_2026-09-15_pre-corsi.tar.gz`.

Verifiche: corso-antincendio 41/41 · anteprime 101/101 · rullo 31/31 · content-hub 65/65 ·
ambienti 37/37 · prima-dopo 18/18 · check-web 11/15 (storico) · nome-tbh-web 122/122 ·
palinsesto 351/351 · referral 72/72 · palinsesto-visuale 62/62 · link 0 rotti · lint 0 ·
build OK.

**Aperto (domanda 129):** nel catalogo Touch Jobs restano «Corso di formazione completo»
**610 €** + «Esame di certificazione» **72 €** (regola Batch 6 punto 12). Il listino di questo
corso e' diverso. Le due voci **non sono state toccate** in attesa che Claudio dica se il
nuovo listino sostituisce quello generico per l'antincendio o se convivono.

## Turno 37 — parte 2: listino a shop, tre sezioni di sede (15/09/2026)

Risposte di Claudio: (1) per l'antincendio il nuovo listino **sostituisce** i 610 €/72 €
generici; (2) le tre formule vanno **a listino nello shop** come voci separate;
(3) aprire **sezioni di Rimini, Ravenna e Modena** con blocchi da **massimo 15 posti**.

Fatto:
- `api/data/catalog.ts`: nuovo campo opzionale `scheda?` (collega un prodotto alla sua pagina
  completa); il blurb del generico `corso-formazione-completo` (610 €) **non elenca piu'
  l'antincendio** e rimanda al listino dedicato; tre nuove voci —
  `antincendio-livello-3-gratuito` (**gratuito**), `antincendio-livello-3-completo`
  (**288 €**), `antincendio-livello-3-fidelity` (**244 €**), tutte con la locandina reale.
- `components/tiles.tsx` e `lib/whatsapp.ts`: un importo a zero si scrive **«Gratuito»**,
  mai «0,00 €».
- `pages/prodotto.tsx`: pulsante **«Scheda completa»** quando esiste `scheda`; su un prodotto
  gratuito la CTA diventa «Prenota su WhatsApp» e **metodi di pagamento e checkout non si
  mostrano** (non c'e' niente da pagare).
- `pages/corso-antincendio.tsx`: sezione **`#sedi`** con le tre sezioni (Rimini · Ravenna ·
  Modena), capienza 15 posti, 16 ore, esame Comando VVF, **calendario «In programmazione»**
  — nessuna data inventata, Claudio non le ha comunicate — e una CTA WhatsApp per sede;
  piu' il blocco con i tre link alle voci `/shop/p/…`.

Snapshot pre-modifica: `un-passo-indietro_2026-09-15_pre-catalogo-antincendio.tar.gz`.

Verifiche dopo le modifiche: **corso-antincendio 70/70** (era 41/41, lo script ora controlla
sedi, blocchi da 15, «in programmazione», le tre voci in vetrina, gli importi sulle schede e
l'assenza di «0,00 €») · anteprime 101/101 · rullo 31/31 · content-hub 65/65 · ambienti 37/37 ·
prima-dopo 18/18 · check-web 11/15 (storico) · nome-tbh-web 122/122 · palinsesto 351/351 ·
referral 72/72 · palinsesto-visuale 62/62 · link 0 rotti · lint 0 · build OK · console pulita.

**Da chiarire:** se arriveranno prezzi specifici per gli altri corsi Touch Jobs (HACCP, BLSD,
DAE, Cinofila, Salvataggio, Zumba, PT, Massaggio) si scorporano dal generico 610 € con lo
stesso schema usato qui.

---

## 15/09/2026 — Riorganizzazione area SPORT, area DM e calendario unico (ordine di Claudio)

**Struttura URL, ora ferma e non superabile:** `/dm` · `/dm/programmi` · `/sport` ·
`/sport/calcio` · `/sport/highlights` · `/sport/calendario` · `/sport/motorsport`.
Nessuna pagina nuova oltre a queste: squadre, tornei, tappe e singoli programmi sono
**sezioni** dentro queste pagine. Il singolo programma DM è la sezione `?p=<slug>` di
`/dm/programmi` (es. `/dm/programmi?p=il-calcio-di-tutti`), non una pagina a sé.

- `/sport` — quattro soli accessi (Calcio · Video · Calendario · Motorsport) + una sola
  fascia «Prossimi appuntamenti», massimo 3 voci.
- `/sport/calcio` — tre sole selezioni (SQUADRE · RISULTATI E NOTIZIE · TORNEI E PROGETTI),
  **una sola sezione aperta alla volta**. «Tornei e progetti» dà una breve anteprima e un
  solo link al calendario. Nel blocco «Programmi sportivi DM» restano tutte le destinazioni
  storiche: sito ufficiale DM Sport Live, area DM e canale YouTube di Daniele Manuelli.
- `/sport/calendario` — calendario unico per tutto: quattro filtri (TUTTO · CALCIO ·
  PROGRAMMI · MOTORSPORT) e **quattro soli stati** (CONFERMATO · IN PROGRAMMAZIONE ·
  IN VALUTAZIONE · CONCLUSO). I quattro appuntamenti di Verucchio stanno qui una volta sola;
  «Torneo a Verucchio — Progetto Spagna» è collegato al torneo giovanile di aprile 2027,
  non è un evento separato.
- `/sport/highlights` — aggiunto il blocco «Guarda i programmi sportivi DM»: quattro pulsanti
  programma più un quinto pulsante distinto per DM Sport Live (sito esterno, scheda nuova).
- `/dm` — monitor, ultime puntate, palinsesto settimanale confermato (lun 19:45 Calcio di
  Rigore · mar 18:45 TG Sport · mar 19:45 Il Calcio D Tutti · ven 19:45 AnteprimaSport),
  quattro programmi, DM Sport Live come **solo link esterno** (nessuna copia interna).

**Vecchi indirizzi:** `/media/dm`, `/media/dm/programmi` e `/media/dm/<slug>` restano come
reindirizzamenti; `/media/dm/crew` non si tocca. I link interni puntano ora agli URL nuovi.
Rimossa la pagina orfana `pages/dm-programma.tsx` (nessuna rotta la usava più).

Snapshot pre-modifica: `un-passo-indietro_2026-09-15_pre-riorganizzazione-sport.tar.gz`.

Verifiche dopo le modifiche: **sport-calendario tutto in regola** (script nuovo:
struttura URL, redirect, filtri, stati, doppioni, massimo 3 appuntamenti, una sola sezione
aperta, nessuno sbordo a 390px) · esterni 44/44 · nome-tbh-web 122/122 · anteprime 101/101 ·
ambienti 37/37 · palinsesto 351/351 · palinsesto-visuale 62/62 · restyling 41/41 · rullo 31/31 ·
magazine 19/19 · content-hub 65/65 · slot-contenuti 14/14 · cremona 24/24 · sbk-cremona 88/88 ·
aurora 44/44 · ceo 50/50 · referral 72/72 · corso-antincendio 70/70 · capitan 5/5 e 14/14 ·
link 0 rotti · lint 0 · build OK · check-web 11/15 (storico: i quattro KO riguardano la bozza
`/check-web`, e `/dm` **non** è più fra le destinazioni orfane).

Aggiunto `compute-pressure` all'attributo `allow` dei due monitor video: era l'unico avviso di
console rimasto sul lettore YouTube di `/dm`.

## WorldSBK · EICMA Italian Round su /cremona-circuit-2026 (15/09/2026)

Fonte: comunicato ufficiale del Cremona Circuit («2 WEEKS TO GO — PRONTA LA MAPPA DEL
WORLDSBK») consegnato da Claudio, riportato alla lettera, più il link del modulo di accredito
lavoro. Date (25 · 26 · 27 settembre 2026), denominazione del round, numero di round e
indirizzo (Strada Giuseppina 2, San Martino del Lago) verificati il 15/09/2026 su
`worldsbk.com/en/calendar/event/2026-CRE` e `cremonacircuit.it/worldsbk`.

- NUOVO `web/lib/worldsbk-cremona-2026.ts`: dati evento, link ufficiali verificati, modulo di
  accredito, 4 aree parcheggio (con i colori della mappa) e 4 aree del weekend (Paddock &
  Paddock Show · Cremona Village · Food & Drink · Aree tribune).
- `web/pages/cremona-circuit.tsx`: **aggiunta** la sezione `#worldsbk` sotto l'header —
  dati del round, quattro pulsanti ufficiali (mappa/info circuito, biglietti, pagina round
  WorldSBK, come arrivare all'indirizzo esatto), griglia parcheggi e quattro schede area.
- Il modulo di accredito lavoro (JotForm TBH «Istruttoria Digitale») è ora raggiungibile da
  tre punti: header, «Come candidarsi», fascia CTA finale. **Si aggiunge** al canale WhatsApp
  e al telefono, che restano intatti (regola §2).
- Mappa ufficiale: è un'immagine del circuito e non ci è stata consegnata, quindi non ne
  esiste una copia rifatta sul portale — si rimanda al canale ufficiale con avviso esplicito.

Ricerca personale, tre squadre SBK, tabella turni, piano operatori, documenti e iter: tutto
al suo posto, nessuno spostamento.

Snapshot pre-modifica: `un-passo-indietro_2026-09-15_pre-worldsbk-mappa.tar.gz`.

Verifiche: script nuovo `verifica-worldsbk-cremona.py` **56/56** (dati evento, parcheggi,
aree, link esterni in scheda nuova, modulo da 3 punti, contenuti preesistenti intatti,
un solo h1, console pulita, nessuno sbordo a 390px) · cremona 24/24 · sbk-cremona 88/88 ·
lint 0 · build OK.

### Rimandi al round (stesso turno, 15/09/2026)

Il round vive su **una sola pagina** (`/cremona-circuit-2026`): gli altri due punti lo
richiamano, non lo ricopiano.

- `api/data/calendario-sport.ts`: nuova scheda `worldsbk-cremona-2026` — categoria MOTORSPORT,
  stato CONFERMATO, `dettagli: "/cremona-circuit-2026"`. Essendo il primo in ordine di data
  apre anche la fascia «Prossimi appuntamenti» (che resta a massimo tre voci).
- `web/pages/motorsport.tsx`: blocco «In primo piano» in testa — date, round, sede e tre
  pulsanti (scheda completa Cremona, biglietti ufficiali, sito del circuito). Parcheggi, aree
  e Village NON sono ripetuti qui: stanno solo sulla pagina dedicata.

Snapshot pre-modifica: `un-passo-indietro_2026-09-15_pre-rimando-motorsport.tar.gz`.

Verifiche: script nuovo `verifica-worldsbk-rimandi.py` **24/24** (una sola scheda, una sola
voce in fascia, filtro MOTORSPORT che isola, nessun dettaglio ricopiato) · sport-calendario
tutto in regola · worldsbk-cremona 56/56 · cremona 24/24 · sbk-cremona 88/88 · link 0 rotti ·
esterni 44/44 · nome-tbh-web 122/122 · anteprime 101/101 · palinsesto 351/351 ·
palinsesto-visuale 62/62 · ambienti 37/37 · aurora 44/44 · ceo 50/50 · referral 72/72 ·
corso-antincendio 70/70 · restyling 41/41 · magazine 19/19 · content-hub 65/65 ·
slot-contenuti 14/14 · rullo 31/31 · lint 0 · build OK.

## TBH TV & STREAMING ADV — nuova categoria dello shop (15/09/2026)

Listino ufficiale «TV & STREAMING ADV» della slide Touch Business Holding portato online come
categoria acquistabile del Touch Plaza Shop. Slide di riferimento archiviata in
`public/listini/tv-streaming-adv.jpg`: **nessun prezzo, sconto o piattaforma è stato inventato**
(regola §1).

### Cosa c'è ora

- **Pagina pubblica `/tv-streaming-adv`** (`web/pages/tv-streaming-adv.tsx`) — quattro schede con
  i tre prezzi di listino (pieno, promo, riservato Fidelity), IVA 22% inclusa con netto e imposta
  sempre esposti, cinque posizioni pubblicitarie, sei durate spot, quattro garanzie, i nove
  marchi CTV, il Cashback TBH 100% e i cinque benefici Fidelity. `/shop/tv-streaming-adv`
  rimanda qui: nessun indirizzo perso (§2).
  - TBH TV FRAME `TBH-TVF-01` — 3.000 € / 2.500 € (−17%) / 2.100 € (−30%)
  - TBH VIDEO TV `TBH-VTV-01` — 5.000 € / 4.250 € (−15%) / 3.500 € (−30%)
  - TBH TV IMPACT `TBH-TVI-01` — 7.500 € / 6.375 € (−15%) / 5.250 € (−30%)
  - TBH CTV PREMIUM `TBH-CTV-01` — 20.000 € / 17.000 € (−15%) / 14.000 € (−30%)
- **Configuratore a sei passaggi** nella stessa pagina: prodotto → campagna → contenuto (con la
  durata dove serve, e la nota sul limite nativo dei 30 secondi dell'addressable Mediaset) →
  servizi extra → Fidelity → riepilogo. Il prezzo riservato **non si autodichiara**: si ottiene
  solo dalla verifica lato server sul registro Fidelity, mai da un parametro nell'indirizzo.
- **Area cliente `/le-mie-campagne`** (`web/pages/le-mie-campagne.tsx`) — si entra con email
  dell'ordine **più** numero d'ordine o protocollo (con la sola email non si vede nulla). Tabella
  con ordine, protocollo, prodotto, importo, stato, materiali, campagna, report e Cashback TBH,
  più i KPI del report e l'elenco degli stati della pratica, visibile anche a chi non ha i codici.
- **Pannello riservato `/allestimento/tv-streaming-adv`** (`web/pages/pannello-adv.tsx`), protetto
  dal codice di allestimento: listino e promozioni, servizi extra, registro Fidelity, pratiche
  (stato, cashback, report, note) e sincronizzazione Stripe. Tutto modificabile senza toccare il
  codice.
- **Numerazione**: ordine `TBH-TV-2026-000001`, protocollo `ADV/CTV/2026/000001`; undici stati di
  pratica dal pagamento al cashback.
- **Pagato lo dice solo il webhook**: `/api/webhooks/stripe` con firma verificata. Il ritorno del
  browser dalla pagina di pagamento non conferma nessun incasso.
- **Menu Shop**: aggiunte le voci «TV & Streaming ADV · Pubblicità in onda» e «Le mie campagne
  ADV». Le cinque voci precedenti (`/shop`, `/tbh/prodotti`, `/offerte`, `/pagamenti`,
  `/tbh-app`) sono rimaste tutte al loro posto (§2).

### Correzioni tecniche fatte strada facendo

- `web/components/tiles.tsx` · `euro()`: forzato il raggruppamento delle migliaia. Su browser con
  dati ICU ridotti «3.000,00 €» veniva scritto «3000,00 €» in tutto il sito.
- `api/lib/adv.ts`: il tipo `RigaListino` non ammetteva promo e prezzo Fidelity vuoti; ora sì.
- Il gestore del webhook è stato spostato in `api/lib/adv-webhook.ts`: non è una procedura oRPC e
  in `api/routes/` violava la regola di struttura del template.
- Accessibilità: etichette esplicite su tutti i campi dei tre nuovi schermi.

Snapshot pre-modifica: `un-passo-indietro_2026-09-15_pre-tv-streaming-adv.tar.gz`.

Verifiche: script nuovo `verifica-tv-streaming-adv.py` **90/90** (quattro pacchetti con SKU,
prezzi e pulsanti giusti, posizioni, durate, garanzie, nove piattaforme, benefici, cashback, IVA,
slide a schermo, sei passaggi del configuratore, Fidelity su verifica, area cliente, pannello
protetto, voci di menu vecchie e nuove insieme, console pulita, un solo h1, nessuno sbordo a
390px) · lint **0** · typecheck dei file nuovi **0 errori** · build OK.

### Resta in mano a Claudio

- `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` non sono sul server: l'endpoint `adv.stato`
  risponde `stripeConfigurato: false`, `webhookConfigurato: false`. Finché mancano, il
  configuratore calcola il preventivo e chiude su WhatsApp, e il webhook risponde 503.
  Webhook da registrare su Stripe → Developers → Webhooks, indirizzo `/api/webhooks/stripe`,
  eventi `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.expired`, `charge.refunded`.
- Il regolamento scritto del Cashback TBH 100% (maturazione, tempi, utilizzo): in pagina c'è solo
  quello che dice la slide, niente di più (§1).
- La pubblicazione la fa Claudio dal pannello (§4).
