import { Link } from "wouter";
import { LogoBox } from "./logo-box";
import { ArrowRight } from "lucide-react";

/**
 * Componenti della Home vetrina (FASE 2 del piano di ampliamento).
 * Regole rispettate: nessuna foto finta di locali reali, nessuno sconto inventato,
 * nessun bottone morto (ogni tessera apre una rotta reale del portale).
 * Il colore del mondo entra come bordo/glow/titolo, mai come sfondo.
 */

export type MondoView = {
  slug: string;
  nome: string;
  claim: string;
  colore: string;
  to: string;
  categorie: { label: string; to: string }[];
};

export function MondoCard({ mondo }: { mondo: MondoView }) {
  return (
    <div
      className="tbh-card p-5 md:p-6 flex flex-col gap-3 border-l-4"
      style={{ borderLeftColor: mondo.colore, boxShadow: `0 0 0 1px ${mondo.colore}22` }}
    >
      <Link to={mondo.to} className="group">
        <h3 className="tbh-display text-2xl md:text-3xl" style={{ color: mondo.colore }}>
          {mondo.nome}
        </h3>
        <p className="text-sm text-[var(--tbh-muted)] mt-1">{mondo.claim}</p>
      </Link>
      <div className="flex flex-wrap gap-2 mt-1">
        {mondo.categorie.map((c) => (
          <Link
            key={c.to + c.label}
            to={c.to}
            className="text-[11px] md:text-xs font-semibold rounded-full border border-[var(--tbh-line)] px-3 py-1.5 hover:border-[var(--tbh-neon)]"
          >
            {c.label}
          </Link>
        ))}
      </div>
      <Link
        to={mondo.to}
        className="mt-auto pt-2 inline-flex items-center gap-2 text-sm font-bold"
        style={{ color: mondo.colore }}
      >
        Entra nel mondo <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export type BannerView = {
  id: string;
  titolo: string;
  testo: string;
  cta: string;
  to: string;
  categoria: string;
};

/** Slot banner programmabile: contenuti reali interni, nessuna percentuale inventata. */
export function BannerSlot({ banner }: { banner: BannerView }) {
  return (
    <Link
      to={banner.to}
      className="tbh-card p-5 md:p-6 block hover:border-[var(--tbh-neon)] transition"
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
        Spazio {banner.categoria}
      </span>
      <h3 className="tbh-display text-xl md:text-2xl mt-2">{banner.titolo}</h3>
      <p className="text-sm text-[var(--tbh-muted)] mt-1.5">{banner.testo}</p>
      <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--tbh-neon)]">
        {banner.cta} <ArrowRight size={16} />
      </span>
    </Link>
  );
}

export type EntitaMini = {
  id: string;
  nome: string;
  logo: string | null;
  settore: string | null;
  citta: string | null;
};

/**
 * Tessera "In evidenza": nessuna fotografia inventata di hotel, locali o negozi.
 * Nome per esteso + dato reale + nota sulla foto mancante. Il click porta alla pagina interna.
 */
export function EntitaTile({ e }: { e: EntitaMini }) {
  return (
    <Link
      to={`/e/${e.id}`}
      className="tbh-card overflow-hidden block hover:border-[var(--tbh-neon)] transition"
    >
      {/* Riquadro del marchio: componente globale unico (17/09/2026, punto 5).
          Prima questa tessera aveva un box logo scritto a mano, quindi lo stesso
          marchio si vedeva di misure diverse pagina per pagina. Ora scarica la
          variante generata dal master e tiene l'area di rispetto come tutte le altre. */}
      <LogoBox
        nome={e.nome}
        logo={e.logo}
        formato="scheda-attivita"
        altezzaClasse="h-28 md:h-32"
        fondo="chiaro"
        dentroLink
      />
      <div className="p-4">
        <h4 className="tbh-display text-lg leading-tight">{e.nome}</h4>
        <p className="text-xs text-[var(--tbh-gold)] uppercase tracking-wide mt-1">
          {e.settore ?? "Settore da confermare"}
        </p>
        <p className="text-xs text-[var(--tbh-muted)] mt-1">{e.citta ?? "Località da confermare"}</p>
        <span className="text-[10px] text-[var(--tbh-muted)] mt-2 block">
          {e.logo ? "Apri la scheda" : "Logo e foto reale da ricevere"}
        </span>
      </div>
    </Link>
  );
}

export function CategoriaEvidenza({
  label,
  to,
  entita,
}: {
  label: string;
  to: string;
  entita: EntitaMini[];
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-3">
        <h3 className="tbh-display text-xl md:text-2xl">{label}</h3>
        <Link to={to} className="text-sm font-semibold text-[var(--tbh-neon)] inline-flex items-center gap-1.5">
          Vedi tutto <ArrowRight size={15} />
        </Link>
      </div>
      {entita.length === 0 ? (
        <p className="text-sm text-[var(--tbh-muted)]">
          Categoria in allestimento: le schede compaiono appena l'anagrafica è confermata.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {entita.map((e) => (
            <EntitaTile key={`${label}-${e.id}`} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Barra finale del mockup: "L'unico ecosistema". Ogni voce è un link reale. */
export const VOCI_ECOSISTEMA: { t: string; to: string }[] = [
  { t: "Vantaggi reali", to: "/club" },
  { t: "Assistenza sempre", to: "/tbh-assist" },
  { t: "Sport, media, eventi", to: "/sport" },
  { t: "Shop & servizi", to: "/shop" },
  { t: "Informazione", to: "/influencity" },
  { t: "Opportunità", to: "/lavoro-casting" },
];

export function BarraEcosistema() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <div className="tbh-card p-6 md:p-8">
        <h2 className="tbh-display tbh-h2 text-center">L'UNICO ECOSISTEMA</h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mt-6">
          {VOCI_ECOSISTEMA.map((v) => (
            <Link
              key={v.t}
              to={v.to}
              className="rounded-2xl border border-[var(--tbh-line)] p-4 text-center font-semibold hover:border-[var(--tbh-neon)] transition"
            >
              {v.t}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
