/**
 * VIDEO DM COMUNICAZIONI PER SOCIETÀ — collegamento automatico.
 *
 * Fonte: canale YouTube ufficiale «Daniele Manuelli Official»
 * https://www.youtube.com/@DanieleManuelli1981 — elenco completo estratto il 29/08/2026
 * (2.290 video). I video qui sotto sono stati abbinati alle società confrontando il nome
 * della squadra con il titolo pubblicato da Daniele Manuelli.
 *
 * REGOLE:
 * · titoli e URL copiati ALLA LETTERA dal canale: nessun titolo riscritto, nessun URL inventato;
 * · «highlights» comprende solo i video che Daniele Manuelli ha titolato lui stesso come
 *   Highlights: non è un'etichetta aggiunta da noi;
 * · la stagione NON viene dedotta: dove il titolo non la dichiara, non viene scritta;
 * · il Rimini Calcio NON è in questo elenco: per ordine della direzione del 29/08/2026 resta
 *   società di calcio di interesse del territorio, fuori dalle squadre seguite da DM.
 *
 * NOME DELLE SOCIETÀ — aggiornamento del 17/09/2026, punto 9 («un contenuto, un record»).
 * Il campo `nome` porta il NOME PER ESTESO UFFICIALE, identico a quello scritto nell'area
 * sport (`sport.ts`) e nel catalogo (`catalog.ts`): prima qui stavano le forme abbreviate
 * («Verucchio», «Victoria 1968»), e la stessa società risultava scritta in due o tre modi.
 * Nessun nome è stato inventato: è stato scelto, fra le forme già presenti nel sito, quella
 * completa. Dove serve la forma corta in uno spazio ristretto si usa `nomeBreve` di
 * `SQUADRE`, che è un dato dichiarato, non una riduzione automatica.
 * I titoli dei video restano ALLA LETTERA come li ha pubblicati Daniele Manuelli.
 *
 * ────────────────────────────────────────────────────────────────────────────────
 * AGGIORNAMENTO DEL 30/09/2026 — ATTIVITÀ RECENTI, DAL 10/08/2026 A OGGI.
 *
 * Sono stati caricati i contenuti pubblicati dal canale nella finestra richiesta
 * (10/08/2026 → 30/09/2026) e abbinati ciascuno alla propria società. I video nuovi
 * stanno IN TESTA a ogni elenco, sotto il commento «ATTIVITÀ RECENTI», e portano la
 * data di pubblicazione; quelli sotto sono l'estrazione del 29/08/2026, invariati.
 *
 * COME OGNI VIDEO È STATO ABBINATO ALLA SUA SQUADRA (script `scripts/assegna-dm-recenti.ts`,
 * che riusa lo stesso motore di lettura dei titoli già in uso nel sito):
 *   · il titolo nomina la società → è sua («Pietracuta vs Imolese 2-2»). Se ne nomina
 *     due delle nostre («Pietracuta vs San Marino 0-0») il video sta su entrambe le
 *     pagine: è la partita di entrambe, non un doppione;
 *   · titolo di INTERVISTA che non nomina la società ma solo l'avversario
 *     («Interviste post Valsanterno Mancini e Renzi») → va alla società che in questa
 *     finestra ha incontrato quell'avversario, se è UNA SOLA. Quando erano due (due
 *     nostre squadre hanno giocato col Castenaso) ha deciso la data di pubblicazione
 *     dichiarata dal feed, e solo perché era esatta su entrambi i video.
 *
 * NON abbinati, e il perché — restano fuori, non messi a caso:
 *   · «Highlights| Eccellenza Romagna| Girone B | Rimini vs Russi 3-0» (22/09/2026):
 *     partita del Rimini, che per ordine della direzione del 29/08/2026 resta società
 *     di interesse del territorio, fuori dalle squadre seguite;
 *   · «Highlights| Prima Categoria| Girone H |   S.Ermete vs Granata 0-2» (26/09/2026):
 *     nessuna delle due società è fra quelle seguite;
 *   · «Interviste Forchino e Regno» (27/09/2026): il titolo non nomina né società né
 *     avversario. Serve la parola di Daniele Manuelli per sapere di chi è.
 *
 * TITOLI RIPORTATI ALLA FORMA DEL CANALE. Sette titoli arrivavano dall'elenco della
 * scheda canale TRADOTTI AUTOMATICAMENTE in inglese da YouTube. Verificati uno per uno
 * sull'endpoint oEmbed ufficiale, che restituisce il titolo nativo, e riportati alla
 * forma italiana con cui sono stati pubblicati. Due di quelle traduzioni erano finite
 * nel file già con l'estrazione del 29/08/2026 e sono state corrette qui:
 *   · «Summer Football. Verucchio, ready for the kickoff» → «Calcio Estate. Verucchio, pronti per lo start»
 *   · «Gabicce Gradara Calcio 26-27 Season Presentation» → «Presentazione Gabicce Gradara Calcio 26-27»
 * ────────────────────────────────────────────────────────────────────────────────
 * AGGIORNAMENTO DEL 17/10/2026 — VIDEO DELLE SQUADRE DAL 30/09/2026 A OGGI.
 *
 * Su ok di Claudio («Sì, aggiungili tutti con i titoli esatti») sono entrati i video delle
 * società seguite pubblicati dopo il carico del 30/09, con le stesse regole di abbinamento.
 * Titoli nativi letti sul feed RSS ufficiale del canale o, per i video fuori dal feed,
 * sull'endpoint oEmbed ufficiale (l'elenco della scheda canale li dà tradotti in inglese).
 * La data `pubblicato` c'è solo dove il feed ufficiale la dichiara; per gli altri non
 * viene scritta. Un video che nomina due nostre società sta su entrambe le pagine.
 *
 * NON abbinati il 17/10/2026, e il perché:
 *   · «Highlights | Prima Categoria Romagna | Girone H |  Bellariva vs S.Ermete 1-2»
 *     (10/10/2026): nessuna delle due è fra le società seguite (Bellariva NON è il
 *     Bellaria Igea Marina 1956);
 *   · «Interviste Girometti, Leardini e Montanari post J.Gambettola» e «Intervista Fontana
 *     post Gambettola»: col Gambettola hanno giocato sia il Verucchio sia il Victoria e il
 *     feed non dà più la data esatta → serve la parola di Daniele Manuelli;
 *   · «Highlights | Eccellenza Girone B |  Rimini vs San Marino 1-0» è sulla pagina del
 *     San Marino; il Rimini resta fuori da questo elenco (pagina società invariata, 17/10).
 * ──────────────────────────────────────────────────────────────────────────────── */

export const DM_CANALE_VIDEO = "https://www.youtube.com/@DanieleManuelli1981";

/**
 * DATA DI PUBBLICAZIONE — presente solo sui video dove è un dato DICHIARATO.
 *
 * `pubblicato` è la data-ora che YouTube dichiara nel feed ufficiale del canale
 * (https://www.youtube.com/feeds/videos.xml?channel_id=…): è la data in cui
 * Daniele Manuelli ha pubblicato il video, non la data della partita, e va letta
 * come tale. Il feed copre gli ultimi 15 video del canale e gli ultimi 15 di
 * ciascuna playlist di stagione: per i video più vecchi la data esatta non è più
 * ottenibile, e allora si scrive la FORBICE certa `pubblicatoDa`–`pubblicatoA`,
 * ricavata dall'etichetta relativa del canale («2 settimane fa») incrociata con i
 * video vicini a data esatta nello stesso elenco. Nessuna data viene inventata e
 * nessuna viene arrotondata a un giorno preciso quando il giorno preciso non c'è:
 * un intervallo dichiarato è un dato, un giorno indovinato no.
 *
 * `fonteData` dice sempre quale dei due casi è, così a schermo si può scrivere la
 * verità: «pubblicato il 27/09/2026» oppure «pubblicato fra il 09 e il 16/09/2026».
 */
export type VideoDm = {
  titolo: string;
  url: string;
  /** Giorno esatto di pubblicazione sul canale (feed ufficiale YouTube). */
  pubblicato?: string;
  /** Forbice certa di pubblicazione, quando il feed non copre più il video. */
  pubblicatoDa?: string;
  pubblicatoA?: string;
  fonteData?: "feed-ufficiale" | "forbice-canale";
};

export type VideoSquadra = {
  slug: string;
  nome: string;
  totale: number;
  highlights: VideoDm[];
  interviste: VideoDm[];
  servizi: VideoDm[];
};

export const DM_VIDEO_SQUADRE: VideoSquadra[] = [
  {
    slug: "verucchio",
    nome: "A.S.D. Verucchio Calcio 1957",
    totale: 72, /* +3 il 17/10/2026 */
    highlights: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Highlights | Prima Categoria Romagna | Girone H|  Verucchio vs Victoria 1-3", url: "https://www.youtube.com/watch?v=dy8TzznAdvM", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Prima Categoria | Girone H |  Gambettola vs Verucchio 1-0", url: "https://www.youtube.com/watch?v=VID5J9Tstu4" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Highlights | Prima Categoria | Girone H |  Verucchio vs San Bartolo 0-0", url: "https://www.youtube.com/watch?v=8fmrVWKtFYw", pubblicato: "2026-09-27", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Prima Categoria| Verucchio vs Accademia Marignanese 2-2", url: "https://www.youtube.com/watch?v=XhWqwOl-TDA", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Highlights Promozione  Verucchio vs Cervia 1-2", url: "https://www.youtube.com/watch?v=0ZXZwe0Cpes" },
    { titolo: "Highlights Verucchio vs Fratta Terme 0-2", url: "https://www.youtube.com/watch?v=YdNkjyU6n7s" },
    { titolo: "Highlights Promozione.  Verucchio vs Spiv 0-3", url: "https://www.youtube.com/watch?v=pm3ubD_4Lyk" },
    { titolo: "Highlights Promozione.  Verucchio vs Riccione 1-2", url: "https://www.youtube.com/watch?v=4-eo2pNpG4M" },
    { titolo: "PROMOZIONE ROMAGNA.  Highlights Verucchio vs Frugesport 1-4", url: "https://www.youtube.com/watch?v=mMHNfewpcy0" },
    { titolo: "HIGHLIGHTS.  Promozione Romagna.  Verucchio vs Bellariva 0-0", url: "https://www.youtube.com/watch?v=UIosiMwRM_w" },
    { titolo: "HIGHLIGHTS Promozione Romagna.  Verucchio vs Y.Santarcangelo 2-0", url: "https://www.youtube.com/watch?v=JRXISPTKhgM" },
    ],
    interviste: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Post Interviste Verucchio vs Victoria  Fabbri e Girometti", url: "https://www.youtube.com/watch?v=RhTQBEognPg", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Interviste post A. Marignanese Carnevali", url: "https://www.youtube.com/watch?v=f2UkODqFnIg", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Interviste Girometti e Carnevali Asd Verucchio Calcio", url: "https://www.youtube.com/watch?v=ywGtGPnJ8Ko" },
    { titolo: "Carrellata interviste protagonisti ASD Verucchio Calcio", url: "https://www.youtube.com/watch?v=nKXb8hpStDc" },
    { titolo: "Interviste Verucchio. Claudio Fabbri, Alessandro Fabbri e Mularoni.", url: "https://www.youtube.com/watch?v=2hLeFY8oQIQ" },
    { titolo: "Interviste Verucchio. Beccari, Michelucci, Bianchi, Benvenuti, Fabbri e Percoco", url: "https://www.youtube.com/watch?v=KQKkpYwFPXE" },
    { titolo: "Interviste post Verucchio vs Riccione", url: "https://www.youtube.com/watch?v=CrCVsl6W7Ak" },
    { titolo: "Intervista Mancini post Verucchio vs Classe", url: "https://www.youtube.com/watch?v=vBL9meQBNKY" },
    { titolo: "Intervista MANCINI post Verucchio vs Civitella", url: "https://www.youtube.com/watch?v=z5TywQYHotM" },
    { titolo: "Interviste post Verucchio vs Sampierana.  Nicolini e Barontini", url: "https://www.youtube.com/watch?v=PzvpLxrGZvE" },
    ],
    servizi: [
    /* Titolo riportato alla forma del canale il 30/09/2026: prima era qui la
       traduzione automatica in inglese fornita dall'elenco della scheda canale. */
    { titolo: "Calcio Estate. Verucchio, pronti per lo start", url: "https://www.youtube.com/watch?v=vhf8q5LTg6E" },
    { titolo: "Presentazione Asd Verucchio Calcio", url: "https://www.youtube.com/watch?v=XBr9hgUSotY" },
    { titolo: "Calcio Promozione Romagna.  Verucchio - Forlimpopoli 1-2", url: "https://www.youtube.com/watch?v=BcN6H5aFsOY" },
    { titolo: "Fabbri,  Mancini e Bianchi post Verucchio vs Y.Santarcangelo", url: "https://www.youtube.com/watch?v=1OAuJV4pxU8" },
    { titolo: "Verucchio vs Edelweiss 2-0", url: "https://www.youtube.com/watch?v=4gGg1_Sg2hs" },
    { titolo: "Mancini post Verucchio vs Ronco", url: "https://www.youtube.com/watch?v=DoGscPuTn08" },
    { titolo: "Promozione  Verucchio vs Classe 0-2", url: "https://www.youtube.com/watch?v=xmNcKsZzDlI" },
    { titolo: "Promozione Romagna.  Verucchio vs Civitella 0-2", url: "https://www.youtube.com/watch?v=ySDpi4sB1_o" },
    ],
  },
  {
    slug: "victoria-1968",
    nome: "A.S.D. Victoria 1968",
    totale: 11, /* +3 il 17/10/2026 */
    highlights: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Highlights | Prima Categoria Romagna | Girone H|  Verucchio vs Victoria 1-3", url: "https://www.youtube.com/watch?v=dy8TzznAdvM", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    { titolo: "Highlights | Prima Categoria | Girone H |  Victoria vs Junior Gambettola 2-2", url: "https://www.youtube.com/watch?v=ja7DB9gQw4w" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Highlights| Prima Categoria Romagna| Girone H| Victoria vs Bagno di Romagna 1-1", url: "https://www.youtube.com/watch?v=gMjzIBy9DAw", pubblicato: "2026-09-19", fonteData: "feed-ufficiale" },
    { titolo: "Highlights Prima Categoria.  Victoria vs Ronta 2-1", url: "https://www.youtube.com/watch?v=z8ruwgUTQcA" },
    ],
    interviste: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Post Interviste Verucchio vs Victoria  Fabbri e Girometti", url: "https://www.youtube.com/watch?v=RhTQBEognPg", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Interviste Victoria a Girometti e Trivulzio post Bagno di Romagna", url: "https://www.youtube.com/watch?v=P4VdX4wIcJ4", pubblicato: "2026-09-19", fonteData: "feed-ufficiale" },
    { titolo: "Intervista Vitiello post Sala vs Victoria", url: "https://www.youtube.com/watch?v=33cKt9DE_4E" },
    ],
    servizi: [
    { titolo: "Speciale A.S.D. Victoria 1968", url: "https://www.youtube.com/watch?v=zSi-RmNCCOw" },
    { titolo: "Calcio Prima Categoria  Victoria vs Bellaria Igea Marina 1956 0-0", url: "https://www.youtube.com/watch?v=rmojOPs5esQ" },
    { titolo: "Calcio Prima Categoria  Sala vs Victoria 1-2", url: "https://www.youtube.com/watch?v=ARyIpBURjmY" },
    { titolo: "Calcio Prima Categoria  Victoria vs Sala 2-1", url: "https://www.youtube.com/watch?v=OgqT4ieSa_k" },
    ],
  },
  {
    slug: "vis-novafeltria",
    nome: "Vis Novafeltria Calcio F.C.D.",
    totale: 237, /* +2 il 17/10/2026 */
    highlights: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Highlights | Eccellenza Girone | B |  Russi vs Novafeltria 0-0", url: "https://www.youtube.com/watch?v=TEpvkjzP-94", pubblicato: "2026-10-12", fonteData: "feed-ufficiale" },
    { titolo: "Highlights | Coppa Italia |  San Marino vs Vis Novafeltria 0-1", url: "https://www.youtube.com/watch?v=9fE9dzcxu7c" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Highlights| Eccellenza | Girone B |  Vis Novafeltria vs Massalombarda 3-1", url: "https://www.youtube.com/watch?v=hNSv7RDs_gk", pubblicato: "2026-09-27", fonteData: "feed-ufficiale" },
    { titolo: "Highlights|  Eccellenza Girone B|  Novafeltria  vs Valsanterno 1-1", url: "https://www.youtube.com/watch?v=Ms8pszdvChQ", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Highlights| Preliminari| Coppa Italia|  Novafeltria vs Savignanese 1-0", url: "https://www.youtube.com/watch?v=PewN6XVLlOE", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Highlights| Eccellenza| Girone B| Rimini vs Novafeltria 2-0", url: "https://www.youtube.com/watch?v=GjUD1KFsk0w", pubblicatoDa: "2026-09-02", pubblicatoA: "2026-09-09", fonteData: "forbice-canale" },
    { titolo: "Highlights | Eccellenza Romagna| Girone B| Vis Novafeltria vs Castenaso 3-1", url: "https://www.youtube.com/watch?v=BuDk9VM4RWI", pubblicatoDa: "2026-08-26", pubblicatoA: "2026-09-02", fonteData: "forbice-canale" },
    { titolo: "Highlights Eccellenza  Pietracuta vs Novafeltria 0-1", url: "https://www.youtube.com/watch?v=yZE0Vly41Fg" },
    { titolo: "Highlights Novafeltria vs Sampierana 1-2", url: "https://www.youtube.com/watch?v=8ORMSN3T2eg" },
    { titolo: "Eccellenza Romagna.Highlights Novafeltria vs Tropical Coriano 0-1", url: "https://www.youtube.com/watch?v=pXswZuf7qSY" },
    { titolo: "HIGHLIGHTS. Eccellenza Romagna. Novafeltria vs Gambettola 0-3", url: "https://www.youtube.com/watch?v=BzANkkfSDAA" },
    { titolo: "HIGHLIGHTS.  Eccellenza Romagna  Faenza vs Vis Novafeltria 1-1", url: "https://www.youtube.com/watch?v=IKkJAAVa7EQ" },
    { titolo: "HIGHLIGHTS ECCELLENZA ROMAGNA. F.Cava Ronco vs Novafeltria 2 -1", url: "https://www.youtube.com/watch?v=Q7T8aEll7Hk" },
    { titolo: "Romagna First Category Soccer. Play-Offs Novafeltria vs Vis Misano 0 - 1. Preface and Highlights", url: "https://www.youtube.com/watch?v=3EGR2oYPg6I" },
    ],
    interviste: [
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Interviste post  Valsanterno Mancini e Renzi", url: "https://www.youtube.com/watch?v=q7ltcuAtmUs", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Intervista Mancini post Novafeltria vs Castenaso", url: "https://www.youtube.com/watch?v=o01bpgIu0Hk", pubblicatoDa: "2026-08-26", pubblicatoA: "2026-09-02", fonteData: "forbice-canale" },
    { titolo: "Interviste Terenzi e Scardovi post Novafeltria", url: "https://www.youtube.com/watch?v=vFVvQcI1jYQ" },
    { titolo: "Intervista Screpis post Novafeltria", url: "https://www.youtube.com/watch?v=9BVbFxXZOSI" },
    { titolo: "Cava vs Novafeltria. Interviste postgara Muccioli e Costantini", url: "https://www.youtube.com/watch?v=92mQgLpm3Us" },
    { titolo: "Interviste dopogara Novafeltria vs Pietracuta Forti e Vittorio", url: "https://www.youtube.com/watch?v=8JBbT9WzrRU" },
    { titolo: "Interviste post Novafeltria vs Solarolo  Costantini e Assirelli", url: "https://www.youtube.com/watch?v=1s32mR1Wexg" },
    { titolo: "DM.Interviste Montanari e Costantini post Novafeltria vs Savignanese", url: "https://www.youtube.com/watch?v=TLhdtehZK6g" },
    { titolo: "Interviste post Novafeltria vs Tropical Coriano  Terenzi e Giorgi", url: "https://www.youtube.com/watch?v=7CTA7yecdpI" },
    { titolo: "Intervista dopogara Novafeltria vs Fratta Terme.  Giorgi", url: "https://www.youtube.com/watch?v=J-5jSo4XnHM" },
    ],
    servizi: [
    { titolo: "Amichevole Novafeltria vs Virtus Acquaviva 1-2", url: "https://www.youtube.com/watch?v=CNjiChzWJyc" },
    { titolo: "Festival Del Sole  Novafeltria parte B", url: "https://www.youtube.com/watch?v=X7Gp5VPOsnU" },
    { titolo: "FESTIVAL DEL SOLE NOVAFELTRIA PARTE A", url: "https://www.youtube.com/watch?v=9SyJCe52nX4" },
    { titolo: "Eccellenza Romagna.  Mezzolara vs Novafeltria 3-3", url: "https://www.youtube.com/watch?v=j4fm3ihVaBM" },
    { titolo: "Eccellenza Romagna.  Novafeltria vs Pietracuta 0-0", url: "https://www.youtube.com/watch?v=IjXdm3s5BPY" },
    { titolo: "Calcio Eccellenza  Novafeltria vs Solarolo 0-3", url: "https://www.youtube.com/watch?v=ChtjG7m_OrU" },
    { titolo: "Calcio Eccellenza  Play Out.   Novafeltria vs Masi Torello 4-1", url: "https://www.youtube.com/watch?v=drJxSB2AU1A" },
    { titolo: "Calcio Eccellenza  Granamica vs Novafeltria 0-3", url: "https://www.youtube.com/watch?v=ooY40xrQNRk" },
    ],
  },
  {
    slug: "pietracuta",
    nome: "U.S. Pietracuta A.S.D.",
    totale: 134, /* +1 il 17/10/2026 */
    highlights: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Highlights | Eccellenza Girone B |  Pietracuta vs Fratta Terme 1-1", url: "https://www.youtube.com/watch?v=h4Pqi2n4ung", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Highlights| Eccellenza Girone B | Pietracuta vs Imolese 2-2", url: "https://www.youtube.com/watch?v=OeqUVwjAlNU", pubblicato: "2026-09-27", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Eccellenza Romagna| Girone B|  Pietracuta vs Sanpaimola 1-2", url: "https://www.youtube.com/watch?v=9VPPAPN_nvQ", pubblicato: "2026-09-20", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Eccellenza Romagna | Girone B|  Pietracuta vs San Marino 0-0", url: "https://www.youtube.com/watch?v=vFzlsgXQKaw", pubblicatoDa: "2026-09-02", pubblicatoA: "2026-09-09", fonteData: "forbice-canale" },
    { titolo: "Highlights Eccellenza Romagna  Pietracuta vs Sanpaimola 3 -1", url: "https://www.youtube.com/watch?v=E01ftBKuDxA" },
    { titolo: "Highlights Eccellenza.  Pietracuta vs Massalombarda 2-1", url: "https://www.youtube.com/watch?v=EjO-fe76CY0" },
    { titolo: "Highlights Eccellenza  Pietracuta vs Novafeltria 0-1", url: "https://www.youtube.com/watch?v=yZE0Vly41Fg" },
    { titolo: "Highlights Eccellenza.  Pietracuta vs Solarolo 2-2", url: "https://www.youtube.com/watch?v=5vTgWQJ8PrU" },
    { titolo: "Highlights Pietracuta vs Tropical Coriano 0-0", url: "https://www.youtube.com/watch?v=yPoFpF0IJC0" },
    { titolo: "Eccellenza Romagna.  Highlights e Interviste Pietracuta vs Castenaso 1-1", url: "https://www.youtube.com/watch?v=bKyoUS2p_n4" },
    { titolo: "HIGHLIGHTS ECCELLENZA ROMAGNA.  Pietracuta vs F.Cava Ronco 1-0", url: "https://www.youtube.com/watch?v=tL_ky3LoDEs" },
    { titolo: "HIGHLIGHTS Eccellenza Pietracuta vs Mezzolara 0-0", url: "https://www.youtube.com/watch?v=k3UgS1dEY90" },
    ],
    interviste: [
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Intervista Fregnani post Sanpaimola", url: "https://www.youtube.com/watch?v=bkdzYScX6YY", pubblicato: "2026-09-20", fonteData: "feed-ufficiale" },
    { titolo: "Intervista Fregnani post San Marino", url: "https://www.youtube.com/watch?v=Ksoz0tw5Gbw", pubblicatoDa: "2026-09-02", pubblicatoA: "2026-09-09", fonteData: "forbice-canale" },
    { titolo: "Interviste post Pietracuta vs Sanpaimola", url: "https://www.youtube.com/watch?v=yqrSW8KqRgU" },
    { titolo: "Interviste post Pietracuta vs S Agostino", url: "https://www.youtube.com/watch?v=-W8F4TVsc2s" },
    { titolo: "Interviste post Pietracuta vs F.Cava Ronco", url: "https://www.youtube.com/watch?v=2UrwEPrbHaU" },
    { titolo: "Interviste dopogara Fregnani e Rizzo post Pietracuta vs Castenaso", url: "https://www.youtube.com/watch?v=DwDNx_XbPZc" },
    { titolo: "Interviste Biagi e Fregnani post Pietracuta vs S Agostino", url: "https://www.youtube.com/watch?v=Pnz-2QuF9RI" },
    { titolo: "Interviste dopogara Pietracuta vs Coriano", url: "https://www.youtube.com/watch?v=45pdiMTdmk0" },
    { titolo: "Eccellenza Romagna.  Highlights e Interviste Pietracuta vs Castenaso 1-1", url: "https://www.youtube.com/watch?v=bKyoUS2p_n4" },
    { titolo: "Interviste dopogara Novafeltria vs Pietracuta Forti e Vittorio", url: "https://www.youtube.com/watch?v=8JBbT9WzrRU" },
    ],
    servizi: [
    { titolo: "Calcio Eccellenza Romagna.  Pietracuta vs Faenza 1-1", url: "https://www.youtube.com/watch?v=ioYV81D_qT4" },
    { titolo: "Eccellenza Romagna.  Novafeltria vs Pietracuta 0-0", url: "https://www.youtube.com/watch?v=IjXdm3s5BPY" },
    { titolo: "Calcio Eccellenza  Pietracuta vs Russi 2-2", url: "https://www.youtube.com/watch?v=Eoge9ARDGHw" },
    { titolo: "Eccellenza Romagna  Pietracuta vs Medicina F.  3-1", url: "https://www.youtube.com/watch?v=Ab75-8ClJXE" },
    { titolo: "Eccellenza  Pietracuta vs Sampierana 2-0", url: "https://www.youtube.com/watch?v=Xetcx000kJ4" },
    { titolo: "Calcio Eccellenza Play Off.  Pietracuta vs Gambettola 2-0", url: "https://www.youtube.com/watch?v=xgjUDqR1d_8" },
    { titolo: "Calcio Eccellenza.  Pietracuta vs Masi Torello 1-1", url: "https://www.youtube.com/watch?v=WTwXGxcs4yw" },
    { titolo: "Calcio Eccellenza.  Pietracuta vs Diegaro 3-0", url: "https://www.youtube.com/watch?v=6-rHag8khJ8" },
    ],
  },
  {
    slug: "san-marino-calcio",
    nome: "A.C. San Marino Calcio",
    totale: 71, /* +4 il 17/10/2026 */
    highlights: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Highlights | Eccellenza Romagna |  Girone B |  San Marino vs Valsanterno 0-1", url: "https://www.youtube.com/watch?v=2HZd3jXJMgA", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    { titolo: "Highlights | Eccellenza Girone B |  Rimini vs San Marino 1-0", url: "https://www.youtube.com/watch?v=h3nMOxelr3g" },
    { titolo: "Highlights | Coppa Italia |  San Marino vs Vis Novafeltria 0-1", url: "https://www.youtube.com/watch?v=9fE9dzcxu7c" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026.
       «Pietracuta vs San Marino 0-0» è lo stesso video che compare anche sulla
       pagina del Pietracuta: una partita sola, due squadre nostre in campo. */
    { titolo: "Highlights| Eccellenza Romagna| Girone B | San Marino vs Castenaso 0-0", url: "https://www.youtube.com/watch?v=ib3krs7Tzvc", pubblicato: "2026-09-27", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Eccellenza Girone B|  San Marino vs Fratta Terme 0-1", url: "https://www.youtube.com/watch?v=wIJGwgWmqME", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Highlights| Eccellenza Romagna | Girone B|  Pietracuta vs San Marino 0-0", url: "https://www.youtube.com/watch?v=vFzlsgXQKaw", pubblicatoDa: "2026-09-02", pubblicatoA: "2026-09-09", fonteData: "forbice-canale" },
    { titolo: "Highlights| Eccellenza Romagna | Girone B|  San Marino vs Imolese 0-6", url: "https://www.youtube.com/watch?v=d6hdRlqZwKQ", pubblicatoDa: "2026-08-26", pubblicatoA: "2026-09-02", fonteData: "forbice-canale" },
    { titolo: "Highlights Serie D girone F San Marino vs Unipomezia 0-4", url: "https://www.youtube.com/watch?v=psDpqOm44PQ" },
    { titolo: "Highlights Teramo vs San Marino 4-1", url: "https://www.youtube.com/watch?v=YvELP81q-O8" },
    { titolo: "Highlights Serie D Girone F. San Marino vs Termoli 0-1", url: "https://www.youtube.com/watch?v=ouZPw5bkXuE" },
    { titolo: "Highlights Serie D -Girone D.  San Marino vs Progresso 0 -1", url: "https://www.youtube.com/watch?v=W8S3UaTw-iA" },
    { titolo: "Highlights serie D Girone D. Lentigione San Marino 1-1", url: "https://www.youtube.com/watch?v=olr7wpWg-MU" },
    { titolo: "Highlights Serie D Girone D. San Marino vs Cittadella Vis Modena 0-1", url: "https://www.youtube.com/watch?v=mtqydaASSQI" },
    { titolo: "Highlights Fiorenzuola vs San Marino 1-1", url: "https://www.youtube.com/watch?v=E-XpwxUHNL8" },
    { titolo: "Highlights Serie D Girone D.  San Marino vs Corticella 1-0", url: "https://www.youtube.com/watch?v=H4rnAHHJEss" },
    { titolo: "Highlights Serie D girone D  Zenith Prato vs   San Marino 0-2", url: "https://www.youtube.com/watch?v=kVS7CFB7o6c" },
    { titolo: "Highlights San Marino vs Tau Altopascio 0-5", url: "https://www.youtube.com/watch?v=enYE14546Jg" },
    { titolo: "Calcio Serie D.  Highlights San Marino vs U  Riccione 3-0", url: "https://www.youtube.com/watch?v=nmLPQua0h2Y" },
    { titolo: "Serie D Girone D.  Highlights Imolese vs San Marino 2-1", url: "https://www.youtube.com/watch?v=rLvV2XJlg9M" },
    ],
    interviste: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Intervista Michael Munari post Valsanterno", url: "https://www.youtube.com/watch?v=qQ3Ttk05Dy4", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Intervista Nunes e D'Agnelli post Castenaso", url: "https://www.youtube.com/watch?v=EK1dpgur6IY", pubblicato: "2026-09-27", fonteData: "feed-ufficiale" },
    { titolo: "Interviste post  San Marino vs Fratta Terme  Cestra e Malandri", url: "https://www.youtube.com/watch?v=J4IvQb1PDT8", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Interviste Antonioli e Lasagni post San Marino vs Imolese", url: "https://www.youtube.com/watch?v=LMAoiHcdtls", pubblicatoDa: "2026-08-26", pubblicatoA: "2026-09-02", fonteData: "forbice-canale" },
    { titolo: "Interviste Tosi e Ale post San Marino l'Aquila", url: "https://www.youtube.com/watch?v=qpl0FN2xzoM" },
    { titolo: "Interviste Ingenito e Fucili post San Marino Aquila", url: "https://www.youtube.com/watch?v=hu4m8qJRUU0" },
    { titolo: "Interviste Visconti, Malgrati e Fioravanti post San Marino vs Notaresco", url: "https://www.youtube.com/watch?v=3kU_gnQw5b8" },
    { titolo: "Interviste post San Marino vs Chieti a cura DM", url: "https://www.youtube.com/watch?v=okuA-Gdhvds" },
    { titolo: "Interviste post San Marino vs Atletico Ascoli", url: "https://www.youtube.com/watch?v=c2BrtI4d44A" },
    { titolo: "Interviste Malgrati e D'Adderio post San Marino vs Termoli", url: "https://www.youtube.com/watch?v=Ze4BtS3gTcI" },
    { titolo: "Interviste Colombo e Miramari post San Marino vs Forli", url: "https://www.youtube.com/watch?v=8TkwtahfzKA" },
    { titolo: "Interviste postgara  Amore e Biagioni San Marino vs Imolese", url: "https://www.youtube.com/watch?v=2FoCanVOBiA" },
    ],
    servizi: [
    { titolo: "Biagioni e Pasa post San Marino vs Forlì", url: "https://www.youtube.com/watch?v=OSdCvy0QkaA" },
    { titolo: "Biagioni e Marchionni post San Marino vs Ravenna", url: "https://www.youtube.com/watch?v=x5Lgik8-KgY" },
    { titolo: "Calcio Serie D  San Marino vs Prato 0-3", url: "https://www.youtube.com/watch?v=5pdRu6ukH2U" },
    { titolo: "Cascione post San Marino vs Lentigione", url: "https://www.youtube.com/watch?v=AIFqsjLB0q4" },
    { titolo: "Branduani e Cassani post San Marino vs Lentigione", url: "https://www.youtube.com/watch?v=mk6JVVDY-94" },
    { titolo: "Serie D Girone D.  San Marino vs Lentigione 1-3", url: "https://www.youtube.com/watch?v=guPH7dWOKaI" },
    { titolo: "Serie D Girone D .Vis Cittadella Modena vs San Marino 3-4", url: "https://www.youtube.com/watch?v=J5Ypxb_80QI" },
    { titolo: "Haruna post San Marino vs Fiorenzuola", url: "https://www.youtube.com/watch?v=Pi4OCHr9tSg" },
    ],
  },
  {
    slug: "tropical-coriano",
    nome: "A.S.D. Tropical Coriano",
    totale: 42, /* +3 il 17/10/2026 */
    highlights: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Highlights| Serie D| Girone D| Tropical Coriano vs Pontedera 1-2", url: "https://www.youtube.com/watch?v=mywlsCNNQ-M", pubblicato: "2026-10-14", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Serie D | Girone D | Tropical Coriano vs Crema 0-0", url: "https://www.youtube.com/watch?v=te5ryVd4R0c", pubblicato: "2026-10-11", fonteData: "feed-ufficiale" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Highlights| Serie D| Girone D| Oltrepò  VS Tropical Coriano 0-1", url: "https://www.youtube.com/watch?v=tm51MfMTWLg", pubblicato: "2026-09-22", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Serie D| Girone D| Tropical Coriano vs Lentigione 1-2", url: "https://www.youtube.com/watch?v=ceQegJVZJ58", pubblicato: "2026-09-17", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Serie D Girone D|  Cittadella Vis Modena vs Tropical Coriano 1-0", url: "https://www.youtube.com/watch?v=smDeCzMisgU", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Highlights| Serie D Girone D|  Tropical Coriano vs Varese 1-1", url: "https://www.youtube.com/watch?v=ikTIR52Sias", pubblicatoDa: "2026-09-02", pubblicatoA: "2026-09-09", fonteData: "forbice-canale" },
    { titolo: "Highlights Serie D Girone D.  Progresso vs T.Coriano 1-1", url: "https://www.youtube.com/watch?v=PVfkRtPX2y4" },
    { titolo: "Highlights Pietracuta vs Tropical Coriano 0-0", url: "https://www.youtube.com/watch?v=yPoFpF0IJC0" },
    { titolo: "Highlights Eccellenza Romagna.  Tropical Coriano vs Gambettola 1-0", url: "https://www.youtube.com/watch?v=6axGIlW1bmM" },
    { titolo: "Eccellenza Romagna.Highlights Novafeltria vs Tropical Coriano 0-1", url: "https://www.youtube.com/watch?v=pXswZuf7qSY" },
    ],
    interviste: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Interviste Di Maio, Giannini e Nastase post Coriano vs Pontedera", url: "https://www.youtube.com/watch?v=0aP9MnEA9SY", pubblicato: "2026-10-14", fonteData: "feed-ufficiale" },
    { titolo: "Interviste dopogara Coriano vs Mezzolara", url: "https://www.youtube.com/watch?v=RJiN8FkpSG0" },
    { titolo: "Interviste dopogara Pietracuta vs Coriano", url: "https://www.youtube.com/watch?v=45pdiMTdmk0" },
    { titolo: "Intervista Pasquale Vittorio post Coriano", url: "https://www.youtube.com/watch?v=PlcA4QLHLpU" },
    { titolo: "Interviste post Novafeltria vs Tropical Coriano  Terenzi e Giorgi", url: "https://www.youtube.com/watch?v=7CTA7yecdpI" },
    { titolo: "Interviste dopogara Pietracuta vs Tropical Coriano", url: "https://www.youtube.com/watch?v=gHlqHMHj33E" },
    ],
    servizi: [
    { titolo: "Calcio Eccellenza  Vis Novafeltria vs Tropical Coriano 0-1", url: "https://www.youtube.com/watch?v=eRENwFJP69k" },
    { titolo: "Calcio Eccellenza. Savignanese vs Tropical Coriano 2-1", url: "https://www.youtube.com/watch?v=VZ5P4AIK6lU" },
    { titolo: "Calcio Eccellenza.  Pietracuta vs Tropical Coriano 0-0", url: "https://www.youtube.com/watch?v=kb2Hle0ol5w" },
    { titolo: "Covid19. Da Rimini a Coriano ,  viaggio nella provincia di Rimini", url: "https://www.youtube.com/watch?v=3u9Ralbx8Vo" },
    { titolo: "Calcio Eccellenza Romagna Girone B.  Fya Riccione vs Tropical Coriano 2-0", url: "https://www.youtube.com/watch?v=wdZeaqPW7bQ" },
    { titolo: "Calcio Eccellenza Girone B.  Tropical Coriano vs Del Duca Ribelle 1-4", url: "https://www.youtube.com/watch?v=Ae_SlLx3Rpo" },
    { titolo: "Calcio Play Off Promozione Romagna Girone D.  Cervia vs Tropical Coriano 0-1", url: "https://www.youtube.com/watch?v=mK_VrPrNNic" },
    { titolo: "Calcio Promozione Romagna Girone D.  Vis Misano vs Tropical Coriano 0-0", url: "https://www.youtube.com/watch?v=1YBnz5SinRg" },
    ],
  },
  {
    slug: "gabicce-gradara",
    nome: "A.S.D. Gabicce Gradara",
    totale: 20,
    highlights: [],
    interviste: [
    { titolo: "Gabicce Gradara Calcio.  Intervista al DS Gabriele Magi.", url: "https://www.youtube.com/watch?v=tSgSdjj-k1U" },
    { titolo: "Gabicce Gradara Calcio.  Intervista al neo allenatore Mirco Papini.", url: "https://www.youtube.com/watch?v=qtt3iku7E64" },
    ],
    servizi: [
    /* Titolo riportato alla forma del canale il 30/09/2026: prima era qui la
       traduzione automatica in inglese fornita dall'elenco della scheda canale. */
    { titolo: "Presentazione Gabicce Gradara Calcio 26-27", url: "https://www.youtube.com/watch?v=yiHJTka_CvI" },
    { titolo: "2a Puntata Fase di Crescita.  Settore Giovanile Gabicce Gradara Calcio", url: "https://www.youtube.com/watch?v=KG7nq1TxjbQ" },
    { titolo: "Presentazione Gabicce Gradara Calcio 2019-2020", url: "https://www.youtube.com/watch?v=kP79JLVzh_Y" },
    { titolo: "Presentazione Gabicce Gradara Calcio 2019-2020", url: "https://www.youtube.com/watch?v=AkTpS435mm8" },
    { titolo: "Calcio Promozione Marche  Gabicce Gradara vs Loreto 3 - 1", url: "https://www.youtube.com/watch?v=ZqYxO1nd1Ks" },
    { titolo: "Fase di Crescita 3a Puntata.  Settore Giovanile Gabicce Gradara Calcio.", url: "https://www.youtube.com/watch?v=qEB9mcG1MLc" },
    { titolo: "Gabicce Gradara Calcio. Presentazione Celano, Tedesco, Vegliò, Bastianoni e VaieranI.", url: "https://www.youtube.com/watch?v=MUsvGJ_0h6A" },
    { titolo: "GABICCE VS MOIE VALLESINA 3-0", url: "https://www.youtube.com/watch?v=S3BaBpQTfKc" },
    ],
  },
  {
    slug: "bellaria-igea-marina",
    nome: "A.P.D. Bellaria Igea Marina 1956",
    totale: 130, /* +2 il 17/10/2026 */
    highlights: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Highlights| Promozione Romagna Girone D |  Stella vs Bellaria Igea Marina 2-2", url: "https://www.youtube.com/watch?v=s1g8R0u6RGo" },
    /* ATTIVITÀ RECENTI — dal 10/08/2026, caricate il 30/09/2026. */
    { titolo: "Highlights | Promozione Romagna | Girone D|  Bellaria Igea Marina 1956 vs Ronco Edelweiss 2-0", url: "https://www.youtube.com/watch?v=1Fi_jaZ8WLk", pubblicato: "2026-09-28", fonteData: "feed-ufficiale" },
    { titolo: "Highlights| Promozione Romagna|  Bellaria Igea Marina vs Roncofredddo 0-2", url: "https://www.youtube.com/watch?v=wIph_w41LvY", pubblicatoDa: "2026-09-09", pubblicatoA: "2026-09-16", fonteData: "forbice-canale" },
    { titolo: "Highlights Bellaria Igea Marina 1956 vs S.Bartolo 2-1", url: "https://www.youtube.com/watch?v=CdT16c4hMpU" },
    { titolo: "Highlights Prima Categoria.  Bellaria Igea Marina 1956 vs S  Ermete 1-1", url: "https://www.youtube.com/watch?v=j6gLCSqmpw4" },
    { titolo: "Highlights Prima Categoria.  Torconca vs Bellaria I.Marina 1956 1-0", url: "https://www.youtube.com/watch?v=SY9cRw3iG_M" },
    { titolo: "Highlights Prima Categoria. Bellaria Igea Marina vs Asar 2-1", url: "https://www.youtube.com/watch?v=z6Xcn7KiQ34" },
    { titolo: "Highlights Prima Categoria.  Bellaria I.Marina 1956 vs Granata 2-0", url: "https://www.youtube.com/watch?v=ti1Yesi6VgM" },
    { titolo: "HIGHLIGHTS Prima Categoria.  S.Ermete vs Bellaria Igea Marina 1956 0 -2", url: "https://www.youtube.com/watch?v=-uyc_FdP3_c" },
    { titolo: "Highlights Prima Categoria.  Bellaria I.Marina 1956 vs Ronta 3-1", url: "https://www.youtube.com/watch?v=4UNwTYqLuZs" },
    { titolo: "HIGHLIGHTS PRIMA CATEGORIA ROMAGNA  Bellaria Igea Marina 1956 vs Roncofreddo 2-3", url: "https://www.youtube.com/watch?v=P6oD0nAYFsY" },
    { titolo: "HIGHLIGHTS. Prima Categoria.  Bellaria Igea Marina 1956 vs Gatteo 4-2", url: "https://www.youtube.com/watch?v=vK6t3kUKq_E" },
    { titolo: "HIGHLIGHTS Bellaria Igea Marina vs Morciano 1-0", url: "https://www.youtube.com/watch?v=QXFKMvcVDoE" },
    ],
    interviste: [
    /* ATTIVITÀ RECENTI — dal 30/09/2026, caricate il 17/10/2026. */
    { titolo: "Intervista Lorenzini post Stella", url: "https://www.youtube.com/watch?v=XdVoNTbpMDQ" },
    { titolo: "Interviste post  Bellaria vs S  Ermete D'Agostino e Falchero", url: "https://www.youtube.com/watch?v=dKzTph8emlQ" },
    { titolo: "Interviste Bellaria post Roncofreddo", url: "https://www.youtube.com/watch?v=LXFcY7iSzQA" },
    { titolo: "Intervista D'Agostino post Bellaria I .M  vs R .S .Clemente", url: "https://www.youtube.com/watch?v=BE4dBVVXPIQ" },
    { titolo: "Intervista D'Agostino post  Bellaria  Igea  Marina vs Bagno di Romagna", url: "https://www.youtube.com/watch?v=ywwD_LT6TS0" },
    { titolo: "Bellaria  Interviste Zanotti, D'Agostino e Righini", url: "https://www.youtube.com/watch?v=i8UmTPkkd9E" },
    { titolo: "DM  Intervista Vitiello post Sala vs Bellaria", url: "https://www.youtube.com/watch?v=68kAbYy37U4" },
    { titolo: "Interviste dopogara Rimini-Bellaria", url: "https://www.youtube.com/watch?v=dguk0grdPE8" },
    ],
    servizi: [
    { titolo: "Alla scoperta del bellaria Igea Marina 1956", url: "https://www.youtube.com/watch?v=4iYrpfuYNFY" },
    { titolo: "Bellaria I.Marina 1956:  scatta la nuova stagione", url: "https://www.youtube.com/watch?v=Fw62r1-qlfI" },
    { titolo: "Calcio Prima Categoria.  Bellaria Igea Marina vs Due Emme 2 -1", url: "https://www.youtube.com/watch?v=llLAlWVQi7U" },
    { titolo: "Calcio Prima Categoria  Victoria vs Bellaria Igea Marina 1956 0-0", url: "https://www.youtube.com/watch?v=rmojOPs5esQ" },
    { titolo: "D'AGOSTINO post Bellaria vs Morciano", url: "https://www.youtube.com/watch?v=Ryy3Sn1r3hg" },
    { titolo: "Prima Categoria.  Bellaria Igea Marina 1956 vs Real San Clemente 2-2", url: "https://www.youtube.com/watch?v=n-Rn6LCfn3I" },
    { titolo: "Calcio Prima Categoria.  Bellaria Igea Marina 1956 vs Torconca 1-1", url: "https://www.youtube.com/watch?v=hHSvgVlJhyE" },
    { titolo: "Calcio Prima Categoria. Bellaria Igea Marina 1956 vs Bagno di Romagna 3-1", url: "https://www.youtube.com/watch?v=L_bvIh7t_xY" },
    ],
  },
];

export function videoDm(slug: string) {
  return DM_VIDEO_SQUADRE.find((v) => v.slug === slug) ?? null;
}

/** Totale dei video DM abbinati automaticamente alle società seguite. */
export const DM_VIDEO_TOTALE = DM_VIDEO_SQUADRE.reduce((n, v) => n + v.totale, 0);

export const DM_VIDEO_NOTA =
  "Video abbinati automaticamente confrontando il nome della società con i titoli pubblicati sul canale " +
  "ufficiale Daniele Manuelli Official (elenco completo estratto il 29/08/2026). Titoli e URL sono quelli " +
  "originali del canale: la stagione compare solo dove è Daniele Manuelli a dichiararla nel titolo.";
