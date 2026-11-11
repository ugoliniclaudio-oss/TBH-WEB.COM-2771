# TBH-WEB — REGOLE MASTER E CHECKLIST DI LAVORO

Documento vincolante, consegnato da Claudio il 29 settembre 2026.
**Da rileggere prima di ogni intervento.** Quando arriva una richiesta nuova, va inserita in
questa sequenza senza far sparire né compromettere un intervento già approvato.

---

## PRIORITÀ 0 — REGOLA DI SICUREZZA (sempre attiva)

La struttura attuale del sito è **APPROVATA come base**.

**NON si fa:**
- rifare l'architettura generale;
- eliminare pagine funzionanti;
- creare doppioni;
- rinominare route senza necessità;
- modificare loghi ufficiali;
- sostituire immagini corrette;
- eliminare i vecchi checkout prima di aver verificato i nuovi;
- compromettere funzioni già corrette.

**Prima di ogni modifica:**
1. verificare cosa esiste;
2. verificare collegamenti e dipendenze;
3. modificare esclusivamente ciò che serve;
4. testare;
5. solo dopo passare all'intervento successivo.

**Da preservare sempre:** Header · Footer · Canali · Navigazione desktop e mobile ·
Media Library · Magazine · Miss Cool · Sport e Squadre · Shop · Checkout · contenuti già
funzionanti.

Creare un **punto di ripristino** («un passo indietro», in `/home/user/backup-tbh-web/`) prima
degli interventi importanti.

Una modifica **non è completata** solo perché a vederla sembra giusta: si verificano anche i
link, i dati e il funzionamento.

---

## LA SEQUENZA

1. Proteggi struttura
2. Ripara link e loghi
2b. Sistema Scheda · Monitor · Carosello (linguaggio unico del sito)
2c. Eventi: tornei, fiere & itineranti (si classifica per natura, non per luogo)
3. Upload e Media
3a. Sistema universale Immagini e Anteprime (prima dell'allestimento voce per voce)
3b. Musica vs Produzioni: SOLO AUDIO / VIDEO IN PRODUZIONE / AUDIO & VIDEO + Road to 2030
3c. Casting videoclip dentro il ciclo produttivo (dalla scheda del brano alla bacheca)
4. Magazine e articoli
5. Candidature
6. Shop
7. Marketplace
8. Checkout
9. Anteprima e collaudo
10. Finanziamenti e voucher
11. Migrazione vecchio catalogo
12. Collaudo generale

---

## STATO DEI BLOCCHI

| # | Blocco | Stato |
|---|---|---|
| 0 | Regola di sicurezza | attiva, sempre |
| 1 | Link, route, loghi, navigazione | **controllo fatto e verificato** (268 letture, 12.299 link) — restano 21 errori da riparare |
| 1bis | Sistema Scheda · Monitor · Carosello universale | **da fare** — nuovo, aggiunto il 29 settembre 2026 |
| 1ter | Eventi: tornei, fiere & itineranti | **da fare** — nuovo, aggiunto il 29 settembre 2026 |
| 2 | Media Library e upload universale | da fare |
| 2bis | Sistema universale Immagini e Anteprime | **strumento fatto e verificato** (sistema immagini + Lista di lavoro allestimento) — resta da popolare con il materiale reale |
| 2ter | Musica vs Produzioni: audio, videoclip e Road to 2030 | **in corso** — catalogo master e regia videoclip fatti, pagine in aggiornamento |
| 2quater | Casting videoclip dentro il ciclo produttivo | **da fare** — aggiunto il 29 settembre 2026 (secondo invio) |
| 3 | Magazine e anteprime editoriali | da fare |
| 4 | Candidature Miss Cool | **fatto e verificato** (49/49 browser, 26/26 backend) |
| 4b | Candidature Lavoro/Casting | da fare, stesso componente |
| 5 | Shop e inserimento prodotto | da fare |
| 6 | Marketplace, brand e categorie | da fare |
| 7 | Checkout multi-account | da fare |
| 8 | Anteprima e test checkout | da fare |
| 9 | Finanziamenti, consegna, voucher | da fare |
| 10 | Migrazione e collaudo finale | da fare |

---

## PRIORITÀ 1 — LINK, ROUTE, LOGHI, NAVIGAZIONE

Controllare **tutti** gli elementi cliccabili: Header · Canali · Menu · Home · Card · Footer ·
immagini cliccabili · CTA · Magazine · News · Miss Cool · Sport · Squadre · Shop · Prodotti ·
Servizi · Eventi · Lavoro · WhatsApp · Checkout.

Cercare: `href` vuoti · `href="#"` · route inesistenti · vecchie route · redirect errati ·
pulsanti senza azione · link esterni errati.

**Le CTA rotte non si eliminano: si ripristina la destinazione corretta.**

Loghi: ogni componente deve usare gli **asset ufficiali già presenti nel progetto**. Non si
ricreano, non si modificano, non si reinterpretano, non si generano.

Navigazione: ordine dei Canali **senza numerazione visibile**; frecce ← → da computer sui
contenuti orizzontali; swipe da telefono; Header e Footer senza duplicazioni.

Esito da produrre: `✓ FUNZIONANTE` · `✓ RIPARATO` · `⚠ DA COMPLETARE` · `❌ ERRORE`.

### Esito del controllo — 29 settembre 2026 (fatto e verificato)

Controllo automatico su tutte le pagine del sito, da Computer e da Telefono.
Referto completo: `scripts/REFERTO-COLLEGAMENTI.md`.

| Misura | Quantità |
|---|---|
| Pagine aperte | 268 (134 pagine × 2 misure) |
| Collegamenti controllati | 12.299 (6.994 interni · 4.475 esterni · 808 telefono/email) |
| Pulsanti controllati | 2.138 |
| Immagini controllate | 1.366 |
| File (foto, PDF, video) scaricati e verificati | 116 |
| **Errori da riparare** | **21** |
| Da completare (non bloccanti) | 168 |

**I 21 errori — cosa è stato fatto il 29 settembre 2026** (riparazioni sotto, una per una):

| Errore | N. | Stato |
|---|---|---|
| Route inesistenti | 7 | ✓ RIPARATO |
| Link senza destinazione («Apri il sito») | 2 | ✓ RIPARATO e verificato |
| Link fermi su `#` («DJHugoFile0») | 3 | ✓ RIPARATO e verificato |
| Immagine che non arriva (PDF in uno spazio foto) | 1 | ✓ RIPARATO e verificato |
| Pulsanti senza azione in `/design` | 2 | ✓ RIPARATO (erano esempi di stile) |
| Numero di canale a schermo | 6 | ✓ CHIARITO — non erano errori: vedi punto 6 |

**Come sono stati riparati, uno per uno:**

1. **Route inesistenti (7).** Tre casi (`/mappa`, `/rete-commerciale`, `/bacheca`) e il
   tracciato `.json` di `/media/libreria` **non erano guasti del sito**: sono rimandi già
   gestiti dal router e un file che risponde regolarmente. Era lo strumento di controllo a non
   saperlo: ora legge anche la tabella dei rimandi e riconosce i file `.json/.xml/.doc/.ppt/…`.
   Riverificato: 0 errori su quelle due pagine.
   Il caso vero era «Tour Italia ed Europa» → `/eventi`, un indirizzo che il sito non ha.
   Finché Claudio non indica la pagina giusta, il pulsante porta alla pagina di cortesia in
   allestimento: è la regola già scritta in testa a quel file, «mai un link inventato».
   **Domanda aperta per Claudio: dove deve portare «Tour Italia ed Europa»?**
2. **Link senza destinazione (2).** Il pulsante «Apri il sito» usciva con `href=""` quando il
   dato del sito era una stringa vuota. Ora il contenitore dei marchi normalizza il vuoto e
   ricade correttamente su «Scrivici su WhatsApp». Trovati e riparati anche due punti
   (`/brand/:slug` e `/pagine-tbh`) che passavano per errore **l'elenco** degli indirizzi al
   posto di un indirizzo: ora passano il primo indirizzo reale.
3. **Link fermi su `#` (3).** La freccia «avanti» della navigazione brani accettava il comando
   di scorrimento e poi non lo usava, uscendo come link a `#`. Ora fa esattamente come la
   freccia «indietro»: se la pagina passa il comando di scorrimento diventa un pulsante vero.
4. **Immagine che non arriva (1).** Il file esiste ed è raggiungibile: è un **PDF** caricato in
   uno spazio foto, e il pannello lo metteva dentro un `<img>` (riquadro bianco). La regola
   «immagine o documento» esisteva già in un componente: è stata tirata fuori una volta per
   tutte (`AnteprimaMedia`) e applicata anche al pannello. Ora si legge «Documento PDF —
   prova.pdf». Nessun file di Claudio è stato cancellato.
5. **Pulsanti senza azione (2).** `/design` è la pagina-campionario dello stile: quei due
   bottoni sono esempi da guardare, non comandi. Restano identici a vedersi, ma non sono più
   pulsanti cliccabili che non fanno niente.
6. **Numeri di canale (6).** La regola approvata («i canali senza numerazione visibile»)
   riguarda la **navigazione di TBH**. Le sei segnalazioni erano invece: «canale 88» nel testo
   che descrive le repliche TV di Made in Bo, e «Canale 5» / «canale 214 del telecomando Sky»
   dentro notizie aggregate da fonti esterne. Cancellarle sarebbe un danno, non una
   riparazione. Lo strumento ora separa le due cose: numero di canale **in un elemento di
   navigazione** = errore; numero di canale **in un testo scritto** = da leggere.

**Elenco originale dei 21 errori, come misurati prima delle riparazioni:**

1. Route inesistenti (7): «Tour Italia ed Europa» → `/eventi` (rotta assente) in
   `/eventi/fiere-internazionali`, `/hugoland`, `/touch-travels`,
   `/touch-travels/fiere-internazionali`; in `/in-allestimento` → `/mappa`,
   `/rete-commerciale`, `/bacheca`; in `/media/libreria` →
   `/import/medialibrary-tracciato.json`.
2. Link senza destinazione (2): «APRI IL SITO» in `/media/heddy-video` e `/tbh/touch-fashion`.
3. Link fermi su `#` (3): «DJHUGOFILE0» in `/dj-hugo`, `/musica`, `/musica/jc-hugo`.
4. Immagine che non arriva (1): in `/allestimento`, un PDF caricato al posto di una foto
   (`…/1789623716342-prova.pdf`).
5. Pulsanti senza azione (2): «CTA primaria» e «CTA secondaria» in `/design`.
6. Numero di canale visibile a schermo (6): «canale 88» in `/dm`, `/media/dm`,
   `/media/dm/crew`, `/sport/squadre`; «Canale 5» e «canale 214» in `/edicola`.

**Le 168 voci da completare**: 10 loghi tagliati (`cover` invece di `contain`), 6 ancore da
controllare a mano, 16 immagini senza testo alternativo, 66 immagini ancora in caricamento
(in gran parte anteprime di testate esterne su `/edicola`, caricamento pigro legittimo),
più segnalazioni minori. Si valutano una per una, non in blocco.

---

## PRIORITÀ 1bis — SISTEMA SCHEDA · MONITOR · CAROSELLO (UNIVERSALE)

Aggiunta il 29 settembre 2026 su indicazione di Claudio (quattro documenti: «Palinsesto →
Scheda → Contenuto», «Aggiornamento comunicazione audiovisiva», «Sistema anteprime, vetrine e
caroselli», più la richiesta del carosello DM Sport Live).
**Nessun blocco già approvato viene rimosso o spostato:** questo è un prerequisito strutturale
che sta in mezzo, perché Magazine, Shop, Eventi, Lavoro e Checkout (Priorità 3, 5, 6, 7, 9)
useranno gli stessi pezzi.

### La grammatica del sito, sempre la stessa

`PALINSESTO → CANALE/PULSANTE → SCHEDA → ANTEPRIME → CONTENUTO → AZIONE → ALTRO CONTENUTO`

Principio: **VEDO → CAPISCO → SCELGO → APRO → AGISCO → CONTINUO.**
Cambia il contenuto, non cambia il funzionamento. Nessun vicolo cieco: ogni contenuto porta a
un altro contenuto pertinente.

### a) La scheda unica, a moduli

Un solo motore di scheda, con moduli che si accendono e si spengono:
Monitor/Hero · News · Articoli · Video · Live · Galleria · Prodotti · Servizi · Eventi ·
Calendario · Squadre · Risultati · Classifiche · Motorsport · Copertine · Magazine · Inserti ·
Candidature · Download · Contatti · Social · Mappa · Prenotazione · Checkout · Voucher ·
Contenuti correlati.

Ogni scheda mostra: Monitor · Logo o immagine · Titolo · Descrizione breve · Riferimenti ·
Contenuti in evidenza · Link · CTA · Caroselli · Correlati.
**Un modulo vuoto non si mostra.** Nessun pulsante non pertinente.

Azioni ammesse: ENTRA · APRI · LEGGI · GUARDA · APRI SITO · COMPRA · PRENOTA · PARTECIPA ·
SCARICA · CONTATTA · RICHIEDI INFO · RICHIEDI PREVENTIVO · RICHIEDI FINANZIAMENTO.
Le azioni secondarie si raccolgono sotto `[ ALTRE AZIONI ]`.

### b) Il Monitor

Il Monitor non è solo un'immagine: immagine · logo · copertina · video · streaming ·
slideshow · carosello · galleria · anteprima di articolo, prodotto o evento.
Dall'amministrazione: `[ CARICA IMMAGINE ]` `[ SCEGLI DALLA LIBRERIA ]` `[ INCOLLA URL ]`
`[ SELEZIONA VIDEO ]` `[ INSERISCI EMBED ]` `[ COLLEGA STREAMING ]`, più il tipo di monitor,
compreso «automatico» (prende il contenuto principale che c'è, senza inventarne).

### c) Le anteprime, una forma per ogni tipo di contenuto

| Tipo | Cosa mostra la card | Azione |
|---|---|---|
| News | foto · categoria · titolo · estratto breve | `[ LEGGI ]` |
| Prodotto | foto · brand · nome · prezzo | `[ VEDI ]` `[ COMPRA ]` |
| Evento | foto · titolo · data · luogo | `[ SCOPRI ]` `[ PRENOTA ]` |
| Magazine | copertina · numero · mese e anno | `[ SFOGLIA ]` |
| Video | anteprima · titolo · durata | `[ GUARDA ]` |
| Lavoro | logo o foto · posizione · azienda · luogo | `[ CANDIDATI ]` |
| Casting | foto · produzione · ruolo cercato · scadenza | `[ PARTECIPA ]` |
| Squadra | stemma o foto · nome · campionato | `[ SEGUI ]` |

Mai una card senza immagine quando l'immagine esiste. Mai il solo titolo. Mai un link anonimo.
Questa è la risposta al problema noto di **Elena di Cuori** (contenuti ridotti a un link di
testo): la forma con foto, titolo, anteprima, provenienza e CTA diventa lo standard per tutti i
contenuti editoriali.

### d) I caroselli

Frecce `←  →` grandi e visibili da computer, swipe da telefono; **da computer non si obbliga
mai a trascinare**. Da computer 3-5 card, da tablet 2-3, da telefono 1-2 card con un pezzo
della successiva. `[ VEDI TUTTI → ]` quando ha senso.

Caroselli da avere: **Spot TBH** (società, servizi, 25 Piani, Touch Academy, Touch Rent,
Consulia, Touch Production, Touch Fashion, Touch Miss Cool) · **Spot DM** (separato: programmi,
produzioni, DM Sport, dirette, interviste, video) · **Shop/Touch Plaza** · **Bacheca Lavoro** ·
**Bacheca Casting** (separata da Lavoro) · **Eventi** · **DA NON PERDERE** (editoriale) ·
**DM Sport Live**.
I caroselli non si mettono tutti in tutte le pagine: ogni area ha la sua sequenza.

Dall'amministrazione, per ogni carosello: titolo · sottotitolo · fonte dei contenuti ·
categoria · numero di card · ordinamento · manuale o automatico · contenuti fissati · CTA ·
pagina di destinazione. Comandi: Attiva · Disattiva · Sposta · Anteprima · Pubblica.

### e) Carosello DM SPORT LIVE

Prende gli articoli recenti da `dmsportlive.it` **senza ricopiarli a mano**: solo anteprima
(immagine originale dell'articolo, categoria piccola, titolo grande, estratto di massimo 3
righe) e `[ LEGGI SU DM SPORT → ]` che apre **l'articolo originale**, non la home. In fondo
`[ TUTTE LE NOTIZIE DM SPORT → ]`. Dal più recente al meno recente, aggiornamento automatico.
Priorità: squadre seguite TBH/DM → calcio territoriale → motorsport → altro sport.
Non si copia l'articolo intero: anteprima e rimando alla fonte.

**Verifica tecnica già fatta (29 settembre 2026):** `dmsportlive.it` è WordPress. I percorsi
`/feed`, `/feed/`, `/rss` rispondono «non trovato»; funzionano invece
`?feed=rss2` e soprattutto `index.php?rest_route=/wp/v2/posts&per_page=N&_embed=1`, che
restituisce per ogni articolo data, titolo, indirizzo, estratto, **immagine reale** e
**categoria**. Da decidere: leggerlo da un nostro punto interno con memoria temporanea, per non
dipendere dal browser del visitatore.

### f) Contenuto master, mai duplicato

Uno stesso contenuto (esempio: SBK a Cremona) può comparire in Motorsport, News, Edicola,
Eventi e DM, ma **esiste una sola scheda vera**. Tutte le altre aree ne mostrano solo
l'anteprima e rimandano a quella. Vale per prodotti, articoli, eventi, video, aziende,
squadre, casting, offerte di lavoro.

### g) Controllo doppioni, prima di creare qualsiasi cosa

Prima di ogni nuovo componente o nuova scheda si cerca nel progetto per nome, route, titolo e
contenuti. **Attenzione:** DM, DM Comunicazioni, DM Sport e DM TV Productions **non** sono
doppioni per forza; così Shop, Touch Plaza, Touch Fashion e Fan Club. Se una cosa è davvero
doppia: si unifica senza perdere contenuti, si tiene la route principale, si rimanda dalla
secondaria. **Non si cancellano informazioni.**

Inventario già fatto dei pezzi riusabili che esistono oggi — **si estendono questi, non se ne
creano di nuovi con lo stesso compito:**

| Pezzo esistente | Usato in | Compito |
|---|---|---|
| `carosello-orizzontale.tsx` | 6 pagine | carosello con frecce |
| `carosello-media.tsx` | 3 pagine | carosello di media |
| `content-card.tsx` | 1 pagina | card di contenuto |
| `card-edicola.tsx` | 4 pagine | card editoriale |
| `monitor.tsx` · `monitor-url.tsx` | 9 · 6 pagine | monitor della scheda |
| `hero-sezione.tsx` | 8 pagine | testata di sezione |
| `vetrina.tsx` · `slot-contenuti.tsx` | 2 · 8 pagine | vetrine di contenuti |
| `media-slot.tsx` | 16 pagine | spazio media amministrabile |
| `tiles.tsx` | 27 pagine | griglia di riquadri |
| `rullo-tbh.tsx` · `zapping.tsx` | 2 · 3 pagine | nastri scorrevoli |

### h) Immagini — regola vincolante

**Non si generano immagini finte da usare come contenuto reale.** Ordine delle fonti:
immagini ufficiali già caricate → loghi ufficiali → fotografie originali → copertine reali →
immagini prodotto reali → anteprime video reali → immagini da fonti autorizzate →
Media Library → indirizzo immagine autorizzato. Se manca: segnaposto neutro
**«IMMAGINE IN AGGIORNAMENTO»**.
Mai volti femminili generati dal computer come se fossero concorrenti di Touch Miss Cool.
Mai persone, prodotti, squadre, piloti, eventi, luoghi o marchi inventati.
Logo `object-fit: contain`, fotografia `object-fit: cover`, mai deformare.

### i) Identità dei canali, da non mescolare

**DM**: media, TV, video, produzioni, streaming — testata con grande monitor video, «ora in
onda», dirette, programmi, DM Sport, interviste, highlights, repliche, prossimamente.
**Edicola**: portale per argomenti, non deve somigliare a DM.
**Touch Influencity Magazine**: copertina reale dell'ultimo numero, numerazione verificata.
**Radio**: lettore audio con play, pausa, diretta, volume.
**DJ Hugò**: esclusivamente musicale, **non** un secondo DM; solo fotografie ufficiali.
**Sport** e **Motorsport**: distinti, ognuno con la sua identità.
**Touch Miss Cool**: esperienza dedicata. **Touch Plaza**: non si elimina perché incompleta,
si mostra ciò che esiste.

### l) Rotazione delle vetrine per periodo

Per ogni contenuto in vetrina: priorità · data inizio · data fine · «fissa in evidenza».
Esempi: durante il TTG → Turismo, Fiere, TBH; durante la SBK → Motorsport, News, DM; durante
Miss Cool → Miss Cool, Magazine, Casting; in ricerca personale → Lavoro, Casting, Academy.

### m) Home, Header, Footer, Ricerca

**Home/Palinsesto**: non un elenco enorme; monitor visuali per canale e, sotto, vetrine
dinamiche (Ora in evidenza · Ultime news · Da guardare · Prossimi eventi · Dallo shop ·
Lavoro e Casting) **senza ricopiare il menu**.
**Header**: leggero, sempre funzionante, non riempito con tutte le destinazioni.
**Footer**: non una seconda home; colonne TBH · Media · Servizi · Shop · Lavoro · Contatti,
social, dati societari, privacy, cookie, termini, copyright. Solo link che funzionano.
**Ricerca**: cerca su canali, articoli, prodotti, eventi, video, magazine, squadre, servizi,
aziende, lavoro, casting; ogni risultato con immagine, tipo, titolo, descrizione e CTA.
Ogni pagina finisce con «Ti può interessare anche» e «Scopri altri canali», con rimandi veri.

### n) Ordine di lavoro chiesto da Claudio (una fase per volta, verificata)

1. Censimento (fatto per i link: Priorità 1; da completare per schede e componenti).
2. Punto di ripristino.
3. Componenti: Card · Hero · Monitor · Carosello · CTA · Galleria · Lettore · Card prodotto ·
   Card news · Card evento · Card lavoro · Card casting.
4. Schede: i componenti si applicano alle pagine **esistenti**.
5. Media. 6. Navigazione e correlazioni. 7. Commercio. 8. Computer/tablet/telefono.
9. Collaudo. 10. Pubblicazione solo dopo confronto PRIMA/DOPO.

### o) NON REGRESSIONE (regola vincolante)

Il restyling **non deve** causare: pagine sparite · link rotti · loghi sostituiti · immagini
perse · checkout eliminati · form non funzionanti · contenuti duplicati · route cambiate senza
motivo.
**Se una modifica può compromettere una funzione che già c'è: non si applica da sé. Si segnala
il conflitto.**

### p) Dove finiscono le altre parti dei quattro documenti

Non si perde nulla: le parti che riguardano blocchi già approvati restano in quei blocchi.

| Argomento del documento | Blocco che lo contiene |
|---|---|
| Caricamento media, ridimensionamento, formati, alt, anteprima | Priorità 2 |
| Pannello di gestione della scheda senza toccare il codice | Priorità 2 + 1bis (a) |
| Magazine, copertine, numerazione, card editoriali | Priorità 3 |
| Edicola come portale per argomenti | Priorità 3 + 1bis (i) |
| Bacheca Lavoro e Bacheca Casting (candidature) | Priorità 4b |
| Shop: scheda prodotto, categorie, galleria, prezzo | Priorità 5 + 6 |
| Checkout per singolo prodotto, mai uno Stripe unico | Priorità 7 + 8 |
| Eventi con prenotazione, acconto, voucher | Priorità 9 |
| Controllo link e checkout prima e dopo ogni restyling | Priorità 1 (strumento già pronto) + 10 |

---

## PRIORITÀ 1ter — EVENTI: TORNEI, FIERE E ITINERANTI

Aggiunta il 29 settembre 2026 su indicazione di Claudio (documento «Eventi territoriali e fiere
itineranti»). **Nessun blocco già approvato viene rimosso o spostato:** questo blocco sta
subito dopo 1bis perché usa gli stessi pezzi (scheda, Monitor, anteprime, caroselli) e perché
Eventi compare già in Priorità 1 (link da controllare) e in Priorità 9 (prenotazioni e
voucher): qui si decide **come si classifica** un evento, là **come si incassa**.

### a) La regola generale — si classifica per NATURA, non per LUOGO

Il **luogo è un attributo** della scheda, non la sua categoria.
La **categoria dipende dalla natura dell'evento**.

- un torneo che si svolge a Verucchio resta un **EVENTO SPORTIVO / TORNEO**;
- una fiera che si svolge a Verucchio appartiene a **FIERE & EVENTI ITINERANTI**.

Entrambi possono essere richiamati nella pagina `TERRITORIO → VERUCCHIO`
**senza duplicare le schede**: una sola scheda master, più vetrine che la richiamano
(è la stessa regola di 1bis (f), non una regola nuova).

### b) I due gruppi, separati

**1. TORNEI & EVENTI SPORTIVI** — gruppo autonomo. Ci vanno per esempio:

| Evento | Tipo | Area | Territorio |
|---|---|---|---|
| **MEMORIAL PROTTI** | Torneo / Memorial sportivo | Sport · Tornei & Eventi Sportivi | Sant'Ermete |
| Eventuale torneo a Verucchio | Torneo (1ª edizione, 2027) | Sport · Tornei & Eventi Sportivi | Verucchio |

Il Memorial Protti **non va messo** tra le Fiere Itineranti. Nella pagina territoriale
pertinente compare come card/anteprima che apre la sua scheda TORNEO.

**2. FIERE & EVENTI ITINERANTI** — sezione autonoma, **non appartiene al palinsesto DM**:
è una vetrina del palinsesto generale TBH. Ci va tutto ciò che non è torneo sportivo:
fiere · sagre · mercatini · festival · manifestazioni · street food · eventi territoriali ·
eventi commerciali · eventi promozionali · eventi culturali · eventi itineranti.

### c) Stato dell'evento — niente eventi annunciati per sbaglio

Finché nome, organizzazione, date e dettagli non sono confermati, il contenuto si tratta come
**PROGETTO / IN PROGRAMMAZIONE**, mai come evento confermato.

Stati ammessi: `PROGETTO` · `IN PROGRAMMAZIONE` · `CONFERMATO` · `APERTO` · `IN CORSO` ·
`CONCLUSO` · `ANNULLATO`.

Esempio del torneo di Verucchio: parte come `PROGETTO`, 1ª edizione, 2027, territorio
Verucchio. Quando arriva la conferma si passa a `CONFERMATO` e solo allora si aggiungono date,
location, programma, partecipanti, locandina, contatti ed eventuali iscrizioni.

### d) Scheda evento — usa il sistema universale di 1bis

**Monitor** in alto: foto, locandina o video **reali**.
Poi, sempre: `NOME EVENTO` · `TIPOLOGIA` · `EDIZIONE` · `DATA` · `ORARIO` · `LUOGO` ·
`COMUNE` · `ORGANIZZATORE` · `DESCRIZIONE`.
Quando disponibili: `PROGRAMMA` · `MAPPA` · `COME ARRIVARE` · `GALLERY` · `VIDEO` · `NEWS` ·
`CONTATTI` · `SITO` · `SOCIAL`.

CTA **dinamiche**, si mostra **solo quello che esiste davvero**:
`[ SCOPRI ]` `[ PROGRAMMA ]` `[ APRI SITO ]` `[ COME ARRIVARE ]` `[ PRENOTA ]`
`[ ACQUISTA ]` `[ PARTECIPA ]`.

### e) Format itinerante → tappe

Uno stesso format può cambiare località. **Non si creano tre eventi separati:**

`FORMAT MASTER → TAPPE → SINGOLA TAPPA`

La scheda della singola tappa contiene solo ciò che cambia: città, location, data, orario,
programma, informazioni specifiche. Esempio: stesso evento con tappa a Verucchio, a Rimini,
a San Marino.

### f) Vetrina «FIERE & EVENTI ITINERANTI»

Carosello orizzontale (frecce da computer, swipe da telefono — regola 1bis (d)):
titolo **FIERE & EVENTI ITINERANTI**, sottotitolo «Scopri gli appuntamenti sul territorio»,
card con foto reale, nome evento, comune, data, `[ SCOPRI ]`, e in coda
`[ VEDI TUTTI GLI EVENTI ]`.

### g) Il territorio è un FILTRO, non una categoria

`VERUCCHIO` · `RIMINI` · `NOVAFELTRIA` · `SANT'ERMETE` · `SAN MARINO` … funzionano come
**filtri territoriali**. Una pagina territoriale può mostrare: in evidenza · prossimi eventi ·
tornei & sport · fiere/manifestazioni · turismo · news dal territorio · gallery · contenuti
correlati. Questo **non** significa che quei contenuti appartengano alla stessa categoria:
un torneo cliccato da lì apre la scheda TORNEO, una fiera apre la scheda FIERE & ITINERANTI.

### h) Campi della scheda evento (database)

`ID EVENTO` · `NOME` · `TIPOLOGIA` · `CATEGORIA` · `SOTTOCATEGORIA` · `FORMAT` · `EDIZIONE` ·
`DATA INIZIO` · `DATA FINE` · `LUOGO` · `COMUNE` · `TERRITORIO` · `ORGANIZZATORE` · `STATO` ·
`DESCRIZIONE` · `IMMAGINE` · `GALLERY` · `VIDEO` · `SITO` · `SOCIAL` · `CONTATTI` · `CTA` ·
`PRENOTAZIONE` · `BIGLIETTI`.

### i) Principio finale

**Non si classifica per luogo: si classifica per natura del contenuto.** Il luogo serve poi a
creare i collegamenti trasversali.

| Contenuto | Categoria | Territorio |
|---|---|---|
| Memorial Protti | Tornei | Sant'Ermete |
| Torneo Verucchio 2027 | Tornei | Verucchio |
| Fiera a Verucchio | Fiere & Eventi Itineranti | Verucchio |
| Street food a Rimini | Fiere & Eventi Itineranti | Rimini |

**Una sola scheda master per evento. Più vetrine possono richiamarla.**

### l) Cosa serve da Claudio prima di costruire

Non si inventa nulla: servono i dati reali. Da confermare, evento per evento:
locandina/foto reale · edizione · date · orario · luogo esatto · organizzatore · programma ·
squadre/partecipanti · contatti · sito · social. Finché mancano, la scheda resta
`PROGETTO / IN PROGRAMMAZIONE` con il segnaposto dichiarato (regola 1bis (h)).

---

## PRIORITÀ 2 — MEDIA LIBRARY E UPLOAD UNIVERSALE

**Una sola** Media Library centralizzata. In ogni sezione amministrabile:
`[ CARICA IMMAGINE ]` `[ SCEGLI DALLA LIBRERIA ]` `[ INCOLLA URL IMMAGINE ]` `[ SOSTITUISCI ]`.

Da applicare a: Prodotti · Magazine · News · Miss Cool · Squadre · Sport · Eventi ·
Lavoro/Casting · Produzioni · Turismo · Musica · Sponsor.

JPG/JPEG/PNG/WEBP e PDF dove serve. Conservare il **master originale**. Generare da sé le
versioni thumbnail · card · standard · hero, senza deformare.

Formati: 16:9 editoriale · 4:5 persone · 1:1 loghi e prodotti quando ha senso · verticale
originale per il Magazine. **Loghi: `object-fit: contain`, nessun taglio.**

Anteprima prima della pubblicazione. Ottimizzazione automatica di peso e qualità.
L'amministratore non deve sapere niente di pixel, compressione o formati.

---

### PRIORITÀ 2bis — SISTEMA UNIVERSALE IMMAGINI E ANTEPRIME
*(richiesta di Claudio del 29 settembre 2026. Sta dentro la Priorità 2, non è un blocco nuovo:
la Media Library esisteva già e non si duplica. È la parte da costruire **per prima**, perché
Claudio l'ha messa davanti all'allestimento voce per voce: prima lo strumento, poi si popola
un contenuto alla volta.)*

**Il problema, detto come sta.** I contenuti esistono già come dati — titolo, categoria,
descrizione, prezzo, codice, CTA — ma manca quasi sempre **la faccia visiva**. Al suo posto
compare la scritta generica «Logo ufficiale da ricevere».

#### a) Prima correzione: non tutto ha un logo
Un corso, un kit beauty, uno stand, un DJ set hanno bisogno di una **foto di copertina**,
non di un logo. Il logo si chiede **solo dove esiste davvero un marchio**. La scritta di
attesa deve dire la verità su quel contenuto:
«Foto del prodotto da caricare» · «Locandina da ricevere» · «Logo ufficiale da ricevere»
(solo per marchi) · «Copertina da caricare».

#### b) Blocco MEDIA in ogni scheda del pannello
```text
┌──────────────────────────────────────────────────────┐
│ IMMAGINE / ANTEPRIMA                                 │
│        ┌───────────────────────────────┐             │
│        │    ANTEPRIMA DELLA CARD       │             │
│        └───────────────────────────────┘             │
│ [ + CARICA IMMAGINE ]  [ MEDIA LIBRARY ]             │
│ [ INCOLLA URL IMMAGINE ]                             │
│ Tipo: ○ Foto prodotto ○ Logo ○ Locandina             │
│       ○ Copertina ○ Thumbnail video ○ Immagine servizio │
│ Adattamento: [ Automatico ▼ ]                        │
│ [ RITAGLIA ] [ CENTRA ] [ MIGLIORA ] [ SOSTITUISCI ] │
│        [ ANTEPRIMA DESKTOP ]  [ MOBILE ]             │
│                     [ SALVA ]                        │
└──────────────────────────────────────────────────────┘
```

#### c) Tre modi per mettere l'anteprima — sempre tutti e tre
1. **CARICA FILE** — la foto o il logo è sul PC/telefono: si scegle il file e il sito la prepara.
2. **SCEGLI DALLA MEDIA LIBRARY** — l'immagine è già nel portale (es. logo Touch Production):
   si riusa. **Non si ricarica e non si ricrea.**
3. **INCOLLA URL IMMAGINE UFFICIALE** — per prodotti di negozi esterni, quando è consentito
   usare quell'immagine. Si salva il riferimento. Per un negozio esterno si usano **sempre
   immagini e collegamenti ufficiali del venditore**.

#### d) Una sola immagine master, tutte le misure fatte dal sito
Claudio non prepara 50 dimensioni della stessa foto. Carica **un master di buona qualità** e
il sito genera da sé: **card canale → card prodotto → hero scheda → miniatura carosello →
versione mobile → risultati ricerca → vetrina**.

| Uso | Rapporto | Adattamento |
|---|---|---|
| Card | 16:9 | `cover` |
| Miniatura | 4:3 o quadrata dove serve | `cover` |
| Hero | 16:9 | `cover` |
| Logo | qualsiasi | `contain`, **mai tagliato** |

Una foto verticale **non deve rompere l'impaginazione**: il contenitore resta della stessa
misura. Le card mantengono dimensioni omogenee anche con immagini originali diverse.

#### e) Campi da aggiungere a ogni scheda
`IMMAGINE PRINCIPALE` · `LOGO (se esistente)` · `GALLERY` · `THUMBNAIL` ·
`URL IMMAGINE ESTERNA` · `ALT TEXT` · `FOCAL POINT` · `TIPO MEDIA`.

#### f) Comandi e anteprime
Comandi: `RITAGLIA` · `CENTRA` · `ZOOM` · `FOCAL POINT` · `SOSTITUISCI` · `RIMUOVI`.
Subito dopo il caricamento si vedono: `ANTEPRIMA CARD` · `ANTEPRIMA SCHEDA` ·
`ANTEPRIMA DESKTOP` · `ANTEPRIMA MOBILE`.

#### g) Regola ferrea
**Non deformare immagini. Non tagliare loghi. Non ricostruire loghi. Non generare
automaticamente immagini false.** Nessuna copia manuale della stessa immagine.

#### h) Filtri nel pannello /allestimento
`SENZA IMMAGINE` · `SENZA LOGO` · `SENZA LINK` · `SENZA CHECKOUT` · `SENZA DESCRIZIONE` ·
`INCOMPLETI`. Ogni riga: `ANTEPRIMA | TITOLO | CATEGORIA | STATO | MODIFICA`.

```text
[vuoto] KIT BEAUTY BASE | Beauty | ⚠ IMMAGINE MANCANTE | [ALLESTISCI]
[foto]  KIT BEAUTY BASE | Beauty | ✓ IMMAGINE PRESENTE  | [MODIFICA]
```
`[ALLESTISCI]` apre **direttamente la scheda giusta**, già pronta sul blocco MEDIA.

#### i) Un componente solo, riusato in tutto TBH-WEB
Canali · Società · Attività · Servizi · Shop · Fashion · Social · DM · Sport · Squadre ·
Motorsport · Eventi · Fiere · Hospitality · Lavoro · Casting · Magazine · News · Edicola ·
Musica · Produzioni · Network · Clienti · Partner · Sponsor.
(Coerente con la regola anti-doppioni della Priorità 1bis (g): **si estende ciò che esiste**
— Media Manager, Libreria Media, blocco anteprima — non si apre un secondo sistema.)

#### l) Prodotti esterni: campo TIPO ACQUISTO
Per un prodotto di un venditore terzo servono: `URL IMMAGINE UFFICIALE` · `URL PRODOTTO` ·
`VENDITORE` · `TIPO ACQUISTO` (`Checkout TBH` / `Sito del venditore` / `WhatsApp`).
I pulsanti di pagamento appaiono **solo quando hanno un URL valido** (regola già in vigore
nel negozio).

#### m) Vincolo di sicurezza sui dati già presenti
Aggiungendo le immagini **non si modifica** titolo, prezzo, descrizione, URL o checkout
esistenti. Lo Shop ha già prezzi, codici, WhatsApp e finanziamento su molti articoli
(es. *Accredito Partner Shop*, €610, descrizione e due CTA): non si ricostruisce niente,
**gli manca solo la faccia visiva**.

#### n) Obiettivo
Ogni contenuto del sito deve poter passare da testo/link a **vera anteprima visuale senza
toccare il codice della pagina**. Poi si procede voce per voce: Claudio dice «partiamo dal
Kit Beauty Base», carica la foto, si salva e la riga diventa ✅ completa.

#### o) Primi contenuti da allestire (indicati da Claudio)
`KIT BEAUTY BASE` €88 (Beauty) · Elena di Cuori: `Bikini Regina di Cuori` €129 ·
`Costume intero Iconic Monogram` €129 · `Aida reggiseno` €230.
Hanno già titolo, prezzo, descrizione e CTA: **manca solo l'immagine**, che deve arrivare
da Claudio o dal sito ufficiale del venditore. **Nessuna immagine inventata o generata.**

---

### PRIORITÀ 2ter — MUSICA vs PRODUZIONI: SOLO AUDIO, VIDEOCLIP, ROAD TO 2030
*(richiesta di Claudio del 29 settembre 2026. Correzione di classificazione: non è un blocco
nuovo di funzioni, è la verità sui contenuti già pubblicati. Sta dopo il sistema immagini
perché la copertina del brano e l'anteprima del videoclip usano quello stesso sistema.)*

**L'errore da correggere, detto come sta.** Il catalogo musicale è **audio pubblicato**.
Non sono produzioni audiovisive già realizzate. Mostrare i brani sotto «Produzioni
audiovisive» come se fossero videoclip completati è una dichiarazione falsa.

#### a) Chi è la casa di che cosa
· **Musica TBH** (`/musica`) → la casa del **catalogo audio** attuale.
· **Touch Production** (`/tbh/produzioni`) → la casa della **lavorazione audiovisiva**.
· **Road to 2030** → il **ponte** fra le due: la coda dei brani da trasformare in videoclip.

Lo spostamento è **logico, non fisico**: i record non si duplicano e non si spostano.

#### b) Tre stati, e soltanto tre
| Stato | Che cosa significa | Che cosa si vede |
|---|---|---|
| 🎵 SOLO AUDIO | brano pubblicato, videoclip non realizzato | audio + `VIDEOCLIP DA REALIZZARE` + `[ROAD TO 2030]` |
| 🎵+🎬 VIDEO IN PRODUZIONE | audio pubblicato, video in lavorazione | audio + `🎬 VIDEOCLIP IN PRODUZIONE` con la fase reale |
| 🎵+🎬 AUDIO & VIDEO | entrambi disponibili | audio + `🎬 VIDEOCLIP UFFICIALE [GUARDA]` |

**Le fasi interne della produzione** (ordine del 29/09/2026, secondo invio):
`CONCEPT → CASTING → PRE-PRODUZIONE → RIPRESE → MONTAGGIO → POST-PRODUZIONE → COMPLETAMENTO`.
Valgono solo mentre il video è **in produzione**; non compaiono su un brano solo-audio.

**Vietato:** mostrare il simbolo VIDEO su un brano che ha solo audio · un player video
finto · usare la copertina come se fosse un videoclip.

#### c) Scheda del brano — una sola, che cresce
```text
[COVER REALE]            [COVER AUDIO] [THUMBNAIL VIDEO]
TITOLO BRANO             TITOLO BRANO
J.C. HUGÒ / TOUCH MUSIC  J.C. HUGÒ / TOUCH MUSIC
🎵 AUDIO PUBBLICATO      🎵 AUDIO PUBBLICATO   [ ▶ ASCOLTA ]
[ ▶ ASCOLTA ]            🎬 VIDEOCLIP UFFICIALE [ GUARDA ]
VIDEOCLIP DA REALIZZARE
[ ROAD TO 2030 ]
```
Quando esce il videoclip **non si crea una seconda scheda**: si aggiorna quella del brano e
la classificazione passa da SOLO AUDIO a AUDIO & VIDEO da sé.

#### d) Titolo e sotto-menu di Musica TBH
Titolo pubblico: **TOUCH MUSIC · IL CATALOGO UFFICIALE DI J.C. HUGÒ**, con `/musica/jc-hugo`
collegato alla stessa area (nessuna seconda pagina gemella).
Filtri: `[TUTTI I BRANI] [SOLO AUDIO] [AUDIO + VIDEO] [VIDEO IN PRODUZIONE] [NUOVE USCITE]
[PLAYLIST] [GENERI]`

**La card del brano** porta: cover reale · titolo · `J.C. Hugò / Touch Music` · genere se
disponibile · anno/data se disponibile · stato audio · stato videoclip · `[ASCOLTA]` ·
`[GUARDA]` **solo se il video esiste davvero** · collegamento alla **scheda completa**.

#### e) Sezioni di Produzioni audiovisive
`[VIDEOCLIP MUSICALI] [VIDEOCLIP PUBBLICATI] [VIDEOCLIP IN PRODUZIONE] [CINEMA]
[FORMAT] [REALITY] [ALTRE PRODUZIONI]`
I brani solo-audio **non riempiono** «Videoclip pubblicati»: compaiono solo dentro Road to
2030 come `VIDEOCLIP DA REALIZZARE`.

#### f) Road to 2030
È l'**unico** posto dove è corretto mostrare tutto il catalogo audio, perché lì rappresenta
la coda di produzione. Obiettivo dichiarato: **tutti i brani pubblicati diventano anche
videoclip entro il 2030**. Flusso completo:
`BRANO AUDIO PUBBLICATO → VIDEOCLIP DA REALIZZARE → CONCEPT → CASTING APERTO → CANDIDATURE →
SELEZIONE CAST/CREW → PRE-PRODUZIONE → RIPRESE → MONTAGGIO → POST-PRODUZIONE → VIDEOCLIP
COMPLETATO → PUBBLICAZIONE → SCHEDA AGGIORNATA → 🎵 AUDIO + 🎬 VIDEO`.

Contatori **dinamici**, nessun totale scritto a mano nel testo: brani pubblicati · videoclip
pubblicati · videoclip in produzione · videoclip da realizzare · **avanzamento %**.
`VIDEOCLIP DA REALIZZARE = TOTALE BRANI PUBBLICATI − VIDEOCLIP COMPLETATI`.

#### g) Database master — un solo record per brano
`ID BRANO · TITOLO · COVER · AUDIO URL · STATO AUDIO · GENERE · ANNO/DATA · VIDEO URL ·
STATO VIDEO · THUMBNAIL VIDEO · ANNO VIDEO PREVISTO · STATO PRODUZIONE · CASTING COLLEGATO`
Le pagine **interrogano lo stesso record** in modo diverso: Musica → tutti · J.C. Hugò →
catalogo artistico · Produzioni → solo produzione video attiva o completata · Road to 2030 →
quelli ancora da trasformare · Videoclip → solo quelli con video reale.

#### h) Che cosa non si inventa qui
Lo stato del video di ogni brano lo dichiara **Claudio dal pannello**: alla partenza ogni
brano sta nello stato prudente **SOLO AUDIO** (mai un simbolo video non confermato) e passa
agli altri stati solo quando la produzione viene registrata con dati reali. L'elenco
ufficiale dei brani Suno con titoli e date resta **da ricevere**: in archivio ci sono i 40
titoli reali del canale Touch Music Radio TV, nessuno in più.

Non si inventano nemmeno: cover, titoli, videoclip, thumbnail, cast, location, date, crediti,
statistiche. Finché il videoclip non esiste → `VIDEOCLIP DA REALIZZARE`. Finché non è stato
aperto un casting → **niente** `CASTING APERTO`. Finché il video non è pubblicato → **niente**
pulsante `GUARDA`.

---

### PRIORITÀ 2quater — CASTING VIDEOCLIP DENTRO IL CICLO PRODUTTIVO
*(richiesta di Claudio del 29 settembre 2026, secondo invio. Sta subito dopo 2ter perché il
casting nasce dalla scheda del brano: senza il record master del brano non esiste.)*

**Il principio.** Il casting non è una pagina isolata: è una fase della produzione del
videoclip. Dalla scheda del brano si apre il casting, si raccolgono le candidature e il
progetto avanza verso riprese e pubblicazione.

#### a) Dove vive
Sezione pubblica **CASTING VIDEOCLIP** — sottotitolo «Partecipa ai prossimi progetti musicali
di J.C. Hugò / Touch Music» — collegata a **Road to 2030** e a **Touch Casting**
(`/lavoro-casting`, `/lavoro-casting/bacheca`). **Un solo record**: lo stesso annuncio compare
nella bacheca Lavoro & Casting senza essere duplicato.

#### b) Categorie di ruolo
`🎤 CANTANTI · 💃 BALLERINI/E · 🎭 ATTORI/ATTRICI · 📸 MODELLI/E · 👥 FIGURANTI · 🎬 CREW TECNICA`
Ruoli ulteriori si aggiungono **dal pannello**, senza toccare il codice.

#### c) Casting legato al singolo videoclip
Ogni videoclip in preparazione genera il **proprio** casting, agganciato all'ID del brano.
Sulla card del brano con casting aperto: `🎵 AUDIO PUBBLICATO · 🎬 VIDEOCLIP IN PRE-PRODUZIONE ·
🟣 CASTING APERTO` con `[ASCOLTA] [CASTING] [DETTAGLI]`. Chiuso il casting l'etichetta
**sparisce da sé** e lo stato passa a `CASTING COMPLETATO → PRE-PRODUZIONE / RIPRESE`.

#### d) Scheda del casting
`IMMAGINE/LOCANDINA · TITOLO VIDEOCLIP · TITOLO CASTING · DESCRIZIONE · RUOLI RICERCATI ·
REQUISITI · LOCATION · PERIODO/DATA · SCADENZA · PRODUZIONE · COMPENSO/RIMBORSO (solo se
definito) · STATO`. Stati: `APERTO · IN SELEZIONE · CHIUSO · CAST COMPLETATO`.

#### e) Candidatura online — con gli allegati che finora mancavano
`[CANDIDATI ORA]` apre un modulo interno: nome · cognome · data di nascita · città · telefono ·
email · ruolo · esperienze · presentazione · social/portfolio. **Obbligatorio** il caricamento
reale di FOTO · CV · PORTFOLIO · SHOWREEL (file o link) · documenti richiesti: risolve il
difetto già rilevato, cioè candidature che non permettono di allegare file.

#### f) Consensi
Spazi predisposti per privacy, trattamento dati, utilizzo dei materiali, liberatoria immagini
e liberatoria audiovisiva. **Nessun testo legale inventato**: i documenti definitivi sono
quelli forniti dall'editore.

#### g) Anteprima nel palinsesto
Carosello visuale **CASTING APERTI** — immagine · titolo videoclip · ruoli · scadenza · stato ·
`[DETTAGLI] [CANDIDATI]`. Non una voce di testo.

#### h) Backoffice in `/allestimento`
`PRODUZIONI → MUSICA → ROAD TO 2030 → CASTING`. Per ogni brano: `[MODIFICA] [PROGRAMMA
VIDEOCLIP] [APRI CASTING] [GESTISCI CANDIDATURE] [AVVIA PRODUZIONE] [ASSOCIA VIDEO] [PUBBLICA]`.
Per ogni casting: candidature ricevute · da valutare · preselezionate · contattate · convocate ·
selezionate · non selezionate; ogni candidato con foto, dati, ruolo, portfolio, showreel,
documenti, note interne e stato.

---

## PRIORITÀ 3 — MAGAZINE E ANTEPRIME EDITORIALI

Verificare che **N°30 → copertina N°30** e **N°31 → copertina N°31**, su: Home · Influencity ·
Edicola · archivio · card · pagina del numero · metadata · allestimento.

Tenere distinti numeri ordinari · BIS/Speciali · Inserti DM Sport.
**Il numero non si calcola dall'ordine dell'array: ogni uscita ha il suo numero scritto.**

Ogni card editoriale: IMMAGINE · CATEGORIA/RUBRICA · TITOLO · ANTEPRIMA di 2-4 righe · DATA
quando c'è · `[ LEGGI ]`.

Priorità dell'immagine: immagine dell'articolo → prima immagine dentro l'articolo →
Media Library → immagine della rubrica → segnaposto solo come ultima spiaggia.

Da applicare a News · Elena di Cuori · DM Sport · Squadre · Miss Cool · Eventi · Turismo ·
Fashion.

---

## PRIORITÀ 4 — CANDIDATURE

Mantenere l'uploader già fatto. Miss Cool: foto principale · più foto · portfolio · PDF ·
documenti e allegati. Flusso: COMPILA → CARICA → ANTEPRIMA → INVIA → AMMINISTRAZIONE.

Separare **rigorosamente** MEDIA PUBBLICABILI da DOCUMENTI PRIVATI.

Pannello: visualizza · scarica · aggiungi · sostituisci · elimina.

Lavoro/Casting: foto · CV · PDF · portfolio e allegati. **Stesso componente**, non un altro
uploader.

---

## PRIORITÀ 5 — SHOP E INSERIMENTO PRODOTTO

`[ + NUOVO PRODOTTO ]` senza toccare il codice.

Campi: Titolo · SKU · Tipo · Brand · Venditore · Categoria · Sottocategoria · Prezzo ·
Prezzo promozionale · Disponibilità · Quantità · Immagine principale
(`[ CARICA ]` `[ MEDIA LIBRARY ]` `[ URL IMMAGINE ]`) · Galleria · Descrizione breve ·
Descrizione completa · Caratteristiche.

Tipi: prodotto fisico · servizio · biglietto · prenotazione · noleggio · merchandising ·
partner · marketplace esterno.

**Ogni articolo commerciale ha un prezzo.** Prezzo standard · promo · per persona · per giorno ·
per ora · per unità · acconto + saldo.

Prima di pubblicare: `[ SALVA BOZZA ]` `[ ANTEPRIMA PRODOTTO ]` `[ TESTA CHECKOUT ]`
`[ PUBBLICA ]`. L'anteprima è **obbligatoria** e deve mostrare esattamente la scheda finale.

---

## PRIORITÀ 6 — MARKETPLACE, BRAND E CATEGORIE

Separare sempre PRODOTTO · BRAND · CATEGORIA · VENDITORE · OFFERTA · CHECKOUT.

Macro-aree: TBH OFFICIAL · TOUCH FASHION · FAN CLUB/MERCHANDISING · ABBIGLIAMENTO · TECH ·
AUDIO/DJ/MUSICA · CASA · MOBILI/ARREDAMENTO · GIARDINO/OUTDOOR · MOBILITÀ/E-BIKE ·
ACCESSORI/CAVETTERIA · PARTNER STORES · MARKETPLACE ESTERNI.

Brand configurabili (Apple, Samsung, Sony, LG, Panasonic…), marketplace configurabili (Amazon,
Temu, AliExpress…). **Brand ≠ venditore.** Categorie, brand e venditori si aggiungono
dall'amministrazione, senza codice.

---

## PRIORITÀ 7 — CHECKOUT MULTI-ACCOUNT

TBH usa più conti e più metodi: **niente Stripe unico globale per tutto**.

Ogni OFFERTA porta: metodo principale · conto d'incasso · Stripe Payment Link · Stripe Price ID
quando serve · PayPal URL · Revolut URL · WhatsApp Catalog URL · Partner URL · External URL.

Se c'è il Payment Link, ACQUISTA ORA va **diretto** al Payment Link, e deve funzionare **anche
senza `STRIPE_SECRET_KEY` globale**. Più conti Stripe lato server quando si usa l'API.
**La Secret Key non arriva mai al frontend.**

`[ PAGA CON PAYPAL ]` · `[ PAGA CON REVOLUT ]` · `[ ORDINA SU WHATSAPP ]` ·
`[ VEDI PRODOTTO ]` → indirizzo esterno preciso.

**I prodotti esterni non passano dallo Stripe di TBH.**

Durante il passaggio si conserva il vecchio checkout: campi VECCHIO CHECKOUT · NUOVO CHECKOUT ·
VERIFICATO SÌ/NO. Il vecchio non si cancella prima della verifica del nuovo.

---

## PRIORITÀ 8 — ANTEPRIMA E COLLAUDO PRODOTTO

Non si salta. Per ogni prodotto: ANTEPRIMA (foto · titolo · prezzo · promo · disponibilità ·
descrizione · venditore · consegna/ritiro · `[ ACQUISTA ORA ]` ·
`[ RICHIEDI FINANZIAMENTO ]` quando previsto).

Poi CHECKOUT ASSOCIATI, ognuno con stato e `[ TESTA ]`: Stripe · PayPal · Revolut · WhatsApp ·
Partner/Marketplace. Stati: `✓ VERIFICATO` `⚠ DA VERIFICARE` `❌ ROTTO` `○ NON CONFIGURATO`.

Se un checkout è rotto, **non si mostra ACQUISTA con un link sbagliato**: si mostra
`[ RICHIEDI INFORMAZIONI ]`. Nessuna pubblicazione alla cieca.

---

## PRIORITÀ 9 — FINANZIAMENTI, CONSEGNA, VOUCHER

Ogni articolo tiene sempre il suo prezzo. Se finanziabile: `[ ACQUISTA ORA ]` +
`[ RICHIEDI FINANZIAMENTO ]` → WhatsApp precompilato con prodotto · SKU · prezzo · indirizzo
della pagina. Il finanziamento **non** si presenta come già approvato.

Fisici: pagamento → ordine → spedizione o ritiro (spedizione · ritiro in sede · ritiro presso
partner · consegna). Biglietti: pagamento → voucher. Prenotazioni: pagamento o acconto →
voucher. Noleggi: prenotazione → pagamento o acconto → voucher.

Voucher: codice univoco · ordine · cliente · servizio o evento · data · orario · luogo ·
quantità · importo · stato · istruzioni. Stati: VALIDO · UTILIZZATO · ANNULLATO · SCADUTO.

**Nessun voucher TBH per prodotti solo rimandati a un marketplace esterno.**

---

## PRIORITÀ 10 — MIGRAZIONE E COLLAUDO FINALE

Dal vecchio catalogo si recupera: titolo · descrizione · prezzo · immagine · brand · categoria ·
venditore · vecchio checkout. Poi restyling → nuova immagine se serve → nuovo checkout →
anteprima → test checkout → pubblica. **Niente pubblicazione automatica di tutto.**

Collaudo su Computer · Tablet · Telefono di: Header · Canali · Menu · Footer · frecce da
computer · swipe da telefono · link · loghi · immagini · Media Library · caricamenti ·
N°30 e N°31 · articoli e anteprime · Miss Cool · Lavoro/Casting · Squadre · Shop · prodotti ·
Stripe multipli · PayPal · Revolut · WhatsApp · link marketplace · finanziamenti ·
spedizione e ritiro · biglietti · prenotazioni · voucher.

Report finale: `✓ FUNZIONANTE` · `✓ RIPARATO` · `⚠ DA ALLESTIRE` · `⚠ CONTENUTO MANCANTE` ·
`❌ ERRORE RESIDUO`.

**Non si aprono funzioni nuove finché restano errori di questa lista.**
