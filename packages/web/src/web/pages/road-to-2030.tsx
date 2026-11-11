import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Film, Music4, Route, Users } from "lucide-react";
import { useCatalogoMusicale } from "../queries/catalogo-musicale";
import { useCastingAperti } from "../queries/casting";
import {
  ContatoriMusicali,
  GrigliaBraniCatalogo,
} from "../components/catalogo-musica-pubblico";
import { CaroselloCasting, type CastingPubblico } from "../components/casting-tbh";

/* ────────────────────────────────────────────────────────────────────────────
   ROAD TO 2030 — la coda di lavorazione del catalogo (Priorità 2ter/2quater).

   «Tutti i brani musicali pubblicati dovranno progressivamente diventare anche
    videoclip musicali entro il 2030.»

   Questa è l'unica pagina in cui è corretto vedere tutti i brani insieme: qui
   rappresentano lavoro da fare, non produzioni già realizzate. I numeri sono
   sempre calcolati dal database, mai scritti a mano.
   ──────────────────────────────────────────────────────────────────────────── */

const VISTE = [
  { k: "da-realizzare", nome: "DA REALIZZARE" },
  { k: "in-produzione", nome: "IN PRODUZIONE" },
  { k: "completati", nome: "VIDEOCLIP COMPLETATI" },
  { k: "tutti", nome: "TUTTO IL CATALOGO" },
] as const;

type Vista = (typeof VISTE)[number]["k"];

export default function RoadTo2030Page() {
  // Correzione del 29/09/2026: la coda legge il CATALOGO UNICO, così i brani
  // importati (Suno, YouTube, YouTube Music, file audio) entrano in «Road to 2030»
  // esattamente come le uscite storiche, senza aspettare un videoclip.
  const q = useCatalogoMusicale();
  const qc = useCastingAperti({ soloAperti: true });
  const [vista, setVista] = useState<Vista>("da-realizzare");

  const dati = q.data;
  const castingAperti: CastingPubblico[] = qc.data?.casting ?? [];

  const brani = dati?.brani ?? [];
  const elenco =
    vista === "da-realizzare"
      ? brani.filter((b) => b.statoVideo === "da-realizzare")
      : vista === "in-produzione"
        ? brani.filter((b) => b.statoVideo === "in-produzione")
        : vista === "completati"
          ? brani.filter((b) => b.statoVideo === "pubblicato")
          : brani;

  const vuoto =
    vista === "in-produzione"
      ? "Nessun videoclip risulta in produzione in questo momento."
      : vista === "completati"
        ? "Nessun videoclip è ancora stato completato: il primo comparirà qui appena pubblicato."
        : "Nessun brano in questa vista.";

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
      <Link
        href="/tbh/produzioni"
        className="tbh-body mb-6 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        <ArrowLeft className="size-4" /> Produzioni TBH
      </Link>

      <header className="tbh-rise mb-9">
        <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
          <Route size={14} /> Touch Music · piano di produzione
        </p>
        <h1 className="tbh-display tbh-h1">ROAD TO 2030</h1>
        {dati && (
          <p className="tbh-body mt-3 max-w-3xl text-[var(--tbh-muted)]">{dati.roadNota}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/casting"
            className="tbh-body inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.06em]"
            style={{ background: "#b26bff", color: "#0b0b0f" }}
          >
            <Users size={16} /> Casting videoclip
          </Link>
          <Link
            href="/musica"
            className="tbh-body inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-[13px] font-bold hover:border-[var(--tbh-neon)]"
          >
            <Music4 size={16} /> Il catalogo musicale
          </Link>
        </div>
      </header>

      {q.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tbh-card h-56 animate-pulse" />
          ))}
        </div>
      )}

      {q.isError && (
        <div className="tbh-card border-dashed p-6">
          <p className="tbh-body text-[14px] text-[var(--tbh-muted)]">
            Il catalogo non è raggiungibile in questo momento.
          </p>
        </div>
      )}

      {dati && (
        <>
          <ContatoriMusicali
            conteggi={dati.conteggi}
            colore="var(--tbh-gold)"
            voci={[
              { k: "Brani in catalogo", v: dati.conteggi.braniMaster },
              { k: "Audio pubblicati", v: dati.conteggi.audioPubblicati },
              { k: "Videoclip da realizzare", v: dati.conteggi.videoclipDaRealizzare },
              { k: "Videoclip pubblicati", v: dati.conteggi.videoclipPubblicati },
            ]}
          />
          <p className="tbh-body mt-3 text-[12px] text-[var(--tbh-muted)]">
            {dati.roadObiettivo} · avanzamento calcolato sul catalogo: {dati.conteggi.avanzamento}%
          </p>

          {/* IL FLUSSO — testo unico dal server, non riscritto in pagina. */}
          <section className="mt-10">
            <h2 className="tbh-display tbh-h3 mb-3">IL PERCORSO DI OGNI BRANO</h2>
            <ol className="flex flex-wrap items-center gap-2">
              {dati.flusso.map((f, i) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="tbh-body rounded-full border border-white/12 px-3 py-1.5 text-[12px]">
                    {f}
                  </span>
                  {i < dati.flusso.length - 1 && (
                    <span className="text-[var(--tbh-muted)]">→</span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {/* CASTING APERTI — lo stesso record master della pagina Casting videoclip. */}
          <section className="mt-12">
            <CaroselloCasting
              casting={castingAperti}
              vuoto="Nessun casting aperto in questo momento: compare qui appena un videoclip entra in pre-produzione."
            />
          </section>

          <section className="mt-12">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <h2 className="tbh-display tbh-h2">LA CODA DI LAVORAZIONE</h2>
              <div className="flex flex-wrap gap-2">
                {VISTE.map((v) => (
                  <button
                    key={v.k}
                    type="button"
                    onClick={() => setVista(v.k)}
                    className={`tbh-body rounded-full px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] transition ${
                      vista === v.k
                        ? "bg-[var(--tbh-gold)] text-black"
                        : "border border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-fg)]"
                    }`}
                  >
                    {v.nome}
                  </button>
                ))}
              </div>
            </div>
            <p className="tbh-body mb-4 flex items-center gap-2 text-[13px] text-[var(--tbh-muted)]">
              <Film size={15} /> {elenco.length}{" "}
              {elenco.length === 1 ? "brano" : "brani"} in questa vista.
            </p>
            <GrigliaBraniCatalogo brani={elenco} d={dati} colore="#b46bff" vuoto={vuoto} />
          </section>

          <p className="tbh-body mt-10 text-[12px] text-[var(--tbh-muted)]">{dati.nota}</p>
        </>
      )}
    </div>
  );
}
