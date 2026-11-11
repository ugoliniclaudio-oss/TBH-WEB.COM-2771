import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ImagePlus, MapPin, Search, Upload, ExternalLink } from "lucide-react";
import { useAnagrafica } from "../queries/anagrafica";
import { useCompanies, useProducts } from "../queries/catalog";
import { useMediaElenco } from "../queries/media";
import {
  SbloccoAllestimento,
  ModuloCaricamento,
  AnteprimaMedia,
  useCodiceAllestimento,
  type TipoMedia,
} from "../components/media-slot";
import { ListaAllestimento, type VoceAllestimento } from "../components/lista-allestimento";
import { type TipoVisuale } from "../components/immagine-tbh";
import {
  ELENA_DI_CUORI,
  ELENA_DI_CUORI_PRODOTTI,
  slotProdottoEsterno,
} from "../lib/esterni";
import { SPIEGA_ACQUISTO, etichettaAcquisto } from "../components/acquisto-esterno";

/**
 * PANNELLO DI ALLESTIMENTO — ordine di Claudio (03/09/2026):
 * «dove ci sono gli spazi per immagini e loghi dai a me la possibilità di caricare, così faccio
 *  prima ad allestire il sito con immagini loghi indirizzi link di Google Map eccetera».
 *
 * Da qui si carica tutto in un posto solo: si scegle lo spazio (società, attività, scheda,
 * prodotto, oppure uno spazio scritto a mano) e si caricano logo, immagini, slide, indirizzo
 * e link Google Maps. Quello che carica si vede subito nella pagina corrispondente.
 */

/**
 * La voce è la stessa della lista di lavoro (components/lista-allestimento.tsx): una sola
 * forma per tutto il pannello, così la lista con i filtri e l'elenco a sinistra parlano
 * degli stessi spazi e non nascono due anagrafiche di spazi da tenere allineate.
 */
type Voce = VoceAllestimento;

/**
 * Il modulo di caricamento conosce quattro tipi (logo/immagine/slide/documento); i tipi
 * visuali sono più fini (prodotto, locandina, copertina, servizio…) perché servono a
 * decidere l'inquadratura e la scritta di attesa. Qui si traduce, senza perdere nulla.
 */
function perCaricamento(t: TipoVisuale): TipoMedia {
  if (t === "logo" || t === "slide" || t === "documento") return t;
  return "immagine";
}

/** Spazi «incolla e si vede subito» montati nelle pagine con il componente SlotContenuti. */
const SPAZI_LIBERI: { slot: string; nome: string; dove: string }[] = [
  { slot: "home:pulsanti", nome: "Prima pagina — in evidenza", dove: "/" },
  { slot: "social:pulsanti", nome: "Touch Social — profili e link aggiunti a mano", dove: "/contatti-social" },
  { slot: "shop:pulsanti", nome: "Negozio — vetrine e link", dove: "/shop" },
  { slot: "pagine:pulsanti", nome: "Pagine TBH — pagine aggiunte a mano", dove: "/tbh/pagine" },
  {
    slot: "influencity:copertina: / :pagine: / :inserto-sport:",
    nome: "Magazine — copertine e pagine, numero per numero (gli spazi stanno dentro la scheda di ogni numero)",
    dove: "/influencity",
  },
];

export default function AllestimentoPage() {
  const { codice } = useCodiceAllestimento();
  const societa = useCompanies();
  const schede = useAnagrafica();
  const prodotti = useProducts();
  const caricati = useMediaElenco();

  const [cerca, setCerca] = useState("");
  const [scelto, setScelto] = useState<Voce | null>(null);
  const [slotLibero, setSlotLibero] = useState("");

  const voci = useMemo<Voce[]>(() => {
    const out: Voce[] = [];
    // Le società arrivano da catalog.companies: hanno `code` (TBH-001…), non uno slug.
    // I campi in più (categoria, link, marchio, descrizione, checkout) servono alla lista
    // di lavoro per dire che cosa manca DAVVERO: un campo che questi dati non prevedono
    // resta `undefined`, così quel criterio non viene nemmeno contato (nessun falso difetto).
    for (const c of societa.data?.societa ?? [])
      out.push({
        slot: `societa:${c.code}`,
        nome: `${c.name} — ${c.code}`,
        gruppo: "Società del gruppo",
        tipo: "logo",
        categoria: c.sector,
        pagina: "/tbh/societa",
        link: c.site,
        haMarchio: true,
        immagineEsistente: c.logo,
      });
    for (const c of societa.data?.attivita ?? [])
      out.push({
        slot: `attivita:${c.code}`,
        nome: `${c.name} — ${c.code}`,
        gruppo: "Attività del gruppo",
        tipo: "logo",
        categoria: c.sector,
        pagina: "/tbh/societa",
        link: c.site,
        haMarchio: true,
        immagineEsistente: c.logo,
      });
    for (const s of schede.data?.schede ?? [])
      out.push({
        slot: `master:${s.slug}`,
        nome: s.nome,
        gruppo: "Schede master (sponsor, partner, luoghi)",
        tipo: "logo",
        categoria: s.categoria,
        pagina: `/master/${s.slug}`,
        link: s.sito,
        haMarchio: true,
        immagineEsistente: s.logo,
      });
    for (const p of prodotti.data?.items ?? [])
      out.push({
        slot: `prodotto:${p.slug}`,
        nome: p.title,
        gruppo: "Prodotti e servizi del negozio",
        // Un prodotto vuole la FOTO del prodotto, non un logo: è la correzione chiesta da
        // Claudio il 29/09/2026 (kit beauty, corsi, stand e DJ set non hanno un marchio).
        tipo: p.category === "Servizi" ? "servizio" : "prodotto",
        categoria: p.category,
        pagina: `/shop/p/${p.slug}`,
        descrizione: p.blurb,
        // La chiave dei link di pagamento è lo slug: la stessa che passa pages/prodotto.tsx
        // al blocco CheckoutSlots (`chiave={p.slug}`).
        checkoutChiave: p.slug,
        // Il pagamento già attivo nei dati del sito (per esempio il Payment Link Stripe della
        // TBH Fidelity Consumer): la lista di lavoro non deve chiedere un checkout a chi ce
        // l'ha già pubblico. Si legge nello stesso ordine in cui la scheda mostra il pulsante.
        checkoutUfficiale:
          p.checkout?.stripe ??
          p.checkout?.revolut ??
          p.checkout?.paypal ??
          p.checkout?.jatapay ??
          p.checkout?.johix ??
          null,
        haMarchio: false,
        immagineEsistente: p.image,
      });
    // Prodotti di marchi esterni presentati in Fashion (Elena Di Cuori): nome, prezzo,
    // categoria e indirizzo ufficiale del venditore sono già verificati sul suo listino;
    // manca solo la foto, ed è esattamente la voce che Claudio ha chiesto di allestire per
    // prima. Non hanno il nostro checkout — si compra sul sito del venditore — quindi quel
    // criterio non viene chiesto e non conta come difetto.
    for (const p of ELENA_DI_CUORI_PRODOTTI)
      out.push({
        slot: slotProdottoEsterno(p.url),
        nome: `${p.nome} — ${ELENA_DI_CUORI.nome}`,
        gruppo: "Fashion · prodotti di marchi esterni",
        tipo: "prodotto",
        categoria: p.categoria,
        pagina: "/shop",
        link: p.url,
        haMarchio: false,
        venditore: p.venditore,
        tipoAcquisto: p.tipoAcquisto,
        // Il checkout si chiede SOLO a chi ha dichiarato di passare dal nostro (punto l):
        // per «Sito del venditore» e «WhatsApp» quel criterio non esiste e non si conta.
        checkoutChiave:
          p.tipoAcquisto === "checkout-tbh" ? slotProdottoEsterno(p.url) : undefined,
      });
    return out;
  }, [societa.data, schede.data, prodotti.data]);

  const conteggio = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of caricati.data?.items ?? []) m.set(i.slot, (m.get(i.slot) ?? 0) + 1);
    return m;
  }, [caricati.data]);

  const filtrate = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    const base = q
      ? voci.filter((v) => v.nome.toLowerCase().includes(q) || v.slot.toLowerCase().includes(q))
      : voci;
    const gruppi = new Map<string, Voce[]>();
    for (const v of base) gruppi.set(v.gruppo, [...(gruppi.get(v.gruppo) ?? []), v]);
    return [...gruppi.entries()];
  }, [voci, cerca]);

  const attivo: Voce | null =
    scelto ??
    (slotLibero.trim()
      ? {
          slot: slotLibero.trim(),
          nome: slotLibero.trim(),
          gruppo: "Spazio scritto a mano",
          tipo: "immagine" as TipoVisuale,
        }
      : null);

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Pannello riservato · caricamento materiali
        </p>
        <h1 className="tbh-display tbh-h1">Allestimento del sito</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Da qui si caricano loghi, immagini, slide, indirizzi e link Google Maps su ogni spazio del
          portale. Il file va nell'archivio del sito: appena caricato lo vedono tutti i visitatori,
          nella pagina corrispondente. Niente contenuti inventati: gli spazi vuoti restano vuoti.
        </p>
      </header>

      {/* LISTA DI LAVORO — ordine di Claudio del 29/09/2026 (Priorità 2bis):
          filtri SENZA IMMAGINE · SENZA LOGO · SENZA LINK · SENZA CHECKOUT ·
          SENZA DESCRIZIONE · INCOMPLETI, e per ogni riga
          ANTEPRIMA | TITOLO | CATEGORIA | STATO | MODIFICA → [ALLESTISCI].
          Non è un secondo pannello: ALLESTISCI sceglie la voce nel modulo di
          caricamento che c'è già, qui sotto. */}
      <section className="mb-10">
        <ListaAllestimento
          voci={voci}
          materiali={caricati.data?.items ?? []}
          onAllestisci={(v) => {
            setScelto(v);
            setSlotLibero("");
            setCerca("");
            document.getElementById("carica-qui")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </section>

      {/* TBH CONTENT HUB — pre-allestimento: un contenuto si carica una volta e si riusa ovunque. */}
      <Link
        href="/allestimento/hub"
        className="tbh-card block p-6 mb-8 border-[var(--tbh-neon)]/50 hover:border-[var(--tbh-neon)]"
      >
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Pre-allestimento
        </p>
        <p className="tbh-h3 font-bold">TBH CONTENT HUB → + NUOVO CONTENUTO</p>
        <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-3xl">
          URL, siti, loghi, foto, video, documenti e pulsanti esterni in una scheda sola. Si carica
          una volta e diventa un record canonico per Home, Canale e Vetrina. Niente pubblicazione
          automatica: nasce in bozza, si controlla, poi lo pubblichi tu.
        </p>
        <span className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--tbh-neon)] uppercase tracking-wide">
          Apri il Content Hub <ExternalLink size={15} />
        </span>
      </Link>

      {/* SEZIONI AMMINISTRABILI — l'ingresso ai contenuti di tutte le sezioni del sito. */}
      <Link
        href="/allestimento/sezioni"
        className="tbh-card block p-6 mb-8 border-[var(--tbh-neon)]/50 hover:border-[var(--tbh-neon)]"
      >
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Contenuti del sito
        </p>
        <p className="tbh-h3 font-bold">SEZIONI AMMINISTRABILI → SCEGLI LA SEZIONE</p>
        <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-3xl">
          Magazine, Touch Miss Cool, Lavoro, DM Sport, J.C. Hugò, Eventi, Fiere, Territorio,
          Academy, Produzioni, Download: entri, scegli la sezione, aggiungi il contenuto, carichi
          le foto, scrivi le informazioni, guardi l&apos;anteprima e pubblichi. Per cominciare
          basta il titolo — ogni contenuto nasce in bozza e diventa pubblico solo quando lo
          pubblichi tu. Niente più pagine modificabili soltanto dal codice.
        </p>
        <span className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--tbh-neon)] uppercase tracking-wide">
          Apri le sezioni amministrabili <ExternalLink size={15} />
        </span>
      </Link>

      {/* LIBRERIA MEDIA TBH — archivio unico delle immagini, riusabile da ogni sezione. */}
      <Link
        href="/allestimento/media"
        className="tbh-card block p-6 mb-8 border-[var(--tbh-neon)]/50 hover:border-[var(--tbh-neon)]"
      >
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Media Manager
        </p>
        <p className="tbh-h3 font-bold">LIBRERIA MEDIA TBH → IMMAGINI E DOCUMENTI</p>
        <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-3xl">
          Tutte le foto, i loghi e i documenti caricati sul portale, in un posto solo: si cercano
          per categoria e stato, si sostituiscono, si mettono in bozza o si pubblicano. Un&apos;immagine
          già qui non va ricaricata: dal campo di ogni scheda si riusa con «Scegli dalla libreria».
          Prima di eliminare un file usato in un&apos;altra pagina arriva l&apos;avviso.
        </p>
        <span className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--tbh-neon)] uppercase tracking-wide">
          Apri la libreria media <ExternalLink size={15} />
        </span>
      </Link>

      {/* GESTIONE MONITOR — contenuto temporaneo degli spazi ancora liberi. */}
      <Link
        href="/allestimento/monitor"
        className="tbh-card block p-6 mb-8 border-[var(--tbh-neon)]/50 hover:border-[var(--tbh-neon)]"
      >
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Monitor
        </p>
        <p className="tbh-h3 font-bold">GESTIONE MONITOR → CAMPAGNE TEMPORANEE</p>
        <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-3xl">
          Che cosa va in onda nei monitor ancora liberi: pubblicità, promo TBH o partner del
          canale, con video o immagine, date di pubblicazione e scadenza, priorità, dispositivo e
          conteggio reale di viste e click. Quando arriva il contenuto ufficiale la campagna non si
          cancella: scende sotto i tre monitor e continua a girare.
        </p>
        <span className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--tbh-neon)] uppercase tracking-wide">
          Apri la gestione monitor <ExternalLink size={15} />
        </span>
      </Link>

      {/* SCANSIONE DEL SITO — elenco amministrativo dei difetti (17/09/2026, punto 8). */}
      <Link
        href="/allestimento/scansione"
        className="tbh-card block p-6 mb-8 border-[var(--tbh-neon)]/50 hover:border-[var(--tbh-neon)]"
      >
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Controllo del sito
        </p>
        <p className="tbh-h3 font-bold">SCANSIONE DEL SITO → ELENCO DEI DIFETTI</p>
        <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-3xl">
          La lista di lavoro, aggiornata a ogni apertura: loghi mancanti, loghi presenti in una
          pagina e non in un&apos;altra, stesso file su marchi diversi, file non trovati, loghi
          troppo piccoli per i riquadri grandi, monitor senza video, entità scritte in più modi.
          Ogni riga dice che cosa manca, in quale anagrafica e che cosa fare.
        </p>
        <span className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--tbh-neon)] uppercase tracking-wide">
          Apri la scansione <ExternalLink size={15} />
        </span>
      </Link>

      {/* GLI ALTRI PANNELLI — 28/09/2026, audit architettura (BLOCCO 1).
          Esistevano già, ma si aprivano solo scrivendo l'indirizzo a mano: nessuno dei
          dieci pannelli portava agli altri. Nessun pannello nuovo, nessun secondo
          sistema: qui c'è solo la porta d'ingresso a quelli che ci sono, con scritto
          che cosa fa ciascuno. Così l'allestimento ha un solo punto di partenza. */}
      <section className="mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-3">
          Gli altri pannelli riservati
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              to: "/allestimento/prodotti",
              titolo: "PRODOTTI E GADGET",
              cosa: "Schede prodotto, foto, prezzi e disponibilità del Touch Plaza Shop.",
            },
            {
              to: "/allestimento/stripe",
              titolo: "STRIPE → TOUCH PLAZA",
              cosa: "Account Stripe collegati, prodotti sincronizzati, «Da completare», errori e «Sincronizza ora».",
            },
            {
              to: "/allestimento/miss-cool",
              titolo: "CANDIDATURE TOUCH MISS COOL",
              cosa: "Le domande arrivate dal modulo pubblico: verifica 18+, documenti, consensi, approvazione e pubblicazione. Non crea candidature.",
            },
            {
              to: "/allestimento/tv-streaming-adv",
              titolo: "TV, STREAMING E ADV",
              cosa: "Palinsesto dei canali, dirette e spazi pubblicitari.",
            },
            {
              to: "/allestimento/canali-touch",
              titolo: "CANALI TOUCH RADIO / TOUCH TV",
              cosa: "Palinsesto condiviso o palinsesti separati, calendario di ciascun canale, statistiche e spot per canale.",
            },
            {
              to: "/allestimento/contenuti-palinsesto",
              titolo: "GESTIONE CONTENUTI E PALINSESTO",
              cosa: "Senza codice: URL video, immagine o file caricato → anteprima → bozza o pubblica. Collocazione su Home, Channel, carosello o playlist, con date, ripetizioni e ordine. Home 2.0 / 3.0 e altre, Channel e pagine nuovi, copie di sicurezza.",
            },
            {
              to: "/allestimento/channel",
              titolo: "PALINSESTI DEI 27 CHANNEL",
              cosa: "Archivio e playlist di ogni Channel: fonti verificate, ordine, durata, frequenza, spot interni, modalità e fasce orarie.",
            },
            {
              to: "/allestimento/canali-tematici",
              titolo: "CANALI TEMATICI",
              cosa: "TOUCH MUSIC, TOUCH INFLUENCITY MAGAZINE, ARM WRESTLING: cataloghi, URL singoli o in elenco, verifica, approvazione, stati del canale ed errori del player.",
            },
            {
              to: "/allestimento/touch-social",
              titolo: "TOUCH SOCIAL",
              cosa: "I profili social ufficiali della pagina /contatti-social: aggiungi, modifica, nascondi, importa elenchi di URL, dati pubblici, controllo dei link, ordine, evidenze e campagne, collegamenti a Channel e pagine, statistiche dei clic.",
            },
            {
              to: "/allestimento/touch-talent",
              titolo: "TOUCH TALENT & PROFESSIONALS",
              cosa: "Monitor 9:16: aggiungi monitor → incolla URL → verifica → attiva. Protagonista, categorie, emergenti, priorità, palinsesto H24 ed errori del player.",
            },
            {
              to: "/allestimento/capitan-touch",
              titolo: "CAPITAN TOUCH",
              cosa: "Il gioco: domande, risposte e premi.",
            },
            // 29/09/2026 — i due pannelli della musica esistevano ma si aprivano solo
            // scrivendo l'indirizzo a mano: qui c'è la porta d'ingresso, nient'altro.
            {
              to: "/allestimento/musica",
              titolo: "MUSICA — CATALOGO J.C. HUGÒ",
              cosa: "Il catalogo dei brani: importazione degli indirizzi (Suno, YouTube, YouTube Music, file audio) con controllo duplicati, sorgenti e versioni sullo stesso brano, copertine, schede da verificare, videoclip e Road to 2030. Un brano si pubblica con il suo audio reale, senza aspettare il videoclip.",
            },
            {
              to: "/allestimento/casting",
              titolo: "CASTING VIDEOCLIP",
              cosa: "I casting per i videoclip e le candidature arrivate: ruoli, fasi di lavorazione, selezione del cast e della crew.",
            },
            {
              to: "/allestimento/candidature-lavoro",
              titolo: "CANDIDATURE LAVORO (MODULO ONLINE)",
              cosa: "Le candidature arrivate dal modulo online degli annunci: Casting Inviate, Videomaker, Assistente di produzione. Dati, CV e file allegati, stato e note interne.",
            },
          ].map((p) => (
            <Link
              key={p.to}
              href={p.to}
              className="tbh-card block p-4 hover:border-[var(--tbh-neon)]"
            >
              <p className="text-sm font-bold">{p.titolo}</p>
              <p className="text-[13px] text-[var(--tbh-muted)] mt-1">{p.cosa}</p>
              <span className="inline-flex items-center gap-2 mt-3 text-xs text-[var(--tbh-neon)] uppercase tracking-wide">
                Apri <ExternalLink size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-8">
        <SbloccoAllestimento />
      </div>

      {/* Spazi liberi «incolla e si vede subito»: pulsanti, loghi e foto direttamente in pagina. */}
      <div className="tbh-card p-6 mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Nuovo · pulsanti, loghi e foto da aggiungere in pagina
        </p>
        <h2 className="tbh-display tbh-h2">Aggiungi un contenuto direttamente dalla pagina</h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-2">
          In queste pagine, una volta sbloccato il codice, compare il pulsante «Aggiungi qui»: si
          incolla il titolo per esteso, il link del logo o della foto e il link di destinazione,
          l'anteprima si vede prima di salvare e il contenuto compare subito. Vale anche per le
          pagine interne del portale, per esempio <code>/shop</code>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SPAZI_LIBERI.map((s) => (
            <Link
              key={s.slot}
              to={s.dove}
              className="rounded-xl border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] p-4 block"
            >
              <span className="block text-sm font-semibold">{s.nome}</span>
              <span className="block text-[11px] text-[var(--tbh-muted)] mt-1">{s.slot}</span>
              <span className="block text-[11px] text-[var(--tbh-neon)] mt-2">
                Apri la pagina →
              </span>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-[var(--tbh-muted)] mt-4">
          I contenuti si salvano nell'archivio del portale: li vedono tutti i visitatori, non solo
          questo dispositivo. La pubblicazione sul dominio resta un passaggio tuo dal pannello.
        </p>
      </div>

      <div id="carica-qui" className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Colonna 1 — scelta dello spazio */}
        <div>
          <div className="tbh-card p-5">
            <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
              Cerca lo spazio da allestire
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/50 border border-white/15 px-3">
              <Search size={16} className="text-[var(--tbh-muted)]" />
              <input
                aria-label="Cerca lo spazio da allestire"
                value={cerca}
                onChange={(e) => setCerca(e.target.value)}
                placeholder="Nome società, attività, sponsor, prodotto…"
                className="grow bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <p className="text-[11px] text-[var(--tbh-muted)] mt-3">
              {voci.length} spazi disponibili. Il numero accanto al nome sono i materiali già
              caricati.
            </p>
          </div>

          <div className="tbh-card p-5 mt-5">
            <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
              Oppure scrivi uno spazio nuovo
            </span>
            <input
              aria-label="Scrivi uno spazio nuovo"
              value={slotLibero}
              onChange={(e) => {
                setSlotLibero(e.target.value);
                setScelto(null);
              }}
              placeholder="es. sponsor:hotel-zurigo"
              className="mt-2 w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
            />
            <p className="text-[11px] text-[var(--tbh-muted)] mt-2">
              Serve per gli spazi non ancora in elenco. Dimmi dove va mostrato e lo agganciamo alla
              pagina giusta.
            </p>
          </div>

          <div className="mt-6 max-h-[70vh] pr-1 tbh-scroll-y">
            {filtrate.map(([gruppo, lista]) => (
              <div key={gruppo} className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-gold)] mb-2">
                  {gruppo}
                </p>
                <ul className="space-y-1.5">
                  {lista.map((v) => {
                    const n = conteggio.get(v.slot) ?? 0;
                    const sel = attivo?.slot === v.slot;
                    return (
                      <li key={v.slot}>
                        <button
                          type="button"
                          onClick={() => {
                            setScelto(v);
                            setSlotLibero("");
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm flex items-center justify-between gap-3 ${
                            sel
                              ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                              : "border-white/10 text-white hover:border-white/30"
                          }`}
                        >
                          <span className="truncate">{v.nome}</span>
                          <span
                            className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              n > 0 ? "bg-[var(--tbh-neon)] text-black" : "bg-white/10 text-[var(--tbh-muted)]"
                            }`}
                          >
                            {n}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Colonna 2 — caricamento + materiali già caricati */}
        <div>
          {!attivo ? (
            <div className="tbh-card p-8 flex items-start gap-4">
              <ImagePlus className="text-[var(--tbh-neon)] shrink-0" size={28} />
              <div>
                <h2 className="tbh-display tbh-h2 mb-2">Scegli uno spazio a sinistra</h2>
                <p className="text-sm text-[var(--tbh-muted)] max-w-2xl">
                  Poi carichi il file e compili titolo per esteso, indirizzo e link Google Maps. Se
                  lasci vuoto il link della mappa lo costruisco io dall'indirizzo che scrivi.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
                    Stai allestendo
                  </p>
                  <h2 className="tbh-display tbh-h2">{attivo.nome}</h2>
                  <p className="text-xs text-[var(--tbh-muted)] mt-1">Spazio: {attivo.slot}</p>
                </div>
                {/* Prodotto di un venditore terzo: i quattro campi del punto l) della
                    Priorità 2bis si leggono qui, prima di caricare la foto. */}
                {attivo.venditore && (
                  <div className="text-xs text-[var(--tbh-muted)] leading-relaxed">
                    <p>
                      Venditore: <strong className="text-white">{attivo.venditore}</strong>
                    </p>
                    {attivo.tipoAcquisto && (
                      <p>
                        Tipo acquisto:{" "}
                        <strong className="text-white">
                          {etichettaAcquisto(attivo.tipoAcquisto)}
                        </strong>{" "}
                        — {SPIEGA_ACQUISTO[attivo.tipoAcquisto]}
                      </p>
                    )}
                    {attivo.link && (
                      <a
                        href={attivo.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 hover:text-white"
                      >
                        <ExternalLink size={12} /> Scheda ufficiale del prodotto
                      </a>
                    )}
                    <p className="mt-1 max-w-sm">
                      Di un prodotto non nostro si usa solo l&apos;immagine ufficiale del
                      venditore: si incolla il suo indirizzo nel campo URL qui sotto.
                    </p>
                  </div>
                )}
                {"pagina" in attivo && attivo.pagina && (
                  <Link
                    to={attivo.pagina}
                    className="px-4 py-2 text-xs rounded-full border border-white/20 inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
                  >
                    <ExternalLink size={14} /> Vedi la pagina
                  </Link>
                )}
              </div>

              {codice ? (
                <ModuloCaricamento slot={attivo.slot} tipoIniziale={perCaricamento(attivo.tipo)} />
              ) : (
                <SbloccoAllestimento />
              )}

              <div className="mt-8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-gold)] mb-3">
                  Già caricato su questo spazio
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(caricati.data?.items ?? [])
                    .filter((i) => i.slot === attivo.slot)
                    .map((i) => (
                      <a
                        key={i.id}
                        href={i.url}
                        target="_blank"
                        rel="noreferrer"
                        className="tbh-card p-3 block"
                      >
                        {/* CORREZIONE 29/09/2026: qui un PDF finiva dentro un <img>
                            e il riquadro restava bianco («immagine che non arriva»).
                            Ora decide AnteprimaMedia, l'unico posto in cui sta la
                            regola immagine/documento. */}
                        <AnteprimaMedia
                          item={i}
                          altezzaClasse="h-[130px]"
                          immagineClasse="max-h-[124px]"
                        />
                        <p className="text-sm font-semibold mt-3 truncate">{i.titolo ?? "—"}</p>
                        {i.indirizzo && (
                          <p className="text-[11px] text-[var(--tbh-muted)] mt-1 inline-flex items-start gap-1.5">
                            <MapPin size={12} className="mt-0.5 shrink-0" /> {i.indirizzo}
                          </p>
                        )}
                      </a>
                    ))}
                  {(caricati.data?.items ?? []).filter((i) => i.slot === attivo.slot).length ===
                    0 && (
                    <p className="text-sm text-[var(--tbh-muted)]">
                      Ancora niente su questo spazio.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <section className="mt-12">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-gold)] mb-3">
              Ultimi materiali caricati sul portale
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(caricati.data?.items ?? []).slice(0, 12).map((i) => (
                <div key={i.id} className="tbh-card p-3">
                  <AnteprimaMedia
                    item={i}
                    altezzaClasse="h-[110px]"
                    immagineClasse="max-h-[104px]"
                  />
                  <p className="text-xs text-[var(--tbh-muted)] mt-2 truncate">{i.slot}</p>
                </div>
              ))}
              {(caricati.data?.items ?? []).length === 0 && (
                <p className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2">
                  <Upload size={15} /> Nessun materiale caricato per ora.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
