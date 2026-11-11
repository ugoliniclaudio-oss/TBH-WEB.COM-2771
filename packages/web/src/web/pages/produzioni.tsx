import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Music4, Film, Tv, Users, Clapperboard } from "lucide-react";
import { useProduzioni } from "../queries/tbh";
import { ContentCard } from "../components/content-card";
import { anteprimaGriglia, hrefSocieta, trovaKit } from "../lib/kit-societa";
import { TBH } from "../lib/appartenenza";
import { waInfo } from "../lib/whatsapp";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import { useCastingAperti } from "../queries/casting";
import { CardCasting } from "../components/casting-tbh";
import { useCatalogoMusicale } from "../queries/catalogo-musicale";

const BRAND_PATH: Record<string, string> = {
  "reality-show": "/media/reality-show",
  "heddy-video": "/media/heddy-video",
};

/* ── AMBITI DI PRODUZIONE ───────────────────────────────────────────────────
   «[VIDEOCLIP MUSICALI][CINEMA][FORMAT][REALITY][ALTRE PRODUZIONI]».
   Ogni scheda mostra quello che esiste davvero: i videoclip arrivano dal
   catalogo Road to 2030, i casting dal loro unico database. Dove non c'è
   ancora niente lo scriviamo, non lo riempiamo.                            */

const AMBITI_PRODUZIONE = [
  {
    k: "videoclip",
    nome: "VIDEOCLIP MUSICALI",
    Icona: Music4,
    testo: "I videoclip dei brani Touch Music, dentro il piano Road to 2030.",
    rotta: "/tbh/produzioni/road-to-2030",
    rottaNome: "Apri Road to 2030",
  },
  {
    k: "cinema",
    nome: "CINEMA",
    Icona: Film,
    testo: "Cortometraggi e lungometraggi del gruppo.",
    rotta: "/channel/touch-cinema",
    rottaNome: "Apri Touch Cinema",
  },
  {
    k: "tv-format",
    nome: "FORMAT",
    Icona: Tv,
    testo: "Format televisivi e web prodotti o coprodotti da TBH.",
    rotta: null,
    rottaNome: null,
  },
  {
    k: "reality",
    nome: "REALITY",
    Icona: Users,
    testo: "Academy Reality e i format a partecipazione.",
    rotta: "/media/reality-show/academy",
    rottaNome: "Apri Academy Reality",
  },
  {
    k: "altro",
    nome: "ALTRE PRODUZIONI",
    Icona: Clapperboard,
    testo: "Eventi ripresi, spot, contenuti su commessa.",
    rotta: null,
    rottaNome: null,
  },
] as const;

type AmbitoProduzione = (typeof AMBITI_PRODUZIONE)[number]["k"];

/** `?ambito=cinema` apre direttamente la scheda richiesta (link del Touch Cinema Channel). */
function ambitoIniziale(): AmbitoProduzione {
  if (typeof window === "undefined") return "videoclip";
  const k = new URLSearchParams(window.location.search).get("ambito");
  return AMBITI_PRODUZIONE.find((a) => a.k === k)?.k ?? "videoclip";
}

function SezioniProduzione() {
  const [attivo, setAttivo] = useState<AmbitoProduzione>(ambitoIniziale);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("ambito"))
      document.getElementById("ambiti-produzione")?.scrollIntoView({ block: "start" });
  }, []);
  const qc = useCastingAperti();
  // Legge il catalogo unico: gli stessi brani del pannello e della pagina /musica.
  const qm = useCatalogoMusicale();

  const ambito = AMBITI_PRODUZIONE.find((a) => a.k === attivo)!;
  const castingAmbito = (qc.data?.casting ?? []).filter(
    (c) => c.ambito === attivo && c.aperto,
  );
  const inProduzione =
    attivo === "videoclip"
      ? (qm.data?.brani ?? []).filter((b) => b.statoVideo === "in-produzione")
      : [];

  return (
    <section className="mb-14 scroll-mt-24" id="ambiti-produzione">
      <h2 className="tbh-display tbh-h2 mb-4">Gli ambiti di produzione</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {AMBITI_PRODUZIONE.map((a) => (
          <button
            key={a.k}
            type="button"
            onClick={() => setAttivo(a.k)}
            className={`tbh-body rounded-full px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] transition ${
              attivo === a.k
                ? "bg-[var(--tbh-neon)] text-black"
                : "border border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-fg)]"
            }`}
          >
            {a.nome}
          </button>
        ))}
      </div>

      <div className="tbh-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="tbh-display tbh-h3 flex items-center gap-3">
              <ambito.Icona size={24} className="text-[var(--tbh-neon)]" /> {ambito.nome}
            </h3>
            <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-2 max-w-2xl">
              {ambito.testo}
            </p>
          </div>
          {ambito.rotta && (
            <Link
              to={ambito.rotta}
              className="px-5 py-2.5 rounded-full border border-[var(--tbh-line)] text-sm font-semibold hover:border-[var(--tbh-neon)] inline-flex items-center gap-2"
            >
              {ambito.rottaNome} <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {attivo === "videoclip" && (
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-[11px] tracking-[0.18em] text-[var(--tbh-gold)] uppercase mb-3">
              Videoclip in produzione
            </p>
            {qm.isLoading ? (
              <p className="tbh-body text-sm text-[var(--tbh-muted)]">Carico il catalogo…</p>
            ) : inProduzione.length === 0 ? (
              <p className="tbh-body text-sm text-[var(--tbh-muted)]">
                Nessun videoclip è in lavorazione in questo momento. Il piano completo, brano per
                brano, è in Road to 2030.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {inProduzione.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-sm"
                  >
                    <b>{b.titolo}</b>
                    <span className="block text-xs text-[var(--tbh-muted)]">{b.artista}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-[11px] tracking-[0.18em] text-[#d9b8ff] uppercase mb-3">
            Casting aperti in questo ambito
          </p>
          {qc.isLoading ? (
            <p className="tbh-body text-sm text-[var(--tbh-muted)]">Carico i casting…</p>
          ) : castingAmbito.length === 0 ? (
            <p className="tbh-body text-sm text-[var(--tbh-muted)]">
              Nessun casting aperto per {ambito.nome.toLowerCase()}. Quando una produzione apre le
              selezioni l&apos;annuncio compare qui, in{" "}
              <Link to="/casting" className="text-[#d9b8ff] font-semibold">
                Casting videoclip
              </Link>{" "}
              e in{" "}
              <Link to="/lavoro-casting" className="text-[var(--tbh-neon)] font-semibold">
                Lavoro &amp; Casting
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {castingAmbito.map((c) => (
                <CardCasting key={c.id} c={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProduzioniPage() {
  const q = useProduzioni();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Punto 05 della Master List
        </p>
        <h1 className="tbh-display tbh-h1">Produzioni TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          TV, radio, cinema ed editoria del gruppo. Elenchiamo solo le entità già in anagrafica:
          i loghi ufficiali arrivano appena Claudio li fornisce, nel frattempo resta il monogramma.
        </p>
      </header>

      <SezioniProduzione />

      {q.isLoading && (
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-72 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {q.data?.items.map((c) => (
          /* 04/10/2026 — stessa anteprima-pulsante di /tbh/societa: banner ufficiale
             «logo | TBH» (o logo + fascia TBH) che apre la scheda della società. */
          <ContentCard
            key={c.code}
            nome={c.name}
            logo={c.logo}
            etichetta={`${c.code} · ${c.kind === "societa" ? "Società con P.IVA" : "Attività del gruppo"}`}
            testo={c.sector}
            nota={c.vat ? `P.IVA ${c.vat}` : "Senza P.IVA propria"}
            pagina={hrefSocieta(c.code)}
            appartenenza={trovaKit(c.code)?.appartenenza ?? TBH}
            anteprima={anteprimaGriglia(trovaKit(c.code)) ?? c.logo}
            sito={c.site}
            azioni={[{ etichetta: "Informazioni", url: waInfo(`le produzioni di ${c.name}`) }]}
            altezzaLogo="h-36 md:h-40"
            pannello="/allestimento"
          />
        ))}
      </div>

      {q.data && q.data.brand.length > 0 && (
        <section className="mt-12">
          <h2 className="tbh-display tbh-h2 mb-5">Produzioni con pagina dedicata</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.brand.map((b) => (
              <Link
                key={b.slug}
                to={BRAND_PATH[b.slug] ?? "/in-allestimento"}
                className="tbh-card p-5 block hover:border-[var(--tbh-neon)] transition"
              >
                <h3 className="tbh-display tbh-h3">{b.name}</h3>
                <p className="text-xs tracking-wide text-[var(--tbh-gold)] uppercase mt-1">
                  {b.claim}
                </p>
                <p className="text-sm text-[var(--tbh-muted)] mt-3">{b.descrizione}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-[var(--tbh-neon)]">
                  Apri la pagina →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="produzioni" />
      </div>
    </div>
  );
}
