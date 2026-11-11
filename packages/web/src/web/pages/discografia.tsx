import { Link } from "wouter";
import { Clapperboard, Disc3, Library, Sparkles, Timer, UserRound } from "lucide-react";

import { useUsciteMusicali, type UscitaPubblica } from "../queries/uscite-musicali";
import { CollegamentiMusica } from "../components/uscite-musicali";
import { CardUscita, NuoveUsciteDiscografiche, ordinaDallaPiuRecente } from "../components/discografia";
import { PERCORSI_MUSICA } from "../../api/data/uscite-musicali";
import { useAnteprimaPagina } from "../lib/anteprima-pagina";

/**
 * DISCOGRAFIA — /musica/discografia (04/11/2026, round 17).
 * Touch Music Records Channel: tutte le pubblicazioni dalla scheda «Uscite e store» (cms_v1:uscite).
 * Sezioni chieste da Claudio: Singoli pubblicati · Album pubblicati · Prossime uscite ·
 * Produzioni DJ J.C. Hugò · Videoclip e contenuti promozionali.
 * I singoli di ricorrenza (Natale, Capodanno, compleanno, Avvento) restano singoli distinti con il loro
 * badge: nessun raggruppamento automatico in album.
 */

const GIALLO = "#d7ff00";
const ORO = "#d4af37";

const SOCIAL = new Set(["facebook", "instagram", "tiktok", "youtube-video"]);

/** Videoclip pubblicato o contenuto promozionale (video YouTube, post social del brano) verificato. */
function haContenutiVideo(u: UscitaPubblica) {
  return u.brano.haVideo || u.link.some((l) => l.disponibilitaConfermata && l.ambito === "brano" && SOCIAL.has(l.piattaforma));
}

function Sezione({
  id,
  titolo,
  icona,
  uscite,
  vuoto,
}: {
  id: string;
  titolo: string;
  icona: React.ReactNode;
  uscite: UscitaPubblica[];
  vuoto: string;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-4" aria-label={titolo} data-testid={`sezione-${id}`}>
      <h2 className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2 text-[13px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
        {icona} {titolo}
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/60">{uscite.length}</span>
      </h2>
      {uscite.length === 0 ? (
        <p className="text-sm text-[var(--tbh-muted)]">{vuoto}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {uscite.map((u) => (
            <CardUscita key={u.id} u={u} larghezza="w-full" />
          ))}
        </div>
      )}
    </section>
  );
}

const SEZIONI = [
  { id: "singoli", titolo: "Singoli pubblicati" },
  { id: "album", titolo: "Album pubblicati" },
  { id: "prossime", titolo: "Prossime uscite" },
  { id: "produzioni-jc-hugo", titolo: "Produzioni DJ J.C. Hugò" },
  { id: "videoclip", titolo: "Videoclip e contenuti promozionali" },
] as const;

export default function DiscografiaPage() {
  const q = useUsciteMusicali();
  useAnteprimaPagina({
    titolo: "Discografia · Touch Music Records Channel · TBH-WEB",
    descrizione: "Singoli, album e prossime uscite di Touch Music Records e DJ J.C. Hugò, con i collegamenti verificati alle piattaforme.",
  });
  const tutte = ordinaDallaPiuRecente(q.data?.uscite ?? []);
  const pubblicate = tutte.filter((u) => u.statoMostrato === "pubblicata");
  const gruppi: Record<(typeof SEZIONI)[number]["id"], UscitaPubblica[]> = {
    singoli: pubblicate.filter((u) => u.tipo === "singolo"),
    album: pubblicate.filter((u) => u.tipo === "album"),
    prossime: tutte.filter((u) => u.statoMostrato !== "pubblicata"),
    "produzioni-jc-hugo": tutte.filter((u) => u.produzioneJcHugo),
    videoclip: tutte.filter(haContenutiVideo),
  };
  const icone: Record<(typeof SEZIONI)[number]["id"], React.ReactNode> = {
    singoli: <Disc3 size={15} />,
    album: <Library size={15} />,
    prossime: <Timer size={15} />,
    "produzioni-jc-hugo": <UserRound size={15} />,
    videoclip: <Clapperboard size={15} />,
  };
  const vuoti: Record<(typeof SEZIONI)[number]["id"], string> = {
    singoli: "Nessun singolo pubblicato ancora registrato.",
    album: "Nessun album pubblicato ancora registrato.",
    prossime: "Nessuna prossima uscita annunciata.",
    "produzioni-jc-hugo": "Nessuna produzione registrata.",
    videoclip: "Nessun videoclip o contenuto promozionale ancora pubblicato.",
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:py-12" data-testid="discografia">
      <header className="flex flex-col gap-3">
        {/* Logo originale consegnato da Claudio il 04/11/2026 (non ritoccato). */}
        <Link href={PERCORSI_MUSICA.touchMusicRecords} className="self-start" aria-label="Touch Music Records Channel">
          <img src="/musica/records/touch-music-records-channel.jpe" alt="Touch Music Records Channel" className="h-16 w-auto rounded-lg md:h-20" />
        </Link>
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
          <Sparkles size={14} /> Touch Music Records Channel
        </p>
        <h1 className="tbh-display tbh-h1 leading-none" style={{ color: GIALLO }}>
          Discografia
        </h1>
        <p className="max-w-2xl text-sm text-white/70">
          Tutte le pubblicazioni, dalla più recente. Un servizio compare come disponibile solo dopo la verifica del suo link diretto.
        </p>
        <nav aria-label="Sezioni della discografia" className="flex flex-wrap gap-2 pt-1">
          {SEZIONI.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex min-h-9 items-center rounded-full border border-white/20 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/80 transition hover:border-[#d7ff00] hover:text-[#d7ff00]"
            >
              {s.titolo}
            </a>
          ))}
          <Link
            href={PERCORSI_MUSICA.calendario}
            className="inline-flex min-h-9 items-center rounded-full border px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] transition hover:bg-[#d4af37] hover:text-black"
            style={{ borderColor: ORO, color: ORO }}
          >
            Calendario uscite
          </Link>
        </nav>
      </header>

      <NuoveUsciteDiscografiche conLinkDiscografia={false} />

      {q.isLoading ? (
        <p className="text-sm text-[var(--tbh-muted)]">Caricamento della discografia…</p>
      ) : q.error ? (
        <p className="text-sm text-[#ff9a9a]">Discografia non disponibile in questo momento.</p>
      ) : (
        SEZIONI.map((s) => <Sezione key={s.id} id={s.id} titolo={s.titolo} icona={icone[s.id]} uscite={gruppi[s.id]} vuoto={vuoti[s.id]} />)
      )}

      <p className="text-[12px] text-white/50">
        I singoli di Natale, Capodanno, compleanno e Avvento restano pubblicazioni distinte, ognuna con la sua scheda: non vengono raggruppati in un album.
      </p>

      <CollegamentiMusica titolo="Area musica · collegamenti" />
    </div>
  );
}
