import { useState } from "react";
import { Link } from "wouter";
import { BadgeCheck, MapPin, ExternalLink, Brain } from "lucide-react";
import { useLuoghi } from "../queries/rete";
import { CircuitoBanner } from "../components/circuito-banner";
import { LogoBox } from "../components/logo-box";
import { useContatoreOro } from "../queries/capitan";

function mapsUrl(l: { nome: string; citta: string; indirizzo: string | null }) {
  const q = encodeURIComponent(`${l.nome} ${l.indirizzo ?? l.citta}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function MappaPage() {
  const [categoria, setCategoria] = useState("Tutte");
  const [solo, setSolo] = useState(false);
  const q = useLuoghi(categoria, solo);
  const d = q.data;
  const oro = useContatoreOro().data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Dove siamo passati almeno una volta
        </p>
        <h1 className="tbh-display tbh-h1">Mappa del territorio</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Negozi, hotel, ristoranti, bar, spiagge, locali, discoteche, villaggi, parchi e fiere.
          Il badge verde-fluo segnala chi espone la vetrofania del circuito TBH.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="px-4 py-2 rounded-full bg-white/10 font-semibold">
            Luoghi mappati: <b className="text-[var(--tbh-neon)]">{d?.totale ?? "…"}</b>
          </span>
          <span className="px-4 py-2 rounded-full bg-white/10 font-semibold">
            Con vetrofania: <b className="text-[var(--tbh-gold)]">{d?.circuito ?? "…"}</b>
          </span>
        </div>
      </header>

      <div className="mb-8">
        <CircuitoBanner n={4} />
      </div>

      {/* Capitan Touch — blocco additivo: la mappa resta identica, si aggiunge
          solo l'avviso del gioco. Nessuna indicazione su DOVE si nasconde. */}
      <div className="tbh-card p-5 md:p-6 mb-8 border-[var(--tbh-gold)]/50">
        <div className="flex flex-wrap items-center gap-5">
          <img
            src="/capitan-touch/capitan-cerca.png"
            alt="Capitan Touch"
            loading="lazy"
            className="h-24 md:h-28 w-auto object-contain drop-shadow-[0_0_18px_rgba(215,255,0,0.25)]"
          />
          <div className="grow min-w-[260px]">
            <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-1">
              Gioco del circuito
            </p>
            <h2 className="tbh-display tbh-h3 leading-tight">
              Capitan Touch è passato da qui
            </h2>
            <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-2xl">
              Può nascondersi in una delle pagine del portale o nella scheda di un'attività
              del circuito. Compare per pochi secondi, fa la sua gag e scappa: devi essere
              veloce a cliccarlo. Dove si nasconde non lo diciamo.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="px-4 py-2 rounded-full bg-white/10 font-semibold text-sm inline-flex items-center gap-2">
              <Brain size={16} className="text-[var(--tbh-gold)]" />
              Neuroni d'Oro:{" "}
              <b className="text-[var(--tbh-gold)]">
                {oro ? (oro.esauriti ? "ESAURITI" : `${oro.disponibili} su ${oro.totali}`) : "…"}
              </b>
            </span>
            <Link href="/capitan-touch" className="tbh-neon-btn px-5 py-2.5 text-sm text-center">
              Regole e neuroni trovati
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(d?.categorie ?? ["Tutte"]).map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition ${
              categoria === c ? "bg-[var(--tbh-neon)] text-black" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setSolo((s) => !s)}
          className={`px-4 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            solo ? "bg-[var(--tbh-gold)] text-black" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <BadgeCheck size={16} /> Solo circuito TBH
        </button>
      </div>

      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {(d?.items ?? []).map((l) => (
          <article key={l.nome} className="tbh-card p-4 flex flex-col">
            {/* Componente globale unico: stesso riquadro, stessa area di rispetto e
                stessa variante dal master di tutte le altre pagine (punto 5). */}
            <LogoBox
              nome={l.nome}
              logo={l.logo}
              formato="scheda-attivita"
              altezzaClasse="h-36 md:h-44"
              fondo="chiaro"
            />
            <div className="p-3 pt-5 flex flex-col gap-2 grow">
              <div className="flex items-start justify-between gap-3">
                <h3 className="tbh-display tbh-h3 leading-tight">{l.nome}</h3>
                {l.circuitoTBH && (
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-black bg-[var(--tbh-neon)] px-2.5 py-1 rounded-full">
                    <BadgeCheck size={13} /> Circuito
                  </span>
                )}
              </div>
              <p className="text-xs tracking-wide text-[var(--tbh-gold)] uppercase">{l.categoria}</p>
              <p className="text-sm text-[var(--tbh-muted)] flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                {l.indirizzo ?? l.citta}
              </p>
              {l.note && <p className="text-sm text-[var(--tbh-muted)] grow">{l.note}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={mapsUrl(l)}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-neon-btn px-4 py-2 text-sm"
                >
                  Apri mappa
                </a>
                {l.sito ? (
                  <a
                    href={l.sito}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
                  >
                    Sito <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm text-[var(--tbh-muted)]">
                    Sito da verificare
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!q.isLoading && (d?.items?.length ?? 0) === 0 && (
        <p className="text-[var(--tbh-muted)]">Nessun luogo in questa categoria — in allestimento.</p>
      )}
    </div>
  );
}
