import { Link } from "wouter";
import { MessageCircle, Star, Radio as RadioIcon, Tv, Info } from "lucide-react";
import { useDm } from "../queries/tbh";
import { useMedia } from "../queries/rete";
import { LinkTile } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";

/** Ordine 3 e 8 — MEDIA PARTNER TBH, separato dal gruppo proprietario.
 *  DM Comunicazioni ha evidenza superiore a tutti gli altri media partner (ordine 4). */
export default function MediaPartnerPage() {
  const dm = useDm();
  const media = useMedia();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Network TBH · Media Partner
        </p>
        <h1 className="tbh-display tbh-h1">Media Partner TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          I media partner non fanno parte del gruppo proprietario: sono testate, radio, canali e
          piattaforme autonome che lavorano con TBH. Ogni scheda porta al canale ufficiale.
        </p>
      </header>

      {/* DM in evidenza superiore */}
      <section className="mb-12">
        <div className="tbh-card p-6 md:p-8 border-[var(--tbh-neon)]">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-[var(--tbh-gold)]" />
            <span className="text-xs tracking-[0.2em] uppercase text-[var(--tbh-gold)]">
              Media partner in evidenza
            </span>
          </div>
          <h2 className="tbh-display tbh-h2">{dm.data?.canale.name ?? "DM Comunicazioni"}</h2>
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
            {dm.data?.canale.descrizione ??
              "Canale di comunicazione sportiva autonomo, media partner del gruppo TBH."}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/dm" className="tbh-neon-btn px-5 py-2.5 text-sm">
              Apri la pagina DM Comunicazioni →
            </Link>
            <Link
              to="/sport/societa-seguite"
              className="px-5 py-2.5 text-sm rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-gold)] text-[var(--tbh-gold)]"
            >
              Società seguite
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-6">
            {(dm.data?.programmi ?? []).map((p) => (
              <Link
                key={p.slug}
                to={`/dm/programmi?p=${p.slug}`}
                className="tbh-card p-4 hover:border-[var(--tbh-neon)] transition"
              >
                <div className="tbh-display text-lg">{p.name}</div>
                <div className="text-xs text-[var(--tbh-muted)] mt-1">
                  {p.giorno && p.orario ? `${p.giorno} ore ${p.orario}` : "Orario da confermare"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Radio partner */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 flex items-center gap-2 mb-5">
          <RadioIcon size={20} className="text-[var(--tbh-neon)]" /> Radio partner
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(media.data?.radio ?? []).map((r) => (
            <LinkTile
              key={r.nome}
              name={r.nome}
              subtitle="Radio partner"
              logo={null}
              site={r.sito}
              note={r.nota ?? undefined}
            />
          ))}
        </div>
      </section>

      {/* Piattaforme e canali video */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 flex items-center gap-2 mb-5">
          <Tv size={20} className="text-[var(--tbh-neon)]" /> Piattaforme e canali video
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link to="/media/heddy-video" className="tbh-card overflow-hidden p-5 hover:border-[var(--tbh-neon)] transition">
            <div className="tbh-display tbh-h3">HEDDY.video</div>
            <p className="text-xs tracking-wide text-[var(--tbh-gold)] uppercase mt-1">
              Film · docufilm · videoclip
            </p>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Il contenitore video del gruppo: acquisto e noleggio dei titoli disponibili.
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-[var(--tbh-neon)]">
              Apri la pagina →
            </span>
          </Link>
          {(media.data?.tv ?? []).map((t) => (
            <LinkTile
              key={t.nome}
              name={t.nome}
              subtitle="Canale · piattaforma"
              logo={null}
              site={t.sito}
              note={t.nota ?? undefined}
            />
          ))}
        </div>
      </section>

      {/* Riviste */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-5">Testate e riviste</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(media.data?.riviste ?? []).map((r) => (
            <LinkTile
              key={r.nome}
              name={r.nome}
              subtitle="Testata"
              logo={null}
              site={r.sito}
              note={r.nota ?? undefined}
            />
          ))}
        </div>
      </section>

      <div className="tbh-card p-5 flex gap-3 items-start mb-8">
        <Info className="text-[var(--tbh-gold)] shrink-0" size={20} />
        <p className="text-sm text-[var(--tbh-muted)]">
          Dove il link ufficiale non è ancora confermato la scheda resta senza collegamento esterno:
          nessun indirizzo inventato. Loghi ufficiali dei media partner: in arrivo.
        </p>
      </div>

      <div className="tbh-card p-6 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm grow">
          <strong>Sei una radio, una TV o una testata?</strong> Ti mandiamo le condizioni di media
          partnership TBH.
        </p>
        <a
          href={waInfo("la media partnership con TBH")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2 whitespace-nowrap"
        >
          <MessageCircle size={16} /> Scrivi su WhatsApp
        </a>
      </div>
    </div>
  );
}
