import { Link } from "wouter";
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  MapPin,
  Phone,
  Play,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { RiquadroLogo } from "./tessera-logo";

/* ────────────────────────────────────────────────────────────────────────────
   SCHERMO TBH — il mattone dell'INTERFACCIA A PALINSESTO VISUALE (08/09/2026).

   Specifica di Claudio, alla lettera:
     «Le principali pagine oggi presenti nel menu devono essere rappresentate anche
      come schermi/pulsanti orizzontali. Formato 16:9, oppure 4:3 quando il contenuto
      o l'immagine originale lo richiede. Ogni schermo contiene logo / immagine /
      anteprima reale, CATEGORIA, TITOLO, e i pulsanti. Non inventare loghi o immagini.»

   DUE MODI DI RIEMPIRE LO SCHERMO, E NON SI CONFONDONO MAI:
     · `immagine` = foto o fotogramma di scena → riempie tutto lo schermo, `object-cover`.
       È il caso previsto dal CSS della specifica.
     · `logo`     = marchio o stemma → NON si taglia. Va nel riquadro standard con
       `object-contain` (docs/regole-ferree.md §6). È l'unico punto in cui mi discosto
       dal CSS proposto, ed è motivato: con `cover` lo stemma del Verucchio tornerebbe
       tagliato, cioè il difetto appena corretto.
     · niente dei due → SLOT dichiarato «in allestimento». Nessuna foto finta.

   I PULSANTI SONO SOLO QUELLI VERI (punto 6 della specifica): un'azione compare
   soltanto se ha una destinazione. Nessun bottone morto.
   ──────────────────────────────────────────────────────────────────────────── */

/** Le uniche azioni ammesse, con la loro etichetta ufficiale. Punto 6. */
export type TipoAzione =
  | "scheda"
  | "sito"
  | "guarda"
  | "ascolta"
  | "leggi"
  | "scarica"
  | "mappa"
  | "contatta"
  | "acquista"
  | "candidati";

const ETICHETTA: Record<TipoAzione, string> = {
  scheda: "APRI SCHEDA",
  sito: "APRI SITO",
  guarda: "GUARDA",
  ascolta: "ASCOLTA",
  leggi: "LEGGI",
  scarica: "SCARICA",
  mappa: "MAPPA",
  contatta: "CONTATTA",
  acquista: "ACQUISTA",
  candidati: "CANDIDATI",
};

const ICONA: Record<TipoAzione, typeof Play> = {
  scheda: ArrowUpRight,
  sito: ExternalLink,
  guarda: Play,
  ascolta: Headphones,
  leggi: FileText,
  scarica: Download,
  mappa: MapPin,
  contatta: Phone,
  acquista: ShoppingCart,
  candidati: UserPlus,
};

export type AzioneSchermo = {
  tipo: TipoAzione;
  /** Pagina interna canonica (una sola volta nel sito, punto 7). */
  to?: string | null;
  /** Indirizzo esterno: solo https:// (regola 3-bis). */
  href?: string | null;
};

/** Tiene solo le azioni che hanno davvero dove andare. */
export function azioniValide(azioni: AzioneSchermo[] | undefined): AzioneSchermo[] {
  return (azioni ?? []).filter((a) => {
    if (a.to && a.to.startsWith("/")) return true;
    if (a.href && a.href.startsWith("https://")) return true;
    return false;
  });
}

export type Schermo = {
  /** Chiave stabile: è l'ID canonico del contenuto, lo stesso in tutti i rulli. */
  id: string;
  categoria: string;
  titolo: string;
  sottotitolo?: string | null;
  /** Foto / anteprima di scena: riempie lo schermo. */
  immagine?: string | null;
  /** Marchio o stemma: entra intero nel riquadro standard, mai tagliato. */
  logo?: string | null;
  colore?: string | null;
  /** Numero del canale a cui appartiene: è il riempimento onesto dello slot vuoto. */
  numero?: number | null;
  /** 4:3 solo quando l'immagine originale lo richiede (punto 2). */
  rapporto?: "16/9" | "4/3";
  azioni?: AzioneSchermo[];
};

function Azione({ azione, colore }: { azione: AzioneSchermo; colore: string }) {
  const Icona = ICONA[azione.tipo];
  const testo = ETICHETTA[azione.tipo];
  const classe =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] bg-black/55 backdrop-blur transition hover:text-black";

  const stile = { borderColor: `${colore}88`, color: colore } as const;

  if (azione.to) {
    return (
      <Link
        data-azione={azione.tipo}
        to={azione.to}
        className={classe}
        style={stile}
        onClick={(e) => e.stopPropagation()}
      >
        <Icona size={12} /> {testo}
      </Link>
    );
  }
  return (
    <a
      data-azione={azione.tipo}
      href={azione.href ?? undefined}
      target="_blank"
      rel="noreferrer"
      className={classe}
      style={stile}
      onClick={(e) => e.stopPropagation()}
    >
      <Icona size={12} /> {testo}
    </a>
  );
}

/**
 * SCHERMO — anteprima reale + categoria + titolo + solo le CTA disponibili.
 * Se esiste un'azione interna, l'intero schermo è anche il pulsante che la apre:
 * è quello che Claudio chiama «ogni schermo è anche un pulsante».
 */
export function SchermoTbh({
  schermo,
  grande = false,
}: {
  schermo: Schermo;
  /** Schermo IN EVIDENZA: stessa proporzione, larghezza doppia. */
  grande?: boolean;
}) {
  const colore = schermo.colore ?? "var(--tbh-neon)";
  const azioni = azioniValide(schermo.azioni);
  const principale = azioni.find((a) => a.to) ?? null;
  const rapporto = schermo.rapporto ?? "16/9";

  const corpo = (
    <>
      {/* ── MONITOR ────────────────────────────────────────────────────────────
          Il vetro dello schermo è un blocco a sé, con la sua proporzione: la
          didascalia sta SOTTO, in flusso normale, e non ci copre più sopra
          (sovrapposizione misurata negli scatti del 15/09/2026). */}
      <div
        className="relative w-full overflow-hidden border-b"
        style={{ aspectRatio: rapporto, borderColor: `${colore}33` }}
      >
        {schermo.immagine ? (
          <div className="tbh-screen-media absolute inset-0">
            <img src={schermo.immagine} alt={schermo.titolo} loading="lazy" decoding="async" />
          </div>
        ) : schermo.logo ? (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ background: `linear-gradient(140deg, ${colore}1f, transparent 62%)` }}
          >
            {/* Marchio: riquadro standard, `object-contain`, mai tagliato (§6). */}
            <RiquadroLogo
              src={schermo.logo}
              alt={schermo.titolo}
              misura={grande ? "lg" : "md"}
              colore={colore}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ background: `linear-gradient(140deg, ${colore}1a, transparent 66%)` }}
          >
            {/* Slot senza anteprima ufficiale: si mostra il NOME del canale o del
                contenuto, mai il numero (ordine di Claudio del 28/09/2026: il numero è
                un codice interno) e mai un'immagine inventata. */}
            <span data-schermo-slot className="flex flex-col items-center gap-1 px-4 text-center">
              <span
                className="tbh-display leading-tight text-[18px] md:text-[26px] opacity-90 line-clamp-3"
                style={{ color: colore }}
              >
                {schermo.titolo}
              </span>
              <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
                Anteprima in allestimento
              </span>
            </span>
          </div>
        )}

        {/* Velo scuro in basso: raccorda il vetro alla didascalia. */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent" />
      </div>

      {/* ── DIDASCALIA + PULSANTI (sotto il monitor) ───────────────────────── */}
      <div className="pointer-events-none relative z-20 p-3 md:p-4">
        <p
          className="text-[9px] md:text-[10px] uppercase tracking-[0.22em] truncate"
          style={{ color: colore }}
        >
          {schermo.categoria}
        </p>
        <h3
          className={`font-bold leading-tight break-words ${
            grande ? "text-base md:text-2xl line-clamp-2" : "text-[13px] md:text-sm line-clamp-2"
          }`}
        >
          {schermo.titolo}
        </h3>
        {schermo.sottotitolo ? (
          <p className="text-[10px] md:text-[11px] text-[var(--tbh-muted)] truncate">
            {schermo.sottotitolo}
          </p>
        ) : null}

        {azioni.length > 0 ? (
          <div className="pointer-events-auto mt-2 flex flex-wrap gap-1.5">
            {azioni.map((a) => (
              <Azione key={a.tipo + (a.to ?? a.href ?? "")} azione={a} colore={colore} />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );

  const contenitore = `tbh-screen ${grande ? "tbh-screen-lg" : ""} relative overflow-hidden rounded-2xl border bg-black/40 transition hover:-translate-y-0.5`;
  const stile = {
    borderColor: `${colore}55`,
    boxShadow: `0 0 46px -30px ${colore}`,
  } as const;

  /* Tutto lo schermo è cliccabile quando ha una destinazione interna, MA il contenitore
     non può essere un <a>: dentro ci sono già i pulsanti CTA, che sono <a> a loro volta,
     e «<a> dentro <a>» è HTML illegale (errore di idratazione, misurato in console
     l'08/09/2026). Quindi il contenitore resta un <div> e il link è uno strato coprente
     sopra l'immagine (z-10) e sotto la barra dei pulsanti (z-20). */
  return (
    <div
      data-schermo={schermo.id}
      className={`${contenitore} ${principale?.to ? "hover:border-[var(--tbh-neon)]" : ""}`}
      style={stile}
    >
      {principale?.to ? (
        <Link
          data-schermo-link
          to={principale.to}
          className="absolute inset-0 z-10"
          aria-label={`${schermo.categoria} · ${schermo.titolo}`}
        />
      ) : null}
      {corpo}
    </div>
  );
}
