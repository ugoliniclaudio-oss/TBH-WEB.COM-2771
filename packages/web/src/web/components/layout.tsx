import { useEffect, useState } from "react";
import { fermaTuttoAudio } from "../lib/audio-unico";
import { Link, useLocation } from "wouter";
import {
  MessageCircle,
  Mail,
  Phone,
  Search,
  ShoppingCart,
  ShoppingBag,
  UserRound,
  Tv,
  Menu,
  X,
} from "lucide-react";
import { ContatoreStriscia, useContatore } from "./contatore";
import { LOGO_TBH_ICONA } from "../lib/loghi-tbh";
import { CapitanTouch } from "./capitan-touch";
import { AREE, NOME_SITO } from "../lib/identita-tbh";
import { BarraZapping } from "./zapping";
import { canaleLogo, canaliOrdinati, percorsoCanale } from "../lib/palinsesto";

/**
 * MENU UNICO — 10 MONDI, ordine di Claudio del 29/08/2026:
 * «RIMETTI IN ORDINE IL MENÙ NON MI PIACE →
 *  HOME | TBH | SERVIZI | MEDIA | EVENTI | BUSINESS | SHOP | COMMUNITY | LAVORO | CONTATTI»
 *
 * Regole applicate:
 * - UNA sola sorgente (`MENU`): da qui nascono la barra desktop, la barra scorrevole
 *   mobile/tablet, l'elenco del footer e la mappa del sito.
 * - NESSUNA voce ripetuta in due mondi diversi: ogni destinazione sta in un solo mondo.
 * - NESSUNA destinazione persa: tutte le rotte del sito sono raggiungibili da qui.
 * - Il titolo di ogni mondo è cliccabile e porta alla sua pagina principale.
 */
type VoceMenu = { to: string; label: string };
type GruppoMenu = { label: string; to?: string; colore: string; mega?: boolean; items: VoceMenu[] };

const MENU: GruppoMenu[] = [
  // Le 16 voci definitive arrivano tutte da lib/identita-tbh.ts (mockup IMG_9031 del
  // 05/09/2026). Una sola sorgente: barra desktop, barra mobile, footer e mappa del sito.
  ...AREE.map((a) => ({
    label: a.label,
    to: a.to,
    colore: a.colore,
    mega: a.mega,
    items: a.items,
  })),
  // 28/09/2026 — MEGA-MENU «ALTRO ▾» RIMOSSO (audit doppioni, BLOCCO 1).
  // Su 20 voci, 18 erano la stessa destinazione già presente in uno dei mondi
  // (Reality Show, Influencity, Fashion, Heddy Video, Pride Village, Sanremo,
  // Radio & TV, 25 Livelli, Istituzioni, Academy, News, Giochi, Travels,
  // Anagrafica, App, Management, J.C. Hugò, videocall): lo stesso link due volte
  // nello stesso pannello, con due nomi diversi. Le due voci che NON stavano in
  // nessun mondo sono state spostate nel loro mondo, non cancellate:
  // «Servizi & Referral» sotto Lavoro e «Rimini · territorio» sotto Squadre.
  // Nessuna destinazione persa: /mappa-sito resta in fondo al pannello e nel footer.
];

/**
 * Stato attivo «vivo»: la voce resta evidenziata anche quando si è dentro una sua sotto-pagina
 * (es. /sport/squadre/verucchio tiene acceso «Sport»). Prima si accendeva solo con il path esatto.
 */
function attivo(path: string, to: string) {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(`${to}/`);
}

/**
 * FOOTER — ordine di Claudio del 28/09/2026: solo cinque collegamenti, niente
 * doppioni e niente caroselli. Tutto il resto si raggiunge da /mappa-sito.
 */
const FOOTER_LINK: VoceMenu[] = [
  { to: "/guida", label: "Canali" },
  { to: "/cerca", label: "Cerca" },
  { to: "/mappa-sito", label: "Mappa del sito" },
  { to: "/lavoro-casting", label: "Lavora con noi" },
  { to: "/contatti", label: "Contatti" },
];

const WA = "https://wa.me/393792088524";

export function Ticker() {
  /* Una voce con `to` diventa un link: l'annuncio in evidenza porta dritto in bacheca. */
  const items: { t: string; to?: string }[] = [
    {
      t: "CERCHIAMO 3 NUOVI COLLABORATORI — 2 COMMERCIALI · 1 VIDEOMAKER → CANDIDATI",
      to: "/lavoro-casting/bacheca#cerchiamo-3-collaboratori",
    },
    {
      t: "COMMERCIALE FISSAGGIO APPUNTAMENTI — SMART WORKING · PARTI DALLA ZONA 5 → CANDIDATI",
      to: "/lavoro-casting/bacheca#commerciale-fissaggio-appuntamenti",
    },
    {
      t: "ADDETTE COMMERCIALI B2B — PRESA APPUNTAMENTI · FISSO €1.500 × 14 + PROVVIGIONI → CANDIDATI",
      to: "/lavoro-casting/bacheca#addette-commerciali-b2b",
    },
    {
      t: "CERCASI 4 BALLERINE — ENTRA NELLA CREW DI J.C. HUGÒ · VIDEOCLIP → CANDIDATI",
      to: "/lavoro-casting/bacheca#casting-ballerine-jc-hugo",
    },
    {
      t: "CASTING INVIATE 2026–2027 — FINO A 14 POSIZIONI · UNA DATA O TUTTA LA STAGIONE → CANDIDATI",
      to: "/lavoro-casting/bacheca#casting-inviate-2026-2027",
    },
    {
      t: "RICERCA VIDEOMAKER SPORTIVO / EVENTI — INSERIMENTO IMMEDIATO · STAGIONE 2026/2027 → CANDIDATI",
      to: "/lavoro-casting/bacheca#ricerca-videomaker-2026-2027",
    },
    {
      t: "RICERCA ASSISTENTE DI PRODUZIONE — FIGURA STABILE · CANDIDATI → lavoro@tibihacca.com",
      to: "/lavoro-casting/bacheca#assistente-di-produzione",
    },
    {
      t: "HAI UN'ATTIVITÀ? DICCI COSA TI SERVE — PERSONE, SERVIZI E SUPPORTO PER LA TUA IMPRESA",
      to: "/servizi-imprese",
    },
    { t: "TOUCH PLAZA SHOP — il centro commerciale digitale" },
    { t: "KIT AGGREGAZIONE BUSINESS €1.525,00" },
    { t: "CORSI PROFESSIONALI €610 + esame €72 — rateizzabile" },
    { t: "STAND STREET FOOD da €122 a €6.100" },
    { t: "SQUADRE PARTNER: VERUCCHIO · VICTORIA 1968 · RIMINI FOOTBALL ACADEMY" },
    { t: "TOUCH PAY — You Pay To Cashback" },
  ];
  const row = [...items, ...items];
  return (
    <div className="border-y border-[var(--tbh-line)] bg-black/60 overflow-hidden py-2">
      <div className="tbh-marquee-track">
        {row.map((v, i) => (
          <span key={i} className="tbh-display text-sm md:text-base px-6 text-[var(--tbh-neon)]">
            {v.to ? (
              <a href={v.to} className="text-white underline decoration-[var(--tbh-neon)] underline-offset-4 hover:text-[var(--tbh-neon)]">
                {v.t}
              </a>
            ) : (
              v.t
            )}
            <span className="text-[var(--tbh-muted)] px-6">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Ordine 4 — ricerca globale: attività, servizi, aziende, notizie, programmi,
 *  squadre, prodotti, partner, città, eventi. Porta alla pagina /cerca. */
function RicercaGlobale({ compact = false }: { compact?: boolean }) {
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate(`/cerca?q=${encodeURIComponent(q.trim())}`);
      }}
      className={`flex items-center gap-2 rounded-full border border-[var(--tbh-line)] bg-white/5 px-4 py-2 ${
        compact ? "w-full" : "flex-1 max-w-[420px]"
      }`}
    >
      <Search size={17} className="text-[var(--tbh-neon)] shrink-0" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca attività, servizi, aziende, programmi, squadre, prodotti, città…"
        aria-label={`Ricerca globale ${NOME_SITO}`}
        className="bg-transparent outline-none text-sm w-full placeholder:text-[var(--tbh-muted)]"
      />
      <button type="submit" className="text-xs font-bold uppercase text-[var(--tbh-neon)] shrink-0">
        Cerca
      </button>
    </form>
  );
}

/**
 * HEADER UNICO — promosso in produzione il 15/09/2026 su ordine di Claudio
 * («nuova homepage, menù e struttura», «troppi doppioni e funzioni non richieste»).
 *
 * Prima c'erano TRE barre sovrapposte (fascia contatti + menu a tendina + barra scorrevole):
 * è il doppione che Claudio contestava. Ora c'è una riga sola —
 * «Logo TBH | Cerca | Contatti | CANALI | ☰» — uguale su tutto il sito.
 *
 * Nessuna destinazione persa: il pannello contiene i canali del palinsesto E tutte le voci
 * del menu unico (stessa sorgente `MENU`), più guida, mappa del sito e contatti.
 */
function HeaderCompatto({ path }: { path: string }) {
  const [aperto, setAperto] = useState(false);
  const [canali, setCanali] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/90 border-b border-[var(--tbh-line)]">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-2.5 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 shrink-0">
          <img
            src={LOGO_TBH_ICONA}
            alt="Touch Business Holding"
            width={40}
            height={40}
            className="w-9 h-9 md:w-10 md:h-10 rounded-lg object-contain shrink-0"
          />
          <span className="tbh-display text-lg md:text-xl truncate">{NOME_SITO}</span>
        </Link>

        <div className="hidden md:flex flex-1 min-w-0 justify-center">
          <RicercaGlobale />
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setCanali((v) => !v);
              setAperto(false);
            }}
            aria-expanded={canali}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border text-sm font-semibold ${
              canali
                ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                : "border-[var(--tbh-line)] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            <Tv size={16} /> <span className="hidden sm:inline">Canali</span>
          </button>
          <Link
            to="/contatti"
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${
              attivo(path, "/contatti")
                ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                : "border-[var(--tbh-line)] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            <Phone size={16} /> Contatti
          </Link>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            aria-label="Scrivi su WhatsApp +39 379 208 8524"
            className="grid place-items-center w-10 h-10 rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
          >
            <MessageCircle size={17} />
          </a>
          <button
            type="button"
            onClick={() => {
              setAperto((v) => !v);
              setCanali(false);
            }}
            aria-expanded={aperto}
            aria-label={aperto ? "Chiudi il menu" : "Apri il menu"}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-[var(--tbh-neon)] text-[var(--tbh-neon)] text-sm font-bold"
          >
            {aperto ? <X size={18} /> : <Menu size={18} />}
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </div>

      {/* Ricerca su smartphone: sotto la riga del logo, sempre a portata di pollice. */}
      <div className="mx-auto max-w-[1500px] px-4 pb-2.5 md:hidden">
        <RicercaGlobale compact />
      </div>

      {/* PANNELLO CANALI — il telecomando TBH. Ordine di Claudio del 28/09/2026:
          NESSUN numero a schermo e nessun conteggio «I X CANALI». Si vede il nome,
          la funzione e il marchio reale del canale quando esiste (altrimenti un
          semplice segno di colore, mai un logo finto). L'ordine è quello editoriale
          calcolato da `canaliOrdinati()`: priorità prima, poi ordine interno. */}
      {canali && (
        <div className="border-t border-[var(--tbh-line)] bg-black/95 max-h-[70vh] overflow-y-auto">
          <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
                  Regia TBH-WEB
                </p>
                <p className="tbh-display text-xl">I CANALI TBH</p>
              </div>
              <Link
                to="/guida"
                onClick={() => setCanali(false)}
                className="rounded-full border border-[var(--tbh-neon)] px-4 py-2 text-[10px] font-bold tracking-[0.12em] text-[var(--tbh-neon)]"
              >
                TUTTI I CANALI
              </Link>
            </div>
            <div
              className="mt-4 grid gap-2"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))" }}
            >
              {canaliOrdinati({ conHome: true }).map((c) => {
                const logo = canaleLogo(c);
                return (
                  <Link
                    key={`canale-${c.numero}`}
                    to={percorsoCanale(c.numero)}
                    onClick={() => setCanali(false)}
                    className="flex items-center gap-3 rounded-xl border bg-black/50 px-3 py-2 hover:-translate-y-0.5 transition"
                    style={{ borderColor: `${c.colore}55` }}
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={c.nome}
                        width={28}
                        height={28}
                        className="size-7 shrink-0 rounded-md object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="size-7 shrink-0 grid place-items-center rounded-md border"
                        style={{ borderColor: `${c.colore}66`, color: c.colore }}
                        aria-hidden
                      >
                        <Tv size={14} />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-bold">{c.nome}</span>
                      <span className="block truncate text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                        {c.categoria}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {aperto && (
        <div className="border-t border-[var(--tbh-line)] bg-black/95 max-h-[70vh] overflow-y-auto">
          <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-5">
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))" }}
            >
              {MENU.map((g) => (
                <div key={`compatto-${g.label}`} className="min-w-0">
                  <p
                    className="text-[10px] uppercase tracking-[0.25em] mb-2"
                    style={{ color: g.colore }}
                  >
                    {g.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    {g.to && (
                      <Link
                        to={g.to}
                        onClick={() => setAperto(false)}
                        className="text-sm font-bold text-[var(--tbh-neon)] hover:underline"
                      >
                        Vai a {g.label}
                      </Link>
                    )}
                    {/* 28/09/2026 (audit BLOCCO 1): dentro un mondo non si ripete la
                        pagina del mondo stesso. «Vai a …» qui sopra ci porta già:
                        prima comparivano due link allo stesso indirizzo, uno sotto
                        l'altro, con due nomi diversi. La voce non è cancellata dai
                        dati (resta in identita-tbh.ts e nella mappa del sito),
                        semplicemente non si stampa due volte nello stesso pannello. */}
                    {g.items
                      .filter((i) => i.to !== g.to)
                      .map((i) => (
                      <Link
                        key={`compatto-${g.label}-${i.to}-${i.label}`}
                        to={i.to}
                        onClick={() => setAperto(false)}
                        className={`text-sm font-semibold ${
                          attivo(path, i.to)
                            ? "text-[var(--tbh-neon)]"
                            : "text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]"
                        }`}
                      >
                        {i.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* AZIONI RAPIDE — non sono voci di menu: sono i comandi sempre a portata
                di pollice (su smartphone il pulsante Contatti dell'header è nascosto).
                Mappa del sito, Contatti e Shop compaiono qui per funzione, non come
                doppione della loro sezione: lo dichiariamo invece di nasconderlo. */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/mappa-sito"
                onClick={() => setAperto(false)}
                className="rounded-full border border-[var(--tbh-gold)] px-4 py-2 text-xs font-bold text-[var(--tbh-gold)]"
              >
                Mappa del sito
              </Link>
              <Link
                to="/contatti"
                onClick={() => setAperto(false)}
                className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold text-[var(--tbh-platinum)]"
              >
                Contatti
              </Link>
              <Link
                to="/shop"
                onClick={() => setAperto(false)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold text-[var(--tbh-platinum)]"
              >
                <ShoppingBag size={14} /> Touch Plaza Shop
              </Link>
              {/* Carrello e Area Utente non sono ancora attivi: portano a «Stiamo lavorando
                  per voi», mai a un finto checkout. Nessuna destinazione persa. */}
              <Link
                to="/in-allestimento"
                onClick={() => setAperto(false)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold text-[var(--tbh-platinum)]"
              >
                <ShoppingCart size={14} /> Carrello
              </Link>
              <Link
                to="/in-allestimento"
                onClick={() => setAperto(false)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold text-[var(--tbh-platinum)]"
              >
                <UserRound size={14} /> Area utente
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [path] = useLocation();
  // Contatore reale di presenze e interazioni: registra visite, pagine e clic veri.
  useContatore();
  // 15/09/2026: l'header unico è in produzione su tutto il sito (ordine di Claudio).
  // RULLO: /check-web è una pagina sola a schermo pieno. Niente ticker, niente footer,
  // niente barra zapping: Claudio ha bocciato la home «sviluppata nel footer» (06/09/2026).
  const rullo = path === "/check-web";
  // 28/10/2026: cambio di canale/pagina = stop al monitor che suona (nessun audio sovrapposto).
  useEffect(() => fermaTuttoAudio(), [path]);
  return (
    // Spazio in fondo per la barra zapping fissa (e il badge Runable): non coprono footer né contenuti.
    <div className={`min-h-screen bg-[var(--tbh-black)] ${rullo ? "" : "pb-[130px] sm:pb-[72px]"}`}>
      <HeaderCompatto path={path} />

      {!rullo && <Ticker />}
      <main>{children}</main>

      {/* ZAPPING — barra canale −/+ sempre disponibile (specifica MASTER del 05/09/2026).
          Sta in basso a SINISTRA per non coprire il badge Runable in basso a destra. */}
      {!rullo && <BarraZapping />}

      {/* FOOTER CORTO — ordine di Claudio del 30/08/2026: era troppo lungo in verticale.
          Ora: una fascia identità + contatti, e le sezioni in CAROSELLI SCORREVOLI ORIZZONTALI
          (si trascinano col dito, niente elenchi chilometrici). Nessun link perso. */}
      {!rullo && (
      <footer className="mt-20 border-t border-[var(--tbh-line)] bg-black">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={LOGO_TBH_ICONA}
              alt="Touch Business Holding"
              width={56}
              height={56}
              className="w-14 h-14 rounded-xl object-contain shrink-0"
            />
            <span>
              <span className="tbh-display text-xl block leading-none">{NOME_SITO}</span>
              <span className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">
                Touch Business Holding
              </span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ml-auto">
            <a className="flex items-center gap-2 hover:text-[var(--tbh-neon)]" href={WA} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> +39 379 208 8524
            </a>
            <a className="flex items-center gap-2 hover:text-[var(--tbh-neon)]" href="tel:+393271237328">
              <Phone size={16} /> Italia +39 327 123 7328
            </a>
            <a className="flex items-center gap-2 hover:text-[var(--tbh-neon)]" href="tel:+4915222123816">
              <Phone size={16} /> Estero +49 152 2212 3816
            </a>
            <a
              className="flex items-center gap-2 hover:text-[var(--tbh-neon)]"
              href="mailto:supporto@touch-business.com"
            >
              <Mail size={16} /> supporto@touch-business.com
            </a>
          </div>
        </div>

        {/* FOOTER ESSENZIALE — ordine di Claudio del 28/09/2026: via i tre caroselli
            (doppioni: «Lavora con noi» in due liste, «Contatti» in tre punti, «Tutte le
            sezioni» ripeteva il menu). Restano cinque collegamenti. L'elenco completo
            di ogni destinazione vive in /mappa-sito, che si costruisce da sola. */}
        <nav
          aria-label="Collegamenti principali del footer"
          className="border-t border-[var(--tbh-line)]/60"
        >
          <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-4 flex flex-wrap items-center gap-2">
            {FOOTER_LINK.map((v) => (
              <Link
                key={`footer-${v.to}`}
                to={v.to}
                className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
              >
                {v.label}
              </Link>
            ))}
            <Link
              to="/contatti-social"
              className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              Touch Social
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-[1500px] px-4 md:px-8 pb-6 flex flex-wrap items-center gap-3">
          <a
            href={`${WA}?text=${encodeURIComponent(
              "Buongiorno, vorrei iscrivermi alla newsletter TBH-WEB.",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex"
          >
            Iscrivimi alla newsletter via WhatsApp
          </a>
          <p className="text-[11px] text-[var(--tbh-muted)] max-w-2xl">
            Dati societari (ragione sociale, sede legale, P.IVA) pubblicati solo quando confermati da
            Touch Business Holding: non inventiamo nulla.
          </p>
        </div>

        {/* Contatore reale: numeri veri del portale, nessuna stima. */}
        <div className="mx-auto max-w-[1500px] px-4 md:px-8 pb-8">
          <ContatoreStriscia />
        </div>

        {/* Legali: le pagine non esistono ancora perché i testi li fornisce Claudio.
            Si dichiarano come «in arrivo» e non si finge un collegamento che non c'è. */}
        <div className="border-t border-[var(--tbh-line)] py-5 text-center text-xs text-[var(--tbh-muted)] space-y-2">
          <p className="uppercase tracking-[0.14em]">
            Privacy · Cookie · Termini{" "}
            <span className="normal-case tracking-normal">(testi in arrivo da TBH)</span>
          </p>
          <p>
            TBH-WEB.COM · VISIBILITÀ SENZA CONFINI. · © {new Date().getFullYear()} Touch Business
            Holding
          </p>
        </div>
      </footer>
      )}

      {/* Gioco «Capitan Touch — a caccia dei neuroni perduti»: montato una volta sola,
          così non possono comparire due avatar contemporaneamente. */}
      <CapitanTouch />
    </div>
  );
}
