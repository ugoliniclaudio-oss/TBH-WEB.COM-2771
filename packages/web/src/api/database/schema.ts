import { sqliteTable, text, integer, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";

/** Ordini generati dal Touch Plaza Shop (Stripe Checkout). */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productSlug: text("product_slug").notNull(),
  productTitle: text("product_title").notNull(),
  amountCents: integer("amount_cents").notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("pending"),
  stripeSessionId: text("stripe_session_id"),
  customerEmail: text("customer_email"),
  /** Codice del prodotto o della variante (specifica 16/09/2026, punto 5A). */
  codice: text("codice"),
  /** Variante scelta: colore, taglia, versione. */
  variante: text("variante"),
  /** Nome o testo da stampare, quando il prodotto è personalizzabile. */
  personalizzazione: text("personalizzazione"),
  /** Riga della tabella `prodotti` da cui è nato l'ordine, quando c'è. */
  prodottoId: integer("prodotto_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * ALLESTIMENTO DEL SITO — immagini, loghi, indirizzi e link caricati da Claudio.
 *
 * Ogni riga è un materiale reale caricato dal pannello /allestimento e appeso a uno
 * "slot" del portale (es. `societa:touch-hello`, `prodotto:kit-aggregazione-business`,
 * `sponsor:bahia-ricos-cafe`). Niente contenuto inventato: se lo slot è vuoto la
 * pagina resta come sta.
 */
export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slot: text("slot").notNull(),
  tipo: text("tipo").notNull().default("immagine"),
  chiave: text("chiave").notNull(),
  titolo: text("titolo"),
  indirizzo: text("indirizzo"),
  mapsUrl: text("maps_url"),
  linkUrl: text("link_url"),
  /**
   * MEDIA MANAGER TBH (ordine di Claudio 28/09/2026) — campi aggiunti per rendere il
   * caricamento immagini una funzione generale del CMS, non un intervento sul codice.
   *
   * `chiaveOriginale` = file esattamente come è arrivato dal PC/telefono. Quando l'immagine
   * viene ottimizzata per il web, in `chiave` finisce la versione ottimizzata e qui resta
   * l'originale, sempre disponibile. I LOGHI NON VENGONO MAI OTTIMIZZATI: per tipo "logo"
   * `chiave` è l'originale e questo campo resta vuoto.
   */
  chiaveOriginale: text("chiave_originale"),
  /** Tipo MIME reale del file caricato (image/jpeg, image/png, image/webp, application/pdf…). */
  mime: text("mime"),
  /** Peso in byte della versione servita: serve alla libreria per dire quanto pesa. */
  peso: integer("peso"),
  larghezza: integer("larghezza"),
  altezza: integer("altezza"),
  /** Testo alternativo per accessibilità e ricerca in libreria. */
  descrizione: text("descrizione"),
  /** Etichette libere separate da virgola: rendono l'immagine ricercabile in libreria. */
  tag: text("tag"),
  /**
   * bozza | pubblicato. In bozza il materiale è salvato e visibile solo in amministrazione:
   * così una scheda si salva anche quando l'immagine definitiva non è ancora arrivata.
   */
  stato: text("stato").notNull().default("pubblicato"),
  /** Ordine di comparsa dentro lo slot (gallery e pagine della rivista). */
  ordine: integer("ordine").notNull().default(0),
  /**
   * RISERVATO (ordine di Claudio 28/09/2026, punto 8): «non rendere pubblici
   * automaticamente documenti o allegati personali; separare MEDIA PUBBLICABILI da
   * DOCUMENTI PRIVATI».
   *
   * 1 = il file non esce MAI dalle letture pubbliche, qualunque sia `stato`: non compare
   * in perSlot, perPrefisso, conteggi, elenco e libreria senza il codice di allestimento.
   * È il caso dei documenti di una candidatura (carta d'identità, liberatoria, CV).
   * Il controllo sta qui, sulla riga, non nel componente: così nessuna pubblicazione
   * fatta per sbaglio dal pannello può renderli visibili.
   */
  riservato: integer("riservato").notNull().default(0),

  /**
   * INQUADRATURA — ordine di Claudio del 29/09/2026 (Priorità 2bis, «Sistema universale
   * immagini e anteprime»): «Carichi un'immagine master di buona qualità e il sito genera
   * card, hero, miniatura, mobile… Non deformare immagini. Non tagliare loghi».
   *
   * Questi tre campi viaggiano con l'immagine, non con la pagina: si decidono una volta
   * nel pannello e valgono in tutte le misure (card 16:9, miniatura 4:3, hero, mobile,
   * risultati ricerca, vetrina). Così non servono copie diverse dello stesso file.
   *
   * `adattamento`:
   * · `auto`    = il sito decide dal tipo (logo → contain, foto → cover). È il valore normale;
   * · `cover`   = riempie il riquadro e ritaglia il superfluo (foto e prodotti);
   * · `contain` = sta dentro il riquadro tutto intero, senza tagli (loghi e locandine).
   * Mai `fill`: deformare un'immagine è vietato dalla regola.
   */
  adattamento: text("adattamento").notNull().default("auto"),
  /**
   * FOCAL POINT in percentuale (0-100): il punto dell'immagine che deve restare visibile
   * quando il riquadro ritaglia. 50/50 = centro. Su una foto verticale di una persona si
   * porta in alto (es. 50/25) così la testa non viene tagliata nella card 16:9.
   */
  focusX: integer("focus_x").notNull().default(50),
  focusY: integer("focus_y").notNull().default(50),
  /** ZOOM in percentuale: 100 = immagine intera, 140 = ingrandita del 40% sul focal point. */
  zoom: integer("zoom").notNull().default(100),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * PRATICHE DI CARICAMENTO — permettono a chi si candida (pubblico, senza codice di
 * allestimento) di caricare davvero i propri file.
 *
 * Il problema: il Media Manager chiede il codice TBH_CODICE_ALLESTIMENTO per ogni
 * scrittura, e chi compila il modulo di candidatura non lo ha e non deve averlo.
 * La soluzione NON è un secondo sistema di upload: è un permesso a tempo, limitato.
 *
 * Alla prima scelta di un file il server apre una pratica e restituisce un `token`
 * casuale. Quel token vale solo per:
 * · l'ambito dichiarato (es. "miss-cool") e i suoi campi previsti;
 * · gli slot `pratica:<token>:<campo>` — lo slot lo decide il server, non il browser;
 * · il numero di file e il peso massimo previsti per quel campo;
 * · 24 ore, e comunque fino all'invio del modulo.
 *
 * All'invio la pratica si chiude e i file passano sullo slot definitivo della
 * candidatura (`missCool:candidatura:<id>:<campo>`): dal pannello si vedono, si
 * scaricano, si sostituiscono con gli stessi comandi di tutto il resto del sito.
 */
export const praticheCaricamento = sqliteTable("pratiche_caricamento", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Ambito previsto: "miss-cool" | "lavoro". Fuori da questi non si apre nulla. */
  ambito: text("ambito").notNull(),
  /** Permesso casuale consegnato al browser: non è indovinabile e non è il codice admin. */
  token: text("token").notNull().unique(),
  /** Scadenza del permesso (24 ore dall'apertura). */
  scadenza: integer("scadenza", { mode: "timestamp" }).notNull(),
  /** 1 = pratica chiusa: il modulo è stato inviato, non si carica più niente. */
  chiusa: integer("chiusa").notNull().default(0),
  /** Riga di destinazione, quando il modulo è stato inviato (es. candidatura 12). */
  riferimento: text("riferimento"),
  /** Slot definitivo su cui sono stati spostati i file alla chiusura. */
  slotFinale: text("slot_finale"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Contatore presenze reale + altre impostazioni chiave/valore. */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/**
 * CAPITAN TOUCH — A CACCIA DEI NEURONI PERDUTI (specifica 04/09/2026).
 *
 * Una "caccia" è una campagna: decide in quali pagine può comparire l'avatar, con che
 * probabilità, in che periodo e con quali premi. Ogni utente ha 3 RITROVAMENTI al giorno,
 * ma i premi hanno disponibilità globale: i 5 Neuroni d'Oro restano 5 per tutto il sito.
 */
export const cacce = sqliteTable("cacce", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  attiva: integer("attiva").notNull().default(1),
  /** Periodo (YYYY-MM-DD). Null = sempre. */
  dal: text("dal"),
  al: text("al"),
  /** Fascia oraria 0-23. Null = tutto il giorno. */
  oraDa: integer("ora_da"),
  oraA: integer("ora_a"),
  /** Probabilità di comparsa a ogni pagina aperta, da 1 a 100. */
  probabilita: integer("probabilita").notNull().default(35),
  /** Ritrovamenti massimi al giorno per utente. */
  maxAlGiorno: integer("max_al_giorno").notNull().default(3),
  /** Attività sponsor della caccia (facoltativa). */
  sponsor: text("sponsor"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Le pagine autorizzate: l'avatar non compare mai fuori da questo elenco. */
export const posizioni = sqliteTable("posizioni", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cacciaId: integer("caccia_id").notNull(),
  /** Percorso della pagina, es. "/" oppure "/shop". "*" = qualsiasi pagina. */
  pagina: text("pagina").notNull(),
  etichetta: text("etichetta").notNull(),
  /** Peso nell'estrazione casuale: più alto = compare più spesso. */
  peso: integer("peso").notNull().default(1),
  attiva: integer("attiva").notNull().default(1),
});

/** I premi in circolazione, con la loro scorta reale. */
export const premi = sqliteTable("premi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cacciaId: integer("caccia_id").notNull(),
  /** comune | speciale | premio | oro */
  neurone: text("neurone").notNull().default("comune"),
  titolo: text("titolo").notNull(),
  descrizione: text("descrizione"),
  /** Pezzi messi in circolazione e pezzi già assegnati (scarsità globale). */
  disponibili: integer("disponibili").notNull().default(0),
  assegnati: integer("assegnati").notNull().default(0),
  /** Azione richiesta: scheda | sito | offerta | luogo | coupon. Null = nessuna. */
  azione: text("azione"),
  linkUrl: text("link_url"),
  /** Attività commerciale aderente collegata al premio. */
  attivita: text("attivita"),
  attivo: integer("attivo").notNull().default(1),
});

/** Ogni comparsa dell'avatar, per il limite giornaliero e per le statistiche. */
export const apparizioni = sqliteTable("apparizioni", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  giocatore: text("giocatore").notNull(),
  cacciaId: integer("caccia_id").notNull(),
  pagina: text("pagina").notNull(),
  /** Giorno YYYY-MM-DD, per contare i ritrovamenti della giornata. */
  giorno: text("giorno").notNull(),
  cliccata: integer("cliccata").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** I ritrovamenti veri: chi ha preso cosa, quando e dove. */
export const ritrovamenti = sqliteTable("ritrovamenti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  giocatore: text("giocatore").notNull(),
  cacciaId: integer("caccia_id").notNull(),
  premioId: integer("premio_id"),
  neurone: text("neurone").notNull(),
  titolo: text("titolo").notNull(),
  pagina: text("pagina").notNull(),
  giorno: text("giorno").notNull(),
  /** Premio già utilizzato/riscattato dall'utente. */
  usato: integer("usato").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * TBH CONTENT HUB — PRE-ALLESTIMENTO (specifica di Claudio del 06/09/2026).
 *
 * Un contenuto si carica UNA volta e diventa un RECORD CANONICO: da lì alimenta home,
 * canale e vetrina senza creare quattro «Hotel Aurora» diversi.
 *
 * Regola: SORGENTE → PRE-ALLESTIMENTO → CONTROLLO → PUBBLICAZIONE. Niente pubblicazione
 * automatica: un contenuto nasce sempre in BOZZA e diventa visibile solo quando lo stato
 * viene portato a «attivo» a mano.
 */
export const contenuti = sqliteTable("contenuti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titolo: text("titolo").notNull(),
  /** Chiave stabile del record canonico: da qui nascono tutte le esposizioni. */
  slug: text("slug").notNull(),
  /** hotel | societa | attivita | servizio | prodotto | evento | squadra | media | documento | altro */
  tipo: text("tipo").notNull().default("altro"),
  /** Ambiente/canale di appartenenza principale (slug di lib/ambienti-tbh.ts). */
  canale: text("canale"),
  categoria: text("categoria"),
  /** Pagina interna del portale (es. /hotel-aurora) e sito ufficiale esterno. */
  urlPagina: text("url_pagina"),
  sitoUrl: text("sito_url"),
  /** Materiali: indirizzi già pronti (file caricato su Tigris oppure link incollato). */
  logoUrl: text("logo_url"),
  immagineUrl: text("immagine_url"),
  videoUrl: text("video_url"),
  documentoUrl: text("documento_url"),
  documentoNome: text("documento_nome"),
  /** Fino a 3 pulsanti: JSON [{testo,url}] — il sito genera la card con gli stessi elementi. */
  pulsanti: text("pulsanti"),
  testoBreve: text("testo_breve"),
  note: text("note"),
  /** Dove si espone una volta approvato: JSON ["home","canale","vetrina","territorio"]. */
  appartenenza: text("appartenenza"),
  /** bozza | allestimento | attivo | nascosto — mai pubblicato in automatico. */
  stato: text("stato").notNull().default("bozza"),
  /** Da dove è arrivato: pannello | condivisione | drag | url. Serve solo per capire il flusso. */
  sorgente: text("sorgente").notNull().default("pannello"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * TBH TV & STREAMING ADV — listino gestito dall'amministratore (specifica del 15/09/2026).
 *
 * I quattro pacchetti nascono dal listino reale della slide (`api/data/adv-tv.ts`): questa
 * tabella serve a Claudio per cambiare prezzi, periodo promozionale e disponibilità SENZA
 * toccare il codice. Una riga esiste solo quando è stata salvata dal pannello: se manca,
 * vale il listino della slide.
 *
 * I prezzi sono in centesimi e IVA INCLUSA, come la slide. La scomposizione
 * netto/IVA/lordo viene calcolata e conservata sulla pratica al momento dell'ordine.
 */
export const advListino = sqliteTable("adv_listino", {
  /** Slug del pacchetto: tbh-tv-frame | tbh-video-tv | tbh-tv-impact | tbh-ctv-premium. */
  slug: text("slug").primaryKey(),
  sku: text("sku").notNull(),
  titolo: text("titolo"),
  descrizione: text("descrizione"),
  immagineUrl: text("immagine_url"),
  /** Prezzo pieno: c'è sempre. */
  pienoCents: integer("pieno_cents").notNull(),
  /** Prezzo promozionale: vale solo dentro la finestra promoDal/promoAl. */
  promoCents: integer("promo_cents"),
  promoDal: text("promo_dal"),
  promoAl: text("promo_al"),
  /** Prezzo riservato ai clienti fidelizzati TBH: verificato sempre sul server. */
  fidelityCents: integer("fidelity_cents"),
  ivaAliquota: integer("iva_aliquota").notNull().default(22),
  disponibile: integer("disponibile").notNull().default(1),
  /** Percentuale di cashback TBH maturabile dai clienti fidelizzati. */
  cashbackPercento: integer("cashback_percento").notNull().default(100),
  /** Stripe: Product e Price VERI, creati una volta e riusati. */
  stripeProductId: text("stripe_product_id"),
  stripePricePieno: text("stripe_price_pieno"),
  stripePricePromo: text("stripe_price_promo"),
  stripePriceFidelity: text("stripe_price_fidelity"),
  aggiornatoIl: integer("aggiornato_il", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Servizi extra del configuratore ADV, anch'essi modificabili dal pannello. */
export const advAddon = sqliteTable("adv_addon", {
  codice: text("codice").primaryKey(),
  nome: text("nome").notNull(),
  descrizione: text("descrizione"),
  prezzoCents: integer("prezzo_cents").notNull(),
  attivo: integer("attivo").notNull().default(1),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  aggiornatoIl: integer("aggiornato_il", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * REGISTRO FIDELITY TBH — l'unica fonte del prezzo riservato.
 *
 * Il cliente NON può dichiararsi fidelizzato da solo: il configuratore manda email,
 * codice fiscale o codice TBH e il server cerca qui. Nessun parametro del browser
 * (`fidelity=true`, `price=`, `discount=`) viene mai creduto.
 * La tabella parte vuota: i nominativi li inserisce Claudio dal pannello.
 */
export const advFidelity = sqliteTable("adv_fidelity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Identificativo TBH del cliente fidelizzato (tessera/contratto). */
  codiceTbh: text("codice_tbh"),
  email: text("email"),
  codiceFiscale: text("codice_fiscale"),
  partitaIva: text("partita_iva"),
  intestatario: text("intestatario").notNull(),
  /** Livello TBH, quando assegnato. */
  livello: text("livello"),
  /** 1 = ha diritto al Cashback TBH secondo regolamento. */
  cashback: integer("cashback").notNull().default(1),
  attivo: integer("attivo").notNull().default(1),
  scadenza: text("scadenza"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * PRATICHE ADV — una campagna acquistata, dal pagamento al report al cashback.
 *
 * «Pagato» lo scrive SOLO il webhook Stripe (`/api/webhooks/stripe`): l'arrivo del
 * browser sulla pagina di ritorno non vale come conferma di incasso.
 */
export const advPratiche = sqliteTable("adv_pratiche", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Numero ordine TBH: TBH-TV-2026-000001. */
  numeroOrdine: text("numero_ordine").notNull(),
  /** Protocollo pratica: ADV/CTV/2026/000001. */
  protocollo: text("protocollo").notNull(),
  pacchettoSlug: text("pacchetto_slug").notNull(),
  pacchettoTitolo: text("pacchetto_titolo").notNull(),
  sku: text("sku").notNull(),
  /** Fascia applicata, decisa dal server: pieno | promo | fidelity. */
  fascia: text("fascia").notNull(),
  nettoCents: integer("netto_cents").notNull(),
  ivaCents: integer("iva_cents").notNull(),
  lordoCents: integer("lordo_cents").notNull(),
  ivaAliquota: integer("iva_aliquota").notNull().default(22),
  /** Servizi extra scelti: JSON [{codice,nome,prezzoCents}]. */
  addonJson: text("addon_json"),
  /** Risposte del configuratore (territorio, pubblico, date, targeting, note): JSON. */
  configurazioneJson: text("configurazione_json"),
  /** cliente = il materiale lo porta il cliente; tbh = lo realizza TBH. */
  materiali: text("materiali"),
  durataSpot: integer("durata_spot"),
  stato: text("stato").notNull().default("in-attesa-pagamento"),
  clienteNome: text("cliente_nome").notNull(),
  clienteEmail: text("cliente_email").notNull(),
  clienteTelefono: text("cliente_telefono"),
  clienteRiferimentoFiscale: text("cliente_riferimento_fiscale"),
  /** Verifica Fidelity: esito e riga del registro che l'ha autorizzata. */
  fidelityVerificata: integer("fidelity_verificata").notNull().default(0),
  fidelityId: integer("fidelity_id"),
  fidelityRiferimento: text("fidelity_riferimento"),
  /** Cashback TBH: credito maturabile secondo regolamento, non un rimborso Stripe. */
  cashbackCents: integer("cashback_cents").notNull().default(0),
  cashbackStato: text("cashback_stato").notNull().default("non-eleggibile"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntent: text("stripe_payment_intent"),
  pagatoIl: integer("pagato_il", { mode: "timestamp" }),
  /** Report di campagna: JSON con i KPI realmente consegnati dalla piattaforma. */
  reportJson: text("report_json"),
  reportUrl: text("report_url"),
  noteInterne: text("note_interne"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Storico degli stati di una pratica: chi l'ha mossa e quando. */
export const advEventi = sqliteTable("adv_eventi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  praticaId: integer("pratica_id").notNull(),
  stato: text("stato").notNull(),
  nota: text("nota"),
  /** sistema | webhook | pannello */
  origine: text("origine").notNull().default("sistema"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * CAMPAGNE DEI MONITOR — specifica di Claudio del 16/09/2026.
 *
 * Un monitor senza contenuto ufficiale non resta spento: ospita un contenuto
 * TEMPORANEO (promo TBH, spazio pubblicitario, partner del canale) finché il
 * contenuto ufficiale non arriva. Quando il contenuto ufficiale arriva, la
 * campagna NON si cancella: scende sotto il monitor, in rotazione, e conserva
 * collegamenti e statistiche. Pagina e indirizzo non cambiano mai.
 *
 * La tabella parte vuota: le campagne le inserisce Claudio dal pannello
 * /allestimento/monitor. Se è vuota valgono le promo TBH dichiarate in
 * `api/data/campagne-monitor.ts` (materiale reale del gruppo, nessun logo
 * e nessuno sponsor inventato).
 */
export const monitorCampagne = sqliteTable("monitor_campagne", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /**
   * Stato della scheda (8 stati, specifica 16/09/2026):
   * bozza | in_attesa | pubblicita_temporanea | programmato | in_onda |
   * contenuto_ufficiale | scaduto | disattivato.
   * I nomi vecchi (ufficiale/pubblicita/attesa) sono tradotti in lettura da
   * `normalizzaStato()` in api/data/campagne-monitor.ts: nessuna riga da riscrivere.
   */
  stato: text("stato").notNull().default("pubblicita_temporanea"),
  /** Categoria della scheda (elenco CATEGORIE_MONITOR). */
  categoria: text("categoria"),
  /**
   * Numero del canale a cui appartiene il monitor. Resta vuoto finché Claudio
   * consegna la tabella dei numeri: un numero indovinato sarebbe un dato inventato.
   */
  canale: integer("canale"),
  /** Etichetta sempre visibile: SPAZIO PUBBLICITARIO | PROMO TBH | PARTNER DEL CANALE. */
  etichetta: text("etichetta").notNull().default("SPAZIO PUBBLICITARIO"),
  titolo: text("titolo").notNull(),
  descrizione: text("descrizione"),
  /** Nome dello sponsor, quando la campagna è di un partner. */
  sponsor: text("sponsor"),
  /** Logo ufficiale ricevuto dallo sponsor: mai ridisegnato, mai ricostruito. */
  logoUrl: text("logo_url"),
  /**
   * BARRA 1 — URL CONTENUTO DEL MONITOR: YouTube, Vimeo, MP4/WebM, JPG/PNG/WebP,
   * pagina interna, diretta, fotogallery, contenuto pubblicitario.
   */
  contenutoUrl: text("contenuto_url"),
  /** Tipo riconosciuto o forzato: youtube|vimeo|video|immagine|pagina|diretta|fotogallery|pubblicita|nessuno. */
  tipoContenuto: text("tipo_contenuto").notNull().default("nessuno"),
  /** Copertina di riserva: si vede se il video non parte o non è ancora in vista. */
  immagineUrl: text("immagine_url"),
  /** Video in loop: mp4, webm, YouTube o Vimeo (campo storico, ancora valido). */
  videoUrl: text("video_url"),
  /**
   * BARRA 2 — URL O LINK DEL PULSANTE: destinazione INDIPENDENTE dal contenuto
   * del monitor (il vetro può mostrare un promo e il pulsante aprire il prodotto).
   */
  pulsanteUrl: text("pulsante_url"),
  /** Rotta interna del portale (campo storico: vale se pulsante_url è vuoto). */
  linkInterno: text("link_interno"),
  /** Indirizzo esterno verificato (campo storico). */
  linkEsterno: text("link_esterno"),
  /** Testo del pulsante: solo uno dei 12 ammessi (TESTI_PULSANTE). */
  pulsante: text("pulsante"),
  /** Temi ammessi, separati da virgola: sport,musica,azienda,corso,prodotto,servizio,evento. */
  temi: text("temi"),
  /** Spazi specifici (id record o pagina), separati da virgola. Vuoto = tutti. */
  spazi: text("spazi"),
  /** Dispositivo di destinazione: tutti | mobile | tablet | desktop. */
  dispositivo: text("dispositivo").notNull().default("tutti"),
  /** Priorità sponsor: più alto = prima. */
  priorita: integer("priorita").notNull().default(50),
  /** Secondi di permanenza per le creatività statiche (10–20 come da specifica). */
  durataSec: integer("durata_sec").notNull().default(14),
  /** Riproduzione video in loop SÌ/NO (specifica 16/09/2026, punto 1). 1 = sì. */
  loop: integer("loop").notNull().default(1),
  /** Ordine manuale oppure rotazione casuale: "ordine" | "casuale". */
  rotazione: text("rotazione").notNull().default("ordine"),
  /** Frequenza massima per visita: 0 = nessun limite. */
  frequenzaMax: integer("frequenza_max").notNull().default(0),
  /** Finestra di pubblicazione AAAA-MM-GG (facoltativa). */
  dal: text("dal"),
  al: text("al"),
  /** Colore del canale, quando dichiarato. */
  colore: text("colore"),
  ordine: integer("ordine").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Visualizzazioni e click REALI degli spazi dei monitor: una riga per evento.
 * Nessun numero stimato, nessun conteggio finto: i totali del pannello sono
 * la somma di queste righe.
 */
export const monitorEventi = sqliteTable("monitor_eventi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  campagnaId: integer("campagna_id").notNull(),
  /** vista | click */
  tipo: text("tipo").notNull(),
  /** Spazio in cui è avvenuto: id del record + numero del monitor. */
  spazio: text("spazio"),
  /** mobile | tablet | desktop */
  dispositivo: text("dispositivo"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * PRODOTTI E GADGET — specifica del 16/09/2026, punti 4, 5, 6 e 7.
 *
 * Schede modificabili dal pannello /allestimento/prodotti: magliette, cappellini,
 * braccialetti, lanyard, pass, portachiavi, adesivi, shopper e altri gadget.
 *
 * La tabella parte VUOTA: nessun prodotto, nessun prezzo e nessun logo inventato.
 * Finché Claudio non salva una scheda, la vetrina mostra "IN ALLESTIMENTO —
 * Contenuto disponibile prossimamente".
 */
export const prodotti = sqliteTable("prodotti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Indirizzo della pagina: /gadget/<slug>. */
  slug: text("slug").notNull(),
  nome: text("nome").notNull(),
  /** Codice prodotto: finisce negli ordini, su Stripe e nel messaggio WhatsApp. */
  codice: text("codice"),
  /** Categoria (elenco CATEGORIE_PRODOTTO). */
  categoria: text("categoria"),
  /** bozza | pubblicato | sospeso */
  stato: text("stato").notNull().default("bozza"),
  /** Logo o marchio ORIGINALE caricato: mai ridisegnato, mai generato. */
  logoUrl: text("logo_url"),
  descrizione: text("descrizione"),
  /** Galleria immagini/video: un indirizzo per riga o separati da virgola. */
  galleriaUrl: text("galleria_url"),
  /** Prezzi in centesimi. NULL = prezzo non ancora deciso → IN ALLESTIMENTO. */
  prezzoCents: integer("prezzo_cents"),
  prezzoPromoCents: integer("prezzo_promo_cents"),
  prezzoFidelityCents: integer("prezzo_fidelity_cents"),
  /** disponibile | su_ordinazione | esaurito | in_allestimento */
  disponibilita: text("disponibilita").notNull().default("in_allestimento"),
  /** Tempi di produzione e consegna dichiarati da Claudio (testo libero). */
  tempiConsegna: text("tempi_consegna"),
  /** 1 = si può far stampare un nome o un testo. */
  personalizzabile: integer("personalizzabile").notNull().default(0),
  etichettaPersonalizzazione: text("etichetta_personalizzazione"),
  /** 1 = il cliente può caricare la propria immagine o il proprio logo. */
  caricaLogoCliente: integer("carica_logo_cliente").notNull().default(0),
  /** Stripe del prodotto: Payment Link e/o Price ID (uno per prodotto, punto 5A). */
  stripeLink: text("stripe_link"),
  stripePriceId: text("stripe_price_id"),
  /** Numero WhatsApp dedicato. Vuoto = +39 379 208 8524. */
  whatsappNumero: text("whatsapp_numero"),
  quantitaMin: integer("quantita_min").notNull().default(1),
  quantitaMax: integer("quantita_max").notNull().default(20),
  /** Finestra di pubblicazione AAAA-MM-GG: fuori finestra si sospende da sola. */
  dal: text("dal"),
  al: text("al"),
  ordine: integer("ordine").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * VARIANTI — colore, taglia, versione. Ogni variante può avere il SUO prezzo e
 * il SUO Stripe (Payment Link o Price ID): non esiste un link unico per tutti.
 */
export const prodottoVarianti = sqliteTable("prodotto_varianti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prodottoId: integer("prodotto_id").notNull(),
  colore: text("colore"),
  taglia: text("taglia"),
  codice: text("codice"),
  /** NULL = valgono i prezzi del prodotto. */
  prezzoCents: integer("prezzo_cents"),
  prezzoPromoCents: integer("prezzo_promo_cents"),
  prezzoFidelityCents: integer("prezzo_fidelity_cents"),
  stripeLink: text("stripe_link"),
  stripePriceId: text("stripe_price_id"),
  immagineUrl: text("immagine_url"),
  disponibilita: text("disponibilita").notNull().default("in_allestimento"),
  ordine: integer("ordine").notNull().default(0),
});

/**
 * Visualizzazioni, click e ordini REALI delle schede prodotto: una riga per
 * evento. I totali del pannello sono la somma di queste righe, mai una stima.
 */
export const prodottoEventi = sqliteTable("prodotto_eventi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prodottoId: integer("prodotto_id").notNull(),
  /** vista | click | whatsapp | stripe | ordine */
  tipo: text("tipo").notNull(),
  varianteId: integer("variante_id"),
  dispositivo: text("dispositivo"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * RECORD MASTER DEI MARCHI (specifica 17/09/2026, punti 1, 2, 4 e 9:
 * «UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI»).
 *
 * Una riga = una entità reale (società TBH, attività del territorio, squadra,
 * programma, media, prodotto, servizio, corso, evento, agenzia, magazine, radio).
 * Tutte le pagine, le card, i monitor e i menu leggono QUESTA riga: la scheda non
 * si riscrive pagina per pagina, si aggiorna qui una volta e cambia ovunque.
 *
 * `chiaveEntita` è il nome normalizzato del registro unico (`api/data/registro.ts`,
 * funzione `chiave()`): è il ponte fra il record master e le anagrafiche già
 * pubblicate, così la stessa entità non si duplica.
 *
 * `logoMaster` è l'ORIGINALE caricato e non si sovrascrive mai: le misure per
 * icona, scheda, hero, banner e social sono derivate a richiesta da
 * `/api/logo/<formato>/<chiave>` mantenendo le proporzioni.
 *
 * La tabella parte VUOTA: nessun marchio, colore o contatto scritto nel codice.
 * Finché Claudio non salva una riga vera la scheda resta "IN ALLESTIMENTO".
 */
export const marchi = sqliteTable("marchi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Indirizzo stabile della scheda: non cambia quando la scheda passa ad ATTIVA. */
  slug: text("slug").notNull().unique(),
  nome: text("nome").notNull(),
  /** Nome corto per le card strette. NULL = si usa `nome`. */
  nomeBreve: text("nome_breve"),
  /** Nome normalizzato del registro unico: collega il master alle anagrafiche. */
  chiaveEntita: text("chiave_entita"),
  categoria: text("categoria"),
  /** attiva | bozza | in_allestimento — mai vuota, mai cancellata. */
  stato: text("stato").notNull().default("in_allestimento"),
  descrizione: text("descrizione"),
  /** Il file ORIGINALE del marchio. Non si sovrascrive mai. */
  logoMaster: text("logo_master"),
  logoMasterTipo: text("logo_master_tipo"),
  logoMasterLarghezza: integer("logo_master_larghezza"),
  logoMasterAltezza: integer("logo_master_altezza"),
  /** Colori ufficiali dichiarati da chi possiede il marchio (es. "#0B3B8C, #FFFFFF"). */
  coloriUfficiali: text("colori_ufficiali"),
  copertinaUrl: text("copertina_url"),
  videoUrl: text("video_url"),
  /** Carosello: più indirizzi, uno per riga. */
  caroselloUrl: text("carosello_url"),
  sito: text("sito"),
  mapsUrl: text("maps_url"),
  telefono: text("telefono"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  /** Social: più indirizzi, uno per riga. */
  social: text("social"),
  /** Pagina interna TBH da aprire al clic: mai un salto fuori dal sito. */
  paginaTbh: text("pagina_tbh"),
  /** Da dove arriva il materiale (sito ufficiale, file di Claudio, ...). */
  fonte: text("fonte"),
  nota: text("nota"),
  ordine: integer("ordine").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * KIT UFFICIALE DEL MARCHIO (punto 4) — le versioni che esistono DAVVERO.
 *
 * Una riga per ogni file ricevuto: logo principale, orizzontale, icona/sigillo,
 * positivo su fondo chiaro, negativo bianco su fondo scuro, monocromatico,
 * copertina, video, pagine del carosello.
 *
 * Se una versione non è stata fornita NON si inventa: la riga non esiste e il sito
 * usa il master dentro il contenitore, senza modificarlo.
 */
export const marchioMedia = sqliteTable("marchio_media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  marchioId: integer("marchio_id").notNull(),
  /** master | orizzontale | icona | positivo | negativo | monocromatico | copertina | video | carosello */
  ruolo: text("ruolo").notNull(),
  /** Indirizzo o chiave del file originale caricato. */
  chiave: text("chiave").notNull(),
  /** immagine | video | pdf | url */
  tipo: text("tipo").notNull().default("immagine"),
  titolo: text("titolo"),
  larghezza: integer("larghezza"),
  altezza: integer("altezza"),
  fonte: text("fonte"),
  nota: text("nota"),
  ordine: integer("ordine").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/* ══════════════════════════════════════════════════════════════════════════
   EDICOLA TBH — specifica della direzione del 20/09/2026.

   L'Edicola è l'hub editoriale dinamico del portale: notizie, eventi, sport,
   musica, cinema, guida TV, animali, oroscopo e giochi. NON duplica nulla di
   quello che esiste già (magazine Touch Influencity, giochi, DM, Miss Cool,
   Lavoro & Casting): quando un contenuto vive già in una sezione del sito,
   l'Edicola lo RIMANDA alla sua pagina canonica, non lo ricopia.

   Regola ferrea applicata anche qui: nessuna testata, nessun feed, nessun
   titolo e nessuna immagine inventati. Una riga di `edicola_contenuti` nasce
   SOLO da una fonte davvero raggiungibile (feed verificato) oppure da un testo
   scritto dalla redazione TBH. Degli articoli esterni si conservano solo i dati
   consentiti — titolo, sintesi breve, immagine dichiarata dal feed, fonte e
   data — e il testo integrale non viene mai copiato: si apre sulla fonte.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * FONTI DELL'EDICOLA — configurabili dal pannello ADMIN.
 *
 * Il registro di partenza (api/data/edicola-fonti.ts) contiene solo feed
 * verificati uno per uno con una richiesta reale il 20/09/2026. Questa tabella
 * serve a Claudio per accendere, spegnere, correggere o aggiungere una fonte
 * senza toccare il codice: se una riga non esiste, vale il registro.
 */
export const edicolaFonti = sqliteTable("edicola_fonti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Chiave stabile della fonte (es. "ansa-emilia-romagna"). Una sola riga per fonte. */
  slug: text("slug").notNull().unique(),
  nome: text("nome").notNull(),
  /** Indirizzo del feed RSS/Atom. Niente feed inventati: deve rispondere. */
  feedUrl: text("feed_url").notNull(),
  /** Sito ufficiale della testata, per l'attribuzione. */
  sitoUrl: text("sito_url"),
  /** Categoria dell'Edicola in cui finiscono gli articoli di questa fonte. */
  categoria: text("categoria").notNull(),
  sottocategoria: text("sottocategoria"),
  /** Territorio TBH (rimini, san-marino, sanremo, padova, milano, roma, italia). */
  territorio: text("territorio"),
  attiva: integer("attiva").notNull().default(1),
  /** Priorità editoriale della fonte: entra nell'ordinamento, non è casuale. */
  priorita: integer("priorita").notNull().default(0),
  nota: text("nota"),
  /** Esito dell'ultimo aggiornamento: ok | errore. Solo dati reali. */
  ultimoEsito: text("ultimo_esito"),
  ultimoMessaggio: text("ultimo_messaggio"),
  ultimiItem: integer("ultimi_item"),
  ultimoControllo: integer("ultimo_controllo", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * CONTENUTI DELL'EDICOLA — schema minimo chiesto dalla direzione (punto 5).
 *
 * `dedup_key` è l'impronta usata per non pubblicare due volte la stessa cosa:
 * indirizzo originale normalizzato, con ricaduta sul titolo normalizzato.
 */
export const edicolaContenuti = sqliteTable("edicola_contenuti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  /** Indirizzo interno canonico: uno solo per contenuto. */
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  territory: text("territory"),
  /** Nome della testata/fonte (es. "ANSA Emilia-Romagna", "Redazione TBH"). */
  source: text("source").notNull(),
  /** Home page della fonte. */
  sourceUrl: text("source_url"),
  /** Indirizzo dell'articolo originale: è quello che apre «FONTE ↗». */
  originalUrl: text("original_url"),
  image: text("image"),
  excerpt: text("excerpt"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  /** Data dell'evento (YYYY-MM-DD) quando il contenuto è un evento. */
  eventDate: text("event_date"),
  /** Orario, luogo, organizzatore, programma: compilati solo se verificati. */
  eventTime: text("event_time"),
  eventPlace: text("event_place"),
  eventOrganizer: text("event_organizer"),
  eventProgram: text("event_program"),
  eventSiteUrl: text("event_site_url"),
  eventMapsUrl: text("event_maps_url"),
  eventTicketUrl: text("event_ticket_url"),
  /** Etichette separate da virgola. */
  tags: text("tags"),
  /** Priorità commerciale/editoriale: entra nell'ordinamento. */
  priority: integer("priority").notNull().default(0),
  /** pubblicato | bozza | nascosto */
  status: text("status").notNull().default("pubblicato"),
  /** Sintesi scritta dalla redazione TBH (mai un testo copiato dalla fonte). */
  sintesiTbh: text("sintesi_tbh"),
  /** rss | redazione — da dove arriva la riga. */
  origine: text("origine").notNull().default("rss"),
  fonteSlug: text("fonte_slug"),
  dedupKey: text("dedup_key").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * OROSCOPO TBH — testi originali della redazione, scritti dal pannello.
 *
 * Nessun oroscopo generato dal sito e nessuna API non autorizzata: finché la
 * redazione non scrive il testo del giorno, la pagina dichiara «IN ALLESTIMENTO»
 * e mostra soltanto i dati di fatto del segno (periodo, elemento, simbolo).
 */
export const edicolaOroscopo = sqliteTable("edicola_oroscopo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Slug del segno (ariete, toro, ...). */
  segno: text("segno").notNull(),
  /** Giorno di validità YYYY-MM-DD. */
  giorno: text("giorno").notNull(),
  amore: text("amore"),
  lavoro: text("lavoro"),
  fortuna: text("fortuna"),
  benessere: text("benessere"),
  testo: text("testo"),
  autore: text("autore"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * CANDIDATURE TOUCH MISS COOL — Modulo 01 del Kit Digitale 2027.
 *
 * Il Kit (slide 14) chiede un flusso tracciabile in otto passaggi: invio,
 * verifica 18+, documenti, consensi, approvazione, pubblicazione, voto, finale,
 * ognuno con stato, data e operatore. Questa tabella è quel registro.
 *
 * Due regole:
 * 1. Nessuna candidatura di prova, nessuna candidata inventata: la tabella
 *    parte vuota e si riempie solo con i moduli reali inviati dal sito.
 * 2. La scheda pubblica compare solo con `consensoB` e `statoPubblicazione`
 *    a posto: senza il consenso alla pubblicazione, il profilo non si vede.
 */
export const missCoolCandidature = sqliteTable("miss_cool_candidature", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Edizione del concorso (es. "2027"). */
  edizione: text("edizione").notNull().default("2027"),
  /** Percorso scelto: live | web | entrambi. */
  percorso: text("percorso").notNull().default("entrambi"),
  /** Numero di gara MISS #000: assegnato dalla redazione, non dal modulo. */
  numeroGara: integer("numero_gara"),
  /** Slug pubblico della scheda, assegnato all'approvazione. */
  slug: text("slug").unique(),

  // --- Modulo 01: domanda di partecipazione ---
  nome: text("nome").notNull(),
  nomeArtistico: text("nome_artistico"),
  dataNascita: text("data_nascita").notNull(),
  comune: text("comune").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  professione: text("professione"),
  esperienze: text("esperienze"),
  trasferte: text("trasferte"),
  ruoli: text("ruoli"),
  presentazione: text("presentazione"),

  // --- Dichiarazioni obbligatorie del modulo ---
  dichiaraMaggiorenne: integer("dichiara_maggiorenne").notNull().default(0),
  accettaRegolamento: integer("accetta_regolamento").notNull().default(0),
  lettaPrivacy: integer("letta_privacy").notNull().default(0),

  // --- Modulo 03: i sei consensi separati A–F ---
  consensoA: integer("consenso_a").notNull().default(0),
  consensoB: integer("consenso_b").notNull().default(0),
  consensoC: integer("consenso_c").notNull().default(0),
  consensoD: integer("consenso_d").notNull().default(0),
  consensoE: integer("consenso_e").notNull().default(0),
  consensoF: integer("consenso_f").notNull().default(0),

  // --- Modulo 02: materiale consegnato e tracciamento ---
  materiale: text("materiale"),
  materialeNFile: integer("materiale_n_file"),
  materialeDataConsegna: text("materiale_data_consegna"),
  materialeNote: text("materiale_note"),
  fotoUfficiale: text("foto_ufficiale"),
  /**
   * Pratica di caricamento con cui sono arrivati i file del Modulo 02 (foto, portfolio,
   * documenti). I file stanno nella tabella `media` sugli slot
   * `missCool:candidatura:<id>:<campo>`: qui resta solo il riferimento alla pratica,
   * così si sa da quale invio arrivano.
   */
  pratica: text("pratica"),
  portfolioUrl: text("portfolio_url"),
  videoUrl: text("video_url"),
  socialAutorizzati: text("social_autorizzati"),

  // --- Flusso di back office in otto passaggi (slide 14) ---
  /** inviata | verifica-18 | documenti | consensi | approvata | pubblicata | esclusa | ritirata */
  stato: text("stato").notNull().default("inviata"),
  statoVerifica18: text("stato_verifica_18"),
  statoDocumenti: text("stato_documenti"),
  statoConsensi: text("stato_consensi"),
  statoApprovazione: text("stato_approvazione"),
  statoPubblicazione: text("stato_pubblicazione"),
  operatore: text("operatore"),
  notaInterna: text("nota_interna"),

  /** Posizione finale in classifica: 1–11 vincitrice, 12+ Official Candidate. */
  posizioneFinale: integer("posizione_finale"),
  squadraDm: text("squadra_dm"),
  votiValidi: integer("voti_validi").notNull().default(0),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * SCHEDE AMMINISTRABILI — il motore dei "moduli amministrabili" (ordine di Claudio
 * del 28/09/2026).
 *
 * «Ogni sezione presente o futura che richieda immagini o testi deve nascere già
 *  amministrabile dal pannello. Mai più sezioni statiche modificabili soltanto
 *  intervenendo sul codice.»
 *
 * Una SCHEDA è un contenuto che l'amministratore crea e riempie dal sito: una tappa
 * di Touch Miss Cool, un brano di J.C. Hugò, una partita DM Sport, un annuncio di
 * Lavoro, un numero di Influencity, un evento, una fiera, un luogo del territorio.
 * Ogni sezione del sito dichiara quali campi le servono (registro in
 * `api/data/sezioni-amministrabili.ts`): la tabella resta la stessa per tutte, così
 * una sezione nuova non richiede né tabella né codice nuovo.
 *
 * Le IMMAGINI non stanno qui: restano nel Media Manager, agganciate alla scheda
 * tramite gli slot `<chiave>:copertina`, `<chiave>:gallery:*`, `<chiave>:allegati:*`.
 * Così valgono già libreria condivisa, riuso, sostituzione, riordino, bozza e
 * avviso prima di eliminare un file usato altrove.
 *
 * CICLO DI STATO, come richiesto: bozza → anteprima → pubblicato → archiviato.
 * Si comincia oggi e si finisce quando il materiale arriva: nulla diventa pubblico
 * in automatico.
 *
 * DATI RISERVATI: `riservato = 1` marca le schede che non devono MAI uscire in
 * pubblico (candidature, CV, recapiti privati, note amministrative). Il server non
 * le restituisce senza codice di allestimento, qualunque sia il loro stato.
 * ────────────────────────────────────────────────────────────────────────────────
 */
export const schede = sqliteTable("schede", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /**
   * Chiave stabile e unica della scheda: `<sezione>:<slug>`
   * (es. `miss-cool-tappe:rimini-2027`, `jc-hugo-brani:notte-di-riccione`).
   * È anche il prefisso degli slot immagine, quindi non cambia mai dopo la creazione.
   */
  chiave: text("chiave").notNull().unique(),
  /** Sezione del registro a cui appartiene (es. `miss-cool-tappe`). */
  sezione: text("sezione").notNull(),
  /** Slug leggibile dentro la sezione: serve agli indirizzi delle pagine. */
  slug: text("slug").notNull(),

  // --- Campi testuali comuni a tutte le sezioni (punto 4 dell'ordine) ---
  titolo: text("titolo").notNull(),
  sottotitolo: text("sottotitolo"),
  /** Descrizione breve: una o due righe, quella che si legge nella card. */
  descrizione: text("descrizione"),
  /** Testo completo della scheda. */
  testo: text("testo"),
  /** Data del contenuto, testo libero: «2027-06-12», «Giugno 2027», «ogni domenica». */
  data: text("data"),
  categoria: text("categoria"),

  // --- Contatti e collegamenti ---
  contatti: text("contatti"),
  telefono: text("telefono"),
  email: text("email"),
  luogo: text("luogo"),
  indirizzo: text("indirizzo"),
  mapsUrl: text("maps_url"),
  linkUrl: text("link_url"),
  /** Pulsanti/CTA della scheda: JSON [{testo,url}]. */
  pulsanti: text("pulsanti"),

  /**
   * Campi specifici della sezione, JSON chiave→valore: numero e anno della rivista,
   * ruolo e disponibilità di un annuncio di lavoro, link YouTube/Suno di un brano,
   * risultato di una partita. Il registro della sezione dichiara quali sono, così
   * una sezione nuova non ha bisogno di colonne nuove.
   */
  campi: text("campi"),

  /** bozza | anteprima | pubblicato | archiviato — mai pubblicato in automatico. */
  stato: text("stato").notNull().default("bozza"),
  /** 1 = contiene dati personali o amministrativi: non esce mai in pubblico. */
  riservato: integer("riservato").notNull().default(0),
  /** Annotazioni di redazione: visibili solo in amministrazione. */
  notaInterna: text("nota_interna"),
  /** Ordine di comparsa dentro la sezione. */
  ordine: integer("ordine").notNull().default(0),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * PRODUZIONE VIDEO DI UN BRANO — Priorità 2ter (ordine di Claudio del 29/09/2026).
 *
 * «DATABASE MASTER: un solo record per brano. Non duplicare i dati, non spostarli.»
 *
 * Il brano (titolo, audio pubblicato, canale) sta nell'archivio del catalogo e NON si
 * duplica qui. Questa tabella tiene solo quello che il catalogo non può sapere da sé:
 * a che punto sta il VIDEOCLIP di quel brano. Una riga per brano, la chiave è l'ID del
 * brano: così Musica, Produzioni, Road to 2030 e J.C. Hugò leggono lo stesso record e
 * lo interrogano solo in modo diverso.
 *
 * Alla partenza una riga NON esiste: senza riga il brano è SOLO AUDIO. È la scelta
 * prudente chiesta da Claudio — mai un simbolo video su un brano che non lo ha.
 * ────────────────────────────────────────────────────────────────────────────────
 */
export const braniVideo = sqliteTable("brani_video", {
  /** ID del brano nel catalogo master (es. `hugo-07`). Una riga per brano. */
  branoId: text("brano_id").primaryKey(),
  /** da-realizzare | in-produzione | pubblicato. Nessun altro valore è previsto. */
  statoVideo: text("stato_video").notNull().default("da-realizzare"),
  /**
   * Fase interna della lavorazione, valida solo con stato `in-produzione`:
   * concept | casting | pre-produzione | riprese | montaggio | post-produzione | completamento.
   */
  statoProduzione: text("stato_produzione"),
  /** URL del videoclip: obbligatorio perché lo stato possa diventare `pubblicato`. */
  videoUrl: text("video_url"),
  /** Anteprima del videoclip (immagine reale, mai la copertina dell'audio spacciata per video). */
  thumbnailVideo: text("thumbnail_video"),
  /** Anno previsto di uscita del videoclip, testo libero: «2027», «entro il 2030». */
  annoVideoPrevisto: text("anno_video_previsto"),
  /** Genere musicale dichiarato dalla direzione: serve al filtro GENERI di Musica TBH. */
  genere: text("genere"),
  /**
   * Anno o data di pubblicazione dell'AUDIO, come la conosce la direzione. Resta vuoto
   * finché il dato ufficiale non arriva: sulla card non compare nessuna data stimata.
   */
  anno: text("anno"),
  /** Annotazione di produzione, visibile solo in amministrazione. */
  nota: text("nota"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/* ══════════════════════════════════════════════════════════════════════════════
   CASTING VIDEOCLIP — Priorità 2quater (ordine del 29/09/2026, secondo invio).

   «Il casting non è una pagina isolata: è una fase della produzione del videoclip.»

   Un casting è agganciato all'ID del brano (`branoId`), quindi la card del brano, la
   pagina Road to 2030 e la bacheca Lavoro & Casting leggono LO STESSO record: nessun
   annuncio duplicato. Un casting senza brano (cinema, format, reality) è ammesso con
   `branoId` vuoto e `ambito` diverso da `videoclip`.
   ══════════════════════════════════════════════════════════════════════════════ */
export const castings = sqliteTable("castings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Indirizzo pubblico dell'annuncio: /lavoro-casting/<slug>. */
  slug: text("slug").notNull().unique(),
  /** Brano del catalogo master a cui il casting appartiene (es. `hugo-07`). Vuoto se non musicale. */
  branoId: text("brano_id"),
  /** videoclip | cinema | tv-format | reality | altro — serve ai filtri della bacheca. */
  ambito: text("ambito").notNull().default("videoclip"),
  /** Titolo del casting, scritto dalla direzione. */
  titolo: text("titolo").notNull(),
  /** Titolo del videoclip/progetto, se diverso dal titolo del brano. */
  titoloProgetto: text("titolo_progetto"),
  descrizione: text("descrizione"),
  requisiti: text("requisiti"),
  location: text("location"),
  /** Periodo delle riprese, testo libero come lo dichiara la produzione. */
  periodo: text("periodo"),
  /** Scadenza delle candidature. Vuota se non fissata: non si inventa una data. */
  scadenza: text("scadenza"),
  produzione: text("produzione"),
  /** Compenso o rimborso: si pubblica SOLO se definito, altrimenti resta vuoto. */
  compenso: text("compenso"),
  /** aperto | in-selezione | chiuso | cast-completato. */
  stato: text("stato").notNull().default("aperto"),
  /** Locandina dell'annuncio: chiave nel Media Manager o indirizzo completo. */
  locandina: text("locandina"),
  /**
   * Ruoli cercati, in JSON: [{ ruolo, categoria, quantita, nota }].
   * Le categorie oltre alle sei di partenza si aggiungono da qui, senza toccare il codice.
   */
  ruoli: text("ruoli").notNull().default("[]"),
  nota: text("nota"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * CANDIDATURE AL CASTING — con gli allegati reali che finora mancavano.
 * «Le candidature devono consentire realmente l'upload di immagini e file.»
 * I file non stanno qui: qui stanno le loro chiavi nello spazio file, in `allegati` (JSON).
 */
export const castingCandidature = sqliteTable("casting_candidature", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  castingId: integer("casting_id").notNull(),
  /** Ruolo per cui la persona si candida, preso dall'elenco del casting. */
  ruolo: text("ruolo").notNull(),
  categoria: text("categoria"),
  nome: text("nome").notNull(),
  cognome: text("cognome").notNull(),
  dataNascita: text("data_nascita"),
  citta: text("citta"),
  telefono: text("telefono"),
  email: text("email"),
  esperienze: text("esperienze"),
  presentazione: text("presentazione"),
  social: text("social"),
  /** Allegati in JSON: [{ genere: foto|cv|portfolio|showreel|documento, chiave, nome, mime, peso }]. */
  allegati: text("allegati").notNull().default("[]"),
  /** Link a showreel/portfolio esterni, quando la persona non carica il file. */
  linkShowreel: text("link_showreel"),
  /** Consensi spuntati: JSON con le voci accettate e il momento dell'accettazione. */
  consensi: text("consensi").notNull().default("{}"),
  /** ricevuta | da-valutare | preselezionata | contattata | convocata | selezionata | non-selezionata. */
  stato: text("stato").notNull().default("ricevuta"),
  /** Note interne della produzione: mai pubbliche. */
  noteInterne: text("note_interne"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/* ══════════════════════════════════════════════════════════════════════════════
   CATALOGO MUSICALE — BRANO MASTER E SORGENTI (ordine del 29/09/2026).

   «Il BRANO è l'elemento principale. AUDIO, VIDEO, COVER, LINK, VERSIONI, PLAYLIST,
    VIDEOCLIP e CASTING sono contenuti ASSOCIATI a quel brano, non entità separate.
    Non ragionare "ho un MP4 = posso pubblicare".»

   Per questo il modello è a due livelli e non uno:

     brani_master    → UN record per brano. Titolo, artista, cover. Nient'altro.
     brani_sorgenti  → TANTE righe per lo stesso brano: il link Suno, il videoclip
                       YouTube, il file audio caricato, la versione V5.5, ecc.

   Conseguenza voluta: un brano può essere pubblicato con SOLO un link Suno, senza
   nessun MP4, e resta un brano completo. E due versioni dello stesso titolo NON
   diventano due brani: diventano due sorgenti dello stesso master.

   La produzione del videoclip continua a stare in `brani_video`, agganciata all'ID
   del brano: vale sia per i 40 brani del catalogo storico (`hugo-NN`) sia per questi.
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * IL BRANO MASTER. Un solo record per brano musicale.
 *
 * `id` è testo e NON dipende dal titolo: al momento dell'importazione il titolo può
 * ancora essere sconosciuto (Suno non sempre restituisce i metadati) e il record va
 * creato comunque, da completare a mano. Formato: `mus-` + 8 caratteri.
 */
export const braniMaster = sqliteTable("brani_master", {
  id: text("id").primaryKey(),
  /** Titolo come pubblicato dall'autore. Mai un titolo inventato: se manca resta vuoto. */
  titolo: text("titolo").notNull().default(""),
  /** Chiave di confronto per il controllo duplicati: titolo ridotto a lettere e numeri. */
  chiaveTitolo: text("chiave_titolo").notNull().default(""),
  artista: text("artista"),
  /** Copertina REALE della pubblicazione (cdn Suno, miniatura YouTube, file caricato). */
  cover: text("cover"),
  genere: text("genere"),
  /** Anno/data di pubblicazione dichiarata. Vuoto finché il dato ufficiale non arriva. */
  anno: text("anno"),
  descrizione: text("descrizione"),
  /** Annotazione di redazione, mai pubblica. */
  notaInterna: text("nota_interna"),
  /**
   * da-verificare | verificato — stato della scheda nella coda di importazione.
   * Una scheda `da-verificare` è comunque pubblica se ha titolo e sorgente reali.
   */
  stato: text("stato").notNull().default("da-verificare"),
  /** Etichetta della tornata di importazione, es. «IMPORTAZIONE J.C. HUGÒ 29/09/2026». */
  tornata: text("tornata"),
  /** Nascondi dalla discografia pubblica senza cancellare il record. */
  nascosto: integer("nascosto", { mode: "boolean" }).notNull().default(false),
  ordine: integer("ordine").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * LE SORGENTI DI UN BRANO. Più righe per lo stesso `branoId`.
 *
 * È qui che vive la regola «mai obbligare un MP4»: il `tipo` dice che cosa è quel
 * contenuto (audio, videoclip, visual audio) e la `piattaforma` dice da dove arriva.
 * Un link Suno è `tipo=audio` + `piattaforma=suno`. Non è un video e non viene mai
 * presentato come tale.
 */
export const braniSorgenti = sqliteTable("brani_sorgenti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** ID del brano master (o di un brano del catalogo storico, es. `hugo-07`). */
  branoId: text("brano_id").notNull(),
  /** audio | videoclip | visual-audio. */
  tipo: text("tipo").notNull().default("audio"),
  /** suno | youtube | youtube-music | file-audio | file-video | altro. */
  piattaforma: text("piattaforma").notNull().default("altro"),
  /** Indirizzo definitivo e normalizzato (per Suno: la pagina `song/<uuid>`). */
  url: text("url").notNull(),
  /** Indirizzo come l'ha consegnato l'editore, anche se era un link breve `suno.com/s/...`. */
  urlOriginale: text("url_originale"),
  /** ID sulla piattaforma: UUID Suno, ID video YouTube. Serve al controllo duplicati. */
  idEsterno: text("id_esterno"),
  /** Etichetta della versione, come la chiama l'autore: «V5.5», «versione 2», «radio edit». */
  versione: text("versione"),
  /** Copertina propria della sorgente, quando è diversa da quella del brano. */
  cover: text("cover"),
  /** La sorgente da far partire per prima su quel tipo di contenuto. */
  principale: integer("principale", { mode: "boolean" }).notNull().default(false),
  nota: text("nota"),
  ordine: integer("ordine").notNull().default(0),
  /** Durata reale in secondi, letta dalla piattaforma. Serve al palinsesto della radio. */
  durataSec: integer("durata_sec"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * SINCRONIZZAZIONE STRIPE → TOUCH PLAZA (istruzioni di Claudio del 03/10/2026).
 *
 * Una riga = un Product Stripe di un account autorizzato. `stripeProductId` è unico per
 * account: webhook ripetuti e riconciliazioni aggiornano la stessa riga, mai un doppione.
 *
 * Dati COMMERCIALI (nome, descrizione, immagini, prezzi, Payment Link, attivo) = da Stripe,
 * si riscrivono a ogni sincronizzazione.
 * Dati EDITORIALI (slugSito = scheda del sito associata, categoria, testo, immagini extra)
 * = del sito, la sincronizzazione non li tocca.
 */
export const stripeProdotti = sqliteTable("stripe_prodotti", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Nome dell'account Stripe (es. "principale"), mai la chiave. */
  account: text("account").notNull(),
  stripeProductId: text("stripe_product_id").notNull(),
  /** Indirizzo della scheda Touch Plaza generata: /shop/p/<slug>. Fissato alla prima importazione. */
  slug: text("slug").notNull(),
  nome: text("nome").notNull(),
  descrizione: text("descrizione"),
  /** JSON string[] — immagini del Product su Stripe. */
  immagini: text("immagini").notNull().default("[]"),
  /** JSON VarianteStripe[] — prezzi attivi, con il loro Payment Link quando c'è. */
  prezzi: text("prezzi").notNull().default("[]"),
  /** 1 = attivo su Stripe. 0 = archiviato: esce dalla vendita. */
  attivo: integer("attivo").notNull().default(1),
  livemode: integer("livemode").notNull().default(0),
  /** Scheda del sito già esistente associata a questo Product (evita i doppioni). */
  slugSito: text("slug_sito"),
  /** Campi editoriali gestiti dal sito. */
  categoria: text("categoria"),
  testoEditoriale: text("testo_editoriale"),
  /** JSON string[] — immagini aggiuntive caricate dal sito (non toccate dalla sync). */
  immaginiExtra: text("immagini_extra"),
  /** Condizioni dell'articolo scritte dal sito (una per riga). */
  condizioni: text("condizioni"),
  /** IVA mostrata SOLO se confermata dal pannello: mai dedotta da Stripe. */
  ivaPercentuale: integer("iva_percentuale"),
  ivaInclusa: integer("iva_inclusa"),
  ultimaSync: integer("ultima_sync", { mode: "timestamp" }),
  errore: text("errore"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex("stripe_prodotti_account_product").on(t.account, t.stripeProductId),
  uniqueIndex("stripe_prodotti_slug").on(t.slug),
]);

/** Eventi webhook Stripe già elaborati: un evento ripetuto non si rielabora. */
export const stripeEventi = sqliteTable("stripe_eventi", {
  eventId: text("event_id").primaryKey(),
  account: text("account").notNull(),
  tipo: text("tipo").notNull(),
  esito: text("esito"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Account Stripe collegati a Touch Plaza. L'account «principale» viene dall'ambiente
 * (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET): qui ha solo la riga di stato, senza chiavi.
 * Gli account aggiunti dal pannello tengono le chiavi SOLO sul server: non tornano mai al browser.
 */
export const stripeAccount = sqliteTable("stripe_account", {
  nome: text("nome").primaryKey(),
  origine: text("origine").notNull().default("pannello"),
  chiave: text("chiave"),
  segretoWebhook: text("segreto_webhook"),
  /** Nome dell'attività letto da Stripe (/v1/account), quando disponibile. */
  nomeStripe: text("nome_stripe"),
  livemode: integer("livemode").notNull().default(0),
  ultimaSync: integer("ultima_sync", { mode: "timestamp" }),
  ultimoErrore: text("ultimo_errore"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * CANDIDATURE ONLINE AGLI ANNUNCI DELLA BACHECCA LAVORO (ordine di Claudio del 04/10/2026:
 * «Voglio il modulo online» per Casting Inviate, Videomaker, Assistente di produzione).
 *
 * Una riga per candidatura. Gli annunci ammessi sono l'elenco chiuso in
 * api/data/annunci-lavoro.ts. I file (foto, CV, portfolio, allegati) non stanno qui:
 * usano le PRATICHE DI CARICAMENTO con ambito `lavoro` e restano sugli slot
 * `lavoro:candidatura:<id>:<campo>`, riservati. Nessuna riga di prova.
 */
export const lavoroCandidature = sqliteTable("lavoro_candidature", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Slug dell'annuncio (es. `assistente-di-produzione`). */
  annuncio: text("annuncio").notNull(),
  ruolo: text("ruolo").notNull(),
  nome: text("nome").notNull(),
  cognome: text("cognome").notNull(),
  dataNascita: text("data_nascita"),
  citta: text("citta"),
  zona: text("zona"),
  telefono: text("telefono"),
  email: text("email"),
  esperienze: text("esperienze"),
  presentazione: text("presentazione"),
  attrezzatura: text("attrezzatura"),
  disponibilita: text("disponibilita"),
  social: text("social"),
  linkLavori: text("link_lavori"),
  /** Riepilogo dei file collegati (JSON). */
  allegati: text("allegati").notNull().default("{}"),
  /** Consensi spuntati: JSON con voce → momento dell'accettazione. */
  consensi: text("consensi").notNull().default("{}"),
  /** ricevuta | da-valutare | contattata | colloquio | selezionata | non-selezionata. */
  stato: text("stato").notNull().default("ricevuta"),
  /** 1 = avviso e-mail a lavoro@tibihacca.com partito davvero. */
  notificata: integer("notificata").notNull().default(0),
  noteInterne: text("note_interne"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * TOUCH RADIO / TOUCH TV — CALENDARI INDIPENDENTI PER CANALE (regola di Claudio del 15/10/2026).
 *
 * Fase 1: i due canali trasmettono il palinsesto generale CONDIVISO e questa tabella resta vuota.
 * Fase 2: dal pannello /allestimento/canali-touch si passa a «Palinsesti separati» e ogni riga
 * diventa uno spazio di programmazione di UN canale (orario, rubrica, diretta, video, audio, spot),
 * che prende il posto del palinsesto generale in quella fascia. Nessuna riga di prova.
 * La modalità (condiviso / separati) sta in `settings`, chiave `touch_palinsesto_modalita`.
 */
export const touchPalinsesto = sqliteTable("touch_palinsesto", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** radio | tv */
  canale: text("canale").notNull(),
  /** 1 = lunedì … 7 = domenica; null quando vale una data precisa. */
  giorno: integer("giorno"),
  /** YYYY-MM-DD (ora di Roma) per un appuntamento singolo; null = ogni settimana. */
  data: text("data"),
  /** HH:MM ora di Roma. */
  ora: text("ora").notNull(),
  durataMin: integer("durata_min").notNull(),
  /** touch-music | dm-on-air | dm-highlights | pubblicita */
  rubrica: text("rubrica").notNull(),
  /** diretta (embed/live) | video (YouTube) | audio (file pubblico) | spot (YouTube) */
  tipo: text("tipo").notNull(),
  titolo: text("titolo").notNull(),
  descrizione: text("descrizione"),
  /** ID YouTube, indirizzo embed della diretta o indirizzo del file audio. */
  sorgente: text("sorgente").notNull(),
  /** Pagina pubblica del contenuto (YouTube, Suno…). */
  link: text("link"),
  /** Solo per gli spot: chi è l'inserzionista (serve al rendiconto). */
  inserzionista: text("inserzionista"),
  attivo: integer("attivo").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * STATISTICHE E CONTEGGI PUBBLICITARI SEPARATI PER CANALE — anche con il palinsesto condiviso.
 *
 * Una riga per evento REALE, registrato dal player solo mentre è acceso:
 * · avvio     → qualcuno ha premuto ASCOLTA (radio) o GUARDA (tv);
 * · passaggio → un contenuto (brano, spot, diretta) è andato in onda su quel player.
 * Lo stesso passaggio nella stessa sessione si conta una volta sola (indice unico).
 * Nessun numero stimato: il rendiconto conta solo queste righe.
 */
export const touchEventi = sqliteTable(
  "touch_eventi",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    canale: text("canale").notNull(),
    /** avvio | passaggio */
    evento: text("evento").notNull(),
    /** Sessione anonima del browser (nessun dato personale). */
    sessione: text("sessione").notNull(),
    /** YYYY-MM-DD ora di Roma. */
    giorno: text("giorno").notNull(),
    /** brano | spot | dm | programma (solo per i passaggi). */
    tipo: text("tipo"),
    rubrica: text("rubrica"),
    titolo: text("titolo"),
    inserzionista: text("inserzionista"),
    /** Inizio del passaggio in scaletta (ms): identifica il passaggio. 0 per gli avvii. */
    inizio: integer("inizio").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("touch_eventi_unico").on(t.canale, t.evento, t.sessione, t.inizio)],
);

/* ══════════════════════════════════════════════════════════════════════════════
   PALINSESTI AUTOMATICI DEI 27 CHANNEL — ordine di Claudio del 18/10/2026.

   Ogni Channel della home «Canale 0» (api/data/channel-home.ts) ha il proprio
   ARCHIVIO e la propria PLAYLIST programmabile:
   · `channel_contenuti`  → un contenuto per riga. Le righe «auto» arrivano SOLO da
     archivi del sito già verificati (video DM per società, puntate DM, brani J.C. Hugò,
     spot interni TBH, servizi cinema, vetrina Touch Plaza, annunci lavoro, casting
     pubblicati). Indice unico (channel, sorgente): lo stesso contenuto non entra due volte.
   · `channel_impostazioni` → modalità, rotazione casuale, repliche, intervallo spot,
     aggiornamento automatico.
   · `channel_fasce` → appuntamenti a orario (diretta / replica / playlist) inseriti
     dal pannello: nessun orario inventato, la tabella parte vuota.
   TOUCH TV e TOUCH RADIO restano sul palinsesto condiviso di `touch_palinsesto`.

   AMBITO (fase 2, 18/10/2026): anteprima e sito pubblico usano lo STESSO database.
   Ogni riga porta `ambiente` = staging | produzione (api/lib/ambiente.ts): ognuno
   legge e scrive SOLO le proprie righe, così lo staging non tocca mai la produzione.
   ══════════════════════════════════════════════════════════════════════════════ */
export const channelContenuti = sqliteTable(
  "channel_contenuti",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** staging | produzione — le righe di un ambito non sono mai lette dall'altro. */
    ambiente: text("ambiente").notNull().default("staging"),
    /** Slug del Channel (channel-home.ts). */
    channel: text("channel").notNull(),
    /** video | audio | diretta | spot | scheda | annuncio */
    tipo: text("tipo").notNull(),
    titolo: text("titolo").notNull(),
    descrizione: text("descrizione"),
    /** ID YouTube, indirizzo embed/audio o pagina interna (/shop/p/...). */
    sorgente: text("sorgente").notNull(),
    link: text("link"),
    /** Durata reale in secondi; null = sconosciuta (si passa al successivo a fine video). */
    durataSec: integer("durata_sec"),
    ordine: integer("ordine").notNull().default(0),
    /** Passaggi per ogni giro della playlist (1 = una volta). */
    frequenza: integer("frequenza").notNull().default(1),
    /** Chi firma il contenuto (es. «DM · media partner esterno»). */
    attribuzione: text("attribuzione"),
    /** auto | manuale */
    origine: text("origine").notNull().default("manuale"),
    /** Archivio di provenienza per le righe auto (dm-video, dm-puntate, …). */
    fonte: text("fonte"),
    attivo: integer("attivo").notNull().default(1),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("channel_contenuti_unico_ambito").on(t.ambiente, t.channel, t.sorgente)],
);

export const channelImpostazioni = sqliteTable("channel_impostazioni", {
  ambiente: text("ambiente").notNull().default("staging"),
  channel: text("channel").notNull(),
  /** auto (calcolata) | diretta | replica | playlist | allestimento */
  modalita: text("modalita").notNull().default("auto"),
  casuale: integer("casuale").notNull().default(0),
  repliche: integer("repliche").notNull().default(1),
  /** Uno spot interno ogni N contenuti; 0 = nessuno spot. */
  spotOgni: integer("spot_ogni").notNull().default(0),
  /** Secondi di permanenza a schermo di una scheda (shop, annunci). */
  durataScheda: integer("durata_scheda").notNull().default(20),
  aggiornamentoAuto: integer("aggiornamento_auto").notNull().default(1),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
}, (t) => [primaryKey({ columns: [t.ambiente, t.channel] })]);

export const channelFasce = sqliteTable("channel_fasce", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ambiente: text("ambiente").notNull().default("staging"),
  channel: text("channel").notNull(),
  /** 1 = lunedì … 7 = domenica; null = tutti i giorni. */
  giorno: integer("giorno"),
  /** HH:MM ora di Roma. */
  ora: text("ora").notNull(),
  durataMin: integer("durata_min").notNull(),
  /** diretta | replica | playlist */
  modalita: text("modalita").notNull(),
  titolo: text("titolo").notNull(),
  /** Solo per la diretta: indirizzo embed ufficiale. */
  sorgente: text("sorgente"),
  attivo: integer("attivo").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/* ══════════════════════════════════════════════════════════════════════════════
   CAROSELLI DI CANALE 0 — contatori per scheda (richiesta di Claudio del 18/10/2026:
   «verificare i passaggi giornalieri direttamente da questi banner»).
   · vista = la scheda è stata davvero sullo schermo (≥ 50% visibile per 1 s);
   · clic  = il pulsante della scheda è stato premuto.
   Una riga per (carosello, scheda, tipo, sessione, giorno): ricaricare la pagina non gonfia
   i numeri. Sessione anonima del browser, nessun dato personale. Bot esclusi dal server.
   `ambito` separa anteprima, collaudo e sito pubblico.
   ══════════════════════════════════════════════════════════════════════════════ */
export const caroselloEventi = sqliteTable(
  "carosello_eventi",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    carosello: text("carosello").notNull(),
    scheda: text("scheda").notNull(),
    /** vista | clic */
    tipo: text("tipo").notNull(),
    ambito: text("ambito").notNull(),
    sessione: text("sessione").notNull(),
    /** YYYY-MM-DD ora di Roma. */
    giorno: text("giorno").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("carosello_eventi_unico").on(t.carosello, t.scheda, t.tipo, t.ambito, t.sessione, t.giorno)],
);
