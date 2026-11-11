import { Link } from "wouter";
import { BookOpen, Layers, MessageCircle, Star } from "lucide-react";
import { useEdicola, useSpeciali } from "../queries/editoria";
import { useMediaPrefisso, useMediaConteggi } from "../queries/media";
import { SfondoSkyline } from "../components/skyline";
import {
  PREFISSO_COPERTINA,
  PREFISSO_PAGINE,
  slotCopertina,
  slotPagine,
  INSERTI_SPORT_DA,
} from "../lib/slot-magazine";
import { waInfo } from "../lib/whatsapp";
import { FASHION_LIFE, VERIFICATO_IL } from "../lib/esterni";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import { StrisciaCanaliTematici } from "./canale-tematico";

/**
 * FASE 7 — Edicola di TOUCH INFLUENCITY MAGAZINE (l'unica rivista ufficiale TBH).
 * Touch Spotlight NON è una rivista: è una rubrica interna, dichiarata come tale.
 * Copertine e sfogliabili non esistono ancora: nessuna immagine è stata creata al loro posto.
 */
export default function InfluencityPage({ soloSpeciali = false }: { soloSpeciali?: boolean }) {
  const q = useEdicola();
  const sp = useSpeciali();
  const anni = q.data?.anni ?? [];
  const speciali = sp.data?.items ?? [];

  // Copertine e pagine caricate dal pannello: si vedono subito anche qui in edicola.
  const cop = useMediaPrefisso(PREFISSO_COPERTINA);
  const pag = useMediaConteggi(PREFISSO_PAGINE);
  const mappaCopertine = new Map<string, string>();
  for (const r of cop.data?.items ?? []) {
    if (r.url && !mappaCopertine.has(r.slot)) mappaCopertine.set(r.slot, r.url);
  }
  const mappaPagine = new Map<string, number>();
  for (const r of pag.data?.items ?? []) mappaPagine.set(r.slot, r.n);

  return (
    <div className="relative overflow-hidden mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <SfondoSkyline colore="#9dff3c" altezza={300} />
      <div className="relative z-10">
      {/* BLOCCO 1 · punto 5 — ruoli chiari: qui c'è la RIVISTA (numeri, copertine,
          speciali, inserti). Gli articoli stanno in News, l'hub è l'Edicola. */}
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
        <Link to="/edicola" className="transition hover:text-[var(--tbh-neon)]">
          Edicola TBH
        </Link>{" "}
        · La rivista
      </p>
      <h1 className="tbh-display tbh-h1 mt-2">
        {soloSpeciali ? "Speciali annuali" : "Touch Influencity Magazine"}
      </h1>
      <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
        {soloSpeciali
          ? "I numeri di fine anno: ogni 31 dicembre il magazine raccoglie gli highlights dell'anno concluso."
          : "L'unica rivista ufficiale del gruppo. Dal numero d'esordio di Giugno/Luglio 2022, poi mensile, con lo speciale di fine anno. Ogni uscita porta il suo numero reale di copertina."}
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        <Link
          to="/influencity"
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            soloSpeciali
              ? "border-[var(--tbh-line)] text-[var(--tbh-muted)]"
              : "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
          }`}
        >
          Tutti i numeri {q.data?.totale ? `(${q.data.totale})` : ""}
        </Link>
        <Link
          to="/influencity/speciali"
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            soloSpeciali
              ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
              : "border-[var(--tbh-line)] text-[var(--tbh-muted)]"
          }`}
        >
          Speciali annuali {speciali.length ? `(${speciali.length})` : ""}
        </Link>
      </div>

      {/* 28/10/2026 — il canale tematico del magazine (video, interviste, schede). */}
      {!soloSpeciali && (
        <div className="mt-5">
          <StrisciaCanaliTematici solo={["touch-influencity-magazine"]} />
        </div>
      )}

      {soloSpeciali ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8">
          {speciali.map((n) => (
            <NumeroCard
              key={n.slug}
              slug={n.slug}
              numero={n.numero}
              periodo={n.periodo}
              speciale={n.speciale}
              copertina={mappaCopertine.get(slotCopertina(n.slug)) ?? n.copertina}
              pagine={mappaPagine.get(slotPagine(n.slug)) ?? 0}
            />
          ))}
        </div>
      ) : (
        anni.map((a) => (
          <section key={a.anno} className="mt-10">
            <h2 className="tbh-display tbh-h2 text-[var(--tbh-gold)]">{a.anno}</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
              {a.numeri.map((n) => (
                <NumeroCard
                  key={n.slug}
                  slug={n.slug}
                  numero={n.numero}
                  periodo={n.periodo}
                  speciale={n.speciale}
                  copertina={mappaCopertine.get(slotCopertina(n.slug)) ?? n.copertina}
                  pagine={mappaPagine.get(slotPagine(n.slug)) ?? 0}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {!soloSpeciali && (
        <section className="mt-12">
          <h2 className="tbh-display tbh-h2">Le rubriche interne</h2>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {(q.data?.rubriche ?? []).map((r) => (
              <Link key={r.slug} to={r.to} className="tbh-card p-5 flex flex-col gap-2">
                <span className="tbh-display text-xl text-[var(--tbh-neon)]">{r.nome}</span>
                <span className="text-sm text-[var(--tbh-muted)]">{r.descrizione}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!soloSpeciali && (
        <section className="mt-12">
          <h2 className="tbh-display tbh-h2">Riviste e testate</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-2 max-w-3xl">
            Testate esterne con cui abbiamo lavorato. Link e anteprime verificati il {VERIFICATO_IL}.
          </p>
          <div className="grid gap-6 md:grid-cols-2 mt-5">
            <article className="tbh-card overflow-hidden flex flex-col">
              <a href={FASHION_LIFE.sito} target="_blank" rel="noreferrer" className="block">
                <img
                  src={FASHION_LIFE.anteprima}
                  alt={`Anteprima del sito ufficiale ${FASHION_LIFE.nome}`}
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </a>
              <div className="p-5 flex flex-col gap-2">
                <h3 className="tbh-display text-xl">{FASHION_LIFE.nome}</h3>
                <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">
                  {FASHION_LIFE.rapporto}
                </p>
                <p className="text-sm text-[var(--tbh-muted)]">{FASHION_LIFE.descrizione}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={FASHION_LIFE.sito}
                    target="_blank"
                    rel="noreferrer"
                    className="tbh-neon-btn px-4 py-2 text-sm"
                  >
                    Apri il sito ufficiale
                  </a>
                  <Link
                    to="/fashion"
                    className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold hover:border-[var(--tbh-neon)]"
                  >
                    Area Fashion &amp; Riviste
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      <div className="tbh-card p-5 md:p-6 mt-10 flex flex-col gap-3">
        <p className="text-sm text-[var(--tbh-muted)]">{q.data?.nota ?? sp.data?.nota}</p>
        <a
          href={waInfo("copertine e sfogliabili di Touch Influencity Magazine")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2 self-start"
        >
          <MessageCircle size={17} /> Invia copertine e PDF
        </a>
        {/* 28/09/2026 — ordine di Claudio: la copertina reale del N°31 deve comparire come N°31
            e solo come N°31. La numerazione non è più contata dal portale: ogni uscita porta
            scritto il suo numero e l'elenco è ancorato a questa copertina. */}
        <p className="text-xs text-[var(--tbh-gold)]">
          Copertina reale caricata: N°31 · Gennaio 2025 · New Era Edition. L'edicola è ancorata a
          questo numero stampato: Gennaio 2025 è il N°31, Dicembre 2024 il N°30. Resta da
          confermare con TBH come si chiama l'uscita d'esordio di Giugno/Luglio 2022, indicata in
          passato anche come «numero zero»: qui è il N°1, perché è l'unica lettura che torna con
          il N°31 in copertina. Gli speciali “bis” di fine anno restano fuori dal conteggio.
        </p>
        {q.data?.anomalie?.length ? (
          <p className="text-xs font-semibold text-[#ff6b6b]">
            ⚠ Controllo numerazione: {q.data.anomalie.join(" · ")}
          </p>
        ) : null}
        <p className="text-xs text-[var(--tbh-muted)]">
          Copertine e pagine si caricano una a una dalla scheda di ogni numero, speciali di fine
          anno compresi. Gli inserti sportivi partono da {INSERTI_SPORT_DA}: lo spazio è già
          predisposto in ogni scheda e resta vuoto finché non arrivano i contenuti reali.
        </p>
      </div>
      </div>
      <div className="relative z-10 mt-14 grid gap-12 rounded-3xl border border-white/10 bg-black/70 p-6 md:p-8 backdrop-blur-sm">
        <SezioneAmministrabile sezione="influencity-numeri" />
      </div>
    </div>
  );
}

function NumeroCard({
  slug,
  numero,
  periodo,
  speciale,
  copertina,
  pagine = 0,
}: {
  slug: string;
  numero: string;
  periodo: string;
  speciale: boolean;
  copertina: string | null;
  pagine?: number;
}) {
  return (
    <Link to={`/influencity/${slug}`} className="tbh-card overflow-hidden flex flex-col">
      <div className="aspect-[3/4] w-full bg-white relative grid place-items-center overflow-hidden p-4 text-center">
        {copertina ? (
          <img src={copertina} alt={`Numero ${numero}`} className="absolute inset-0 h-full w-full object-contain p-4" loading="eager" decoding="async" data-tessera-img />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <BookOpen size={28} className="text-black/50" />
            <span className="tbh-display text-3xl text-black leading-none">N°{numero}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-black/60">
              {periodo}
            </span>
            <span className="text-[10px] text-black/40">Copertina da ricevere</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <span className="tbh-display text-lg">Numero {numero}</span>
        <span className="text-xs text-[var(--tbh-muted)]">{periodo}</span>
        {speciale && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[var(--tbh-gold)]">
            <Star size={12} /> Speciale annuale
          </span>
        )}
        {pagine > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[var(--tbh-neon)]">
            <Layers size={12} /> {pagine} {pagine === 1 ? "pagina caricata" : "pagine caricate"}
          </span>
        )}
      </div>
    </Link>
  );
}
