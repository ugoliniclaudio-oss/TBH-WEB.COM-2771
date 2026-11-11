/**
 * BRAND IN INTERVISTA · STUDIO · DIRETTA
 * Sottosezione di "Brand & Personalizzazioni".
 * Scene dimostrative: le immagini sono SIMULAZIONI neutre (nessun logo reale o inventato).
 * Il marchio di esempio è sempre "IL TUO BRAND". Nessun prezzo: la trattativa è commerciale.
 * x/y sono percentuali sull'immagine, usate per posizionare gli hotspot numerati.
 */

export type Posizione = {
  numero: number;
  titolo: string;
  spiegazione: string;
  x: number;
  y: number;
};

export type Scena = {
  slug: string;
  label: string;
  titolo: string;
  sottotitolo: string;
  immagine: string;
  posizioni: Posizione[];
};

export const MARCHIO_DEMO = "IL TUO BRAND";

const INTERVISTA: Posizione[] = [
  {
    numero: 1,
    titolo: "Backdrop alle spalle dell'intervistato",
    spiegazione:
      "Il pannello dietro chi parla: logo ripetuto a scacchiera oppure un solo main sponsor in grande. È la superficie più inquadrata di tutta l'intervista.",
    x: 20,
    y: 18,
  },
  {
    numero: 2,
    titolo: "Microfono (mic flag)",
    spiegazione:
      "La bandierina cubica sul microfono. Entra in ogni primo piano e resta visibile per tutta la durata della risposta.",
    x: 43,
    y: 52,
  },
  {
    numero: 3,
    titolo: "Lower third",
    spiegazione:
      "La grafica in basso con nome e ruolo dell'intervistato: accanto al nome compare lo spazio sponsor. Appare a ogni cambio di persona.",
    x: 22,
    y: 92,
  },
  {
    numero: 4,
    titolo: "Sovrimpressione (logo in angolo)",
    spiegazione:
      "Logo in trasparenza in un angolo dello schermo: permanente per tutto il video o temporaneo a intervalli.",
    x: 93,
    y: 8,
  },
  {
    numero: 5,
    titolo: "Apertura intervista (billboard)",
    spiegazione:
      "I primi secondi: cartello animato «Intervista offerta da…». È il punto di massima attenzione dello spettatore.",
    x: 60,
    y: 6,
  },
  {
    numero: 6,
    titolo: "Chiusura intervista",
    spiegazione:
      "Cartello finale con logo, sito, social e una chiamata all'azione. Chiude il video e resta come ultima immagine.",
    x: 78,
    y: 92,
  },
  {
    numero: 7,
    titolo: "Abbigliamento inviato / operatore",
    spiegazione:
      "Polo, giacca, t-shirt, cappellino e pass della crew: il marchio si muove insieme alla troupe, anche fuori inquadratura tra il pubblico.",
    x: 88,
    y: 70,
  },
  {
    numero: 8,
    titolo: "Prodotto fisico (product placement)",
    spiegazione:
      "Il prodotto reale appoggiato in scena o in mano all'intervistato: bottiglia, confezione, gadget, capo d'abbigliamento.",
    x: 56,
    y: 79,
  },
  {
    numero: 9,
    titolo: "Monitor nell'ambiente",
    spiegazione:
      "Schermo presente in scena con flyer o video in rotazione: una seconda esposizione dentro la stessa inquadratura.",
    x: 7,
    y: 47,
  },
  {
    numero: 10,
    titolo: "Desk / tavolo",
    spiegazione:
      "Il pannello frontale del tavolo: superficie ampia, sempre inquadrata nei piani larghi e medi.",
    x: 33,
    y: 88,
  },
  {
    numero: 11,
    titolo: "Roll-up / totem laterale",
    spiegazione:
      "Struttura verticale a lato della scena: entra nei piani larghi e nelle foto di backstage riutilizzate sui social.",
    x: 72,
    y: 40,
  },
  {
    numero: 12,
    titolo: "Descrizione del video / articolo",
    spiegazione:
      "Sotto il video e nell'articolo: citazione dello sponsor con link cliccabile. Visibilità che resta nel tempo, non solo in onda.",
    x: 8,
    y: 8,
  },
];

const STUDIO: Posizione[] = [
  {
    numero: 1,
    titolo: "LED wall / videowall",
    spiegazione:
      "La parete led dietro il conduttore: il marchio può occuparla per intero o comparire in rotazione con le grafiche del programma.",
    x: 45,
    y: 26,
  },
  {
    numero: 2,
    titolo: "Monitor laterale",
    spiegazione:
      "Schermo secondario a lato: ospita loghi, spot muti in loop o l'offerta del momento.",
    x: 10,
    y: 38,
  },
  {
    numero: 3,
    titolo: "Desk",
    spiegazione: "Il fronte del bancone del conduttore: presente praticamente in ogni inquadratura.",
    x: 50,
    y: 68,
  },
  {
    numero: 4,
    titolo: "Backdrop",
    spiegazione: "Il pannello di fondo su cui si stagliano gli ospiti nei piani medi e nelle interviste in studio.",
    x: 80,
    y: 45,
  },
  {
    numero: 5,
    titolo: "Logo in sovrimpressione",
    spiegazione: "Logo fisso in un angolo dello schermo per tutta la puntata o a fasce orarie.",
    x: 94,
    y: 8,
  },
  {
    numero: 6,
    titolo: "Lower third",
    spiegazione: "Barra grafica con nome e ruolo: lo spazio sponsor compare ogni volta che parla qualcuno.",
    x: 20,
    y: 92,
  },
  {
    numero: 7,
    titolo: "Billboard di apertura",
    spiegazione: "«Questa puntata è offerta da…» nei primi secondi della sigla.",
    x: 62,
    y: 6,
  },
  {
    numero: 8,
    titolo: "Billboard di chiusura",
    spiegazione: "Cartello finale sui titoli di coda con logo, sito e social.",
    x: 78,
    y: 92,
  },
  {
    numero: 9,
    titolo: "Break pubblicitario",
    spiegazione: "Lo stacco a metà puntata: spot, promo o cartello statico prima del rientro in studio.",
    x: 33,
    y: 18,
  },
  {
    numero: 10,
    titolo: "Product placement",
    spiegazione: "Il prodotto reale in studio, usato o mostrato dal conduttore.",
    x: 58,
    y: 56,
  },
  {
    numero: 11,
    titolo: "Abbigliamento conduttore / crew",
    spiegazione: "Divise, polo e spille della squadra in studio e dietro le camere.",
    x: 49,
    y: 52,
  },
  {
    numero: 12,
    titolo: "Oggetti e gadget sul tavolo",
    spiegazione: "Tazza, penna, blocco, portacarte: dettagli che entrano nei primi piani sul desk.",
    x: 40,
    y: 56,
  },
  {
    numero: 13,
    titolo: "Cartello / roll-up",
    spiegazione: "Struttura mobile in studio, riposizionabile in base alla rubrica in onda.",
    x: 92,
    y: 45,
  },
  {
    numero: 14,
    titolo: "Grafica del programma",
    spiegazione: "Sigle, transizioni, titoli e schede: il marchio dentro il linguaggio visivo della trasmissione.",
    x: 25,
    y: 45,
  },
  {
    numero: 15,
    titolo: "Sponsor della rubrica",
    spiegazione: "Un segmento fisso della puntata porta il nome del marchio: «la rubrica di…».",
    x: 66,
    y: 33,
  },
  {
    numero: 16,
    titolo: "CTA / sito / social del cliente",
    spiegazione: "Invito finale a visitare sito, negozio o profilo social, ripetuto anche nella descrizione del video.",
    x: 50,
    y: 96,
  },
];

const SPORTIVO: Posizione[] = [
  {
    numero: 1,
    titolo: "Main partner del programma",
    spiegazione: "Il marchio principale della trasmissione: presente in sigla, in studio e in ogni puntata della stagione.",
    x: 39,
    y: 20,
  },
  {
    numero: 2,
    titolo: "Partner della puntata",
    spiegazione: "Sponsorizzazione di una singola puntata, citata in apertura e in chiusura.",
    x: 60,
    y: 20,
  },
  {
    numero: 3,
    titolo: "Match partner",
    spiegazione: "Il marchio associato alla partita raccontata: «il match di giornata è offerto da…».",
    x: 88,
    y: 27,
  },
  {
    numero: 4,
    titolo: "Partner risultati",
    spiegazione: "La grafica dei risultati porta il logo: compare a ogni aggiornamento.",
    x: 20,
    y: 30,
  },
  {
    numero: 5,
    titolo: "Partner classifica",
    spiegazione: "La tabella della classifica è brandizzata e viene ripresa anche nelle clip social.",
    x: 55,
    y: 38,
  },
  {
    numero: 6,
    titolo: "Partner highlights",
    spiegazione: "I momenti salienti aprono e chiudono con il marchio: il contenuto più condiviso della settimana.",
    x: 88,
    y: 44,
  },
  {
    numero: 7,
    titolo: "Partner interviste",
    spiegazione: "Ogni intervista del programma è introdotta dal marchio, in studio e a bordo campo.",
    x: 25,
    y: 50,
  },
  {
    numero: 8,
    titolo: "Partner moviola / commento",
    spiegazione: "L'analisi tecnica e la moviola portano il logo nella grafica di appoggio.",
    x: 58,
    y: 50,
  },
  {
    numero: 9,
    titolo: "Partner della rubrica",
    spiegazione: "Un segmento fisso (giovanili, femminile, dilettanti, motori) prende il nome del marchio.",
    x: 42,
    y: 57,
  },
  {
    numero: 10,
    titolo: "Sponsor del collegamento",
    spiegazione: "«Il collegamento è offerto da…» ogni volta che si passa la linea all'inviato.",
    x: 45,
    y: 72,
  },
];

const DIRETTA: Posizione[] = [
  {
    numero: 1,
    titolo: "Sponsor fisso",
    spiegazione: "Logo sempre presente in un angolo per tutta la durata della diretta.",
    x: 92,
    y: 8,
  },
  {
    numero: 2,
    titolo: "Sponsor temporaneo",
    spiegazione: "Logo che compare a intervalli programmati, per pochi secondi ogni volta.",
    x: 8,
    y: 8,
  },
  {
    numero: 3,
    titolo: "Banner animato",
    spiegazione: "Striscia in movimento nella parte bassa dello schermo, con messaggio breve.",
    x: 50,
    y: 86,
  },
  {
    numero: 4,
    titolo: "Ticker / scroller",
    spiegazione: "Il testo che scorre in fondo: notizie, risultati o messaggio del cliente.",
    x: 50,
    y: 96,
  },
  {
    numero: 5,
    titolo: "Cornice sponsorizzata",
    spiegazione: "L'immagine si rimpicciolisce dentro una cornice brandizzata: visibilità totale senza coprire la scena.",
    x: 3,
    y: 50,
  },
  {
    numero: 6,
    titolo: "Bumper",
    spiegazione: "Clip di pochi secondi in entrata e uscita da ogni blocco: il marchio scandisce il ritmo della diretta.",
    x: 62,
    y: 12,
  },
  {
    numero: 7,
    titolo: "Spot",
    spiegazione: "Il video pubblicitario vero e proprio, mandato in onda nei momenti di stacco.",
    x: 75,
    y: 24,
  },
  {
    numero: 8,
    titolo: "Split screen",
    spiegazione: "Metà schermo alla diretta, metà al contenuto del cliente: prodotto, offerta o messaggio.",
    x: 12,
    y: 40,
  },
  {
    numero: 9,
    titolo: "«Diretta offerta da…»",
    spiegazione: "Annuncio in voce e in grafica all'inizio della trasmissione.",
    x: 30,
    y: 6,
  },
  {
    numero: 10,
    titolo: "«Collegamento offerto da…»",
    spiegazione: "Ogni passaggio all'inviato o al campo cita il marchio.",
    x: 78,
    y: 60,
  },
  {
    numero: 11,
    titolo: "Monitor virtuale",
    spiegazione: "Schermo inserito in post-produzione dentro la scena: contenuto sostituibile puntata per puntata.",
    x: 55,
    y: 24,
  },
  {
    numero: 12,
    titolo: "Product placement",
    spiegazione: "Il prodotto reale in inquadratura durante la diretta, usato o citato.",
    x: 28,
    y: 52,
  },
  {
    numero: 13,
    titolo: "CTA finale",
    spiegazione: "Ultimo messaggio prima della chiusura: sito, WhatsApp, QR o promozione attiva.",
    x: 40,
    y: 92,
  },
];

const RADIO: Posizione[] = [
  {
    numero: 1,
    titolo: "Pannello alle spalle",
    spiegazione: "La parete inquadrata dalla camera del video-podcast: superficie grande e sempre in scena.",
    x: 48,
    y: 20,
  },
  {
    numero: 2,
    titolo: "Microfono conduttore",
    spiegazione: "Logo sulla schermatura o sull'anello del microfono: entra in tutti i primi piani.",
    x: 26,
    y: 54,
  },
  {
    numero: 3,
    titolo: "Microfono ospite",
    spiegazione: "Seconda postazione: il marchio compare anche nelle clip verticali dell'ospite.",
    x: 63,
    y: 54,
  },
  {
    numero: 4,
    titolo: "Monitor sul tavolo",
    spiegazione: "Schermo con logo o contenuto in rotazione, visibile nei piani larghi.",
    x: 45,
    y: 56,
  },
  {
    numero: 5,
    titolo: "Fronte del tavolo",
    spiegazione: "Pannello frontale della postazione: la superficie più ampia dell'inquadratura.",
    x: 40,
    y: 78,
  },
  {
    numero: 6,
    titolo: "Cuffie e attrezzatura",
    spiegazione: "Adesivi e personalizzazioni sull'attrezzatura tecnica: dettagli che i primi piani valorizzano.",
    x: 73,
    y: 37,
  },
  {
    numero: 7,
    titolo: "Camera video-podcast",
    spiegazione: "La ripresa video trasforma la radio in contenuto social: il marchio viaggia su YouTube e Reels.",
    x: 86,
    y: 38,
  },
  {
    numero: 8,
    titolo: "Menzione in voce",
    spiegazione: "Citazione letta dal conduttore, in apertura, a metà e in chiusura di puntata.",
    x: 8,
    y: 8,
  },
  {
    numero: 9,
    titolo: "Gadget in scena",
    spiegazione: "Prodotto o gadget appoggiato sul tavolo, mostrato e commentato durante la puntata.",
    x: 55,
    y: 70,
  },
];

const EVENTO: Posizione[] = [
  {
    numero: 1,
    titolo: "Press wall",
    spiegazione: "La parete stampa davanti a cui passano tutti gli ospiti: foto, interviste e articoli la riprendono.",
    x: 78,
    y: 20,
  },
  {
    numero: 2,
    titolo: "Microfono (mic flag)",
    spiegazione: "La bandierina del microfono nell'intervista sul posto: presente in ogni primo piano.",
    x: 58,
    y: 34,
  },
  {
    numero: 3,
    titolo: "Totem laterale",
    spiegazione: "Struttura verticale a bordo scena: visibile in inquadratura e dal pubblico presente.",
    x: 17,
    y: 45,
  },
  {
    numero: 4,
    titolo: "Banner sulla struttura",
    spiegazione: "Striscia sul truss o sull'arco d'ingresso: la vedono tutti, dentro e fuori dalla ripresa.",
    x: 50,
    y: 4,
  },
  {
    numero: 5,
    titolo: "Tavolo espositivo",
    spiegazione: "Postazione dedicata con pannello frontale personalizzato.",
    x: 88,
    y: 74,
  },
  {
    numero: 6,
    titolo: "Prodotti e gadget",
    spiegazione: "Materiale reale a disposizione del pubblico: campioni, confezioni, omaggi.",
    x: 92,
    y: 62,
  },
  {
    numero: 7,
    titolo: "Abbigliamento e pass",
    spiegazione: "Divise dell'inviato e dello staff, pass e accrediti: il marchio si muove nell'evento.",
    x: 44,
    y: 60,
  },
  {
    numero: 8,
    titolo: "Lower third",
    spiegazione: "Grafica in basso durante l'intervista, con spazio sponsor accanto al nome.",
    x: 22,
    y: 92,
  },
  {
    numero: 9,
    titolo: "Sovrimpressione",
    spiegazione: "Logo in angolo su tutto il servizio girato all'evento.",
    x: 94,
    y: 8,
  },
  {
    numero: 10,
    titolo: "Area pubblico e gallery",
    spiegazione: "Foto e video del pubblico pubblicati dopo l'evento: il marchio resta nelle gallery e negli archivi.",
    x: 12,
    y: 70,
  },
];

export const SCENE: Scena[] = [
  {
    slug: "intervista",
    label: "Intervista",
    titolo: "Intervista",
    sottotitolo: "12 posizioni in una sola intervista",
    immagine: "/brand-visibilita/intervista.jpg",
    posizioni: INTERVISTA,
  },
  {
    slug: "studio-tv",
    label: "Studio TV",
    titolo: "Trasmissione in studio",
    sottotitolo: "16 posizioni in una sola puntata",
    immagine: "/brand-visibilita/studio.jpg",
    posizioni: STUDIO,
  },
  {
    slug: "programma-sportivo",
    label: "Programma sportivo",
    titolo: "Programma sportivo",
    sottotitolo: "10 ruoli da partner, dalla sigla al post-partita",
    immagine: "/brand-visibilita/sportivo.jpg",
    posizioni: SPORTIVO,
  },
  {
    slug: "diretta",
    label: "Diretta",
    titolo: "Visibilità durante la diretta",
    sottotitolo: "13 formati che convivono nella stessa trasmissione",
    immagine: "/brand-visibilita/diretta.jpg",
    posizioni: DIRETTA,
  },
  {
    slug: "radio-podcast",
    label: "Radio / Podcast",
    titolo: "Postazione radio e video-podcast",
    sottotitolo: "9 posizioni tra audio e video",
    immagine: "/brand-visibilita/radio.jpg",
    posizioni: RADIO,
  },
  {
    slug: "evento",
    label: "Evento",
    titolo: "Intervista durante un evento",
    sottotitolo: "10 posizioni sul posto e nel post-evento",
    immagine: "/brand-visibilita/evento.jpg",
    posizioni: EVENTO,
  },
];

export type Momento = { fase: string; nota: string; voci: string[] };

export const MOMENTI: Momento[] = [
  {
    fase: "Prima",
    nota: "La collaborazione comincia a produrre visibilità già nei giorni precedenti.",
    voci: [
      "Flyer",
      "Promo social",
      "Locandina",
      "Banner sul sito",
      "Countdown",
      "«Questa sera»",
      "Post sponsor",
    ],
  },
  {
    fase: "Durante",
    nota: "In onda il marchio occupa più superfici contemporaneamente.",
    voci: [
      "Studio",
      "Monitor",
      "Backdrop",
      "Grafiche",
      "Spot",
      "Product placement",
      "Sponsor della rubrica",
      "Sovrimpressioni",
    ],
  },
  {
    fase: "Dopo",
    nota: "Il contenuto continua a girare: è la parte di visibilità che dura più a lungo.",
    voci: [
      "Replay",
      "Highlights",
      "Clip social",
      "Intervista",
      "Articolo",
      "Gallery",
      "YouTube / video on demand",
      "Contenuti d'archivio",
    ],
  },
];

export const VISIBILITA_NOTA =
  "Le immagini di questa sezione sono simulazioni dimostrative: nessun marchio reale e nessun logo inventato. Al posto del marchio del cliente compare la dicitura «IL TUO BRAND». Posizioni, formati e combinazioni si definiscono in fase di preventivo.";
