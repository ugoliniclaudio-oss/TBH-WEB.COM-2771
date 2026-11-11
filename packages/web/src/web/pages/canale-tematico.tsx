import { Link } from "wouter";
import { ExternalLink, FileText, Image as ImageIcon, BookOpen, Loader2 } from "lucide-react";
import { useCanaleTematico, useCanaliTematici } from "../queries/canali-tematici";
import { PlayerCanaleTematico } from "../components/canale-tematico-player";
import { ScalettaCanaleTematico, testoDurata } from "../components/canale-tematico-scaletta";

/**
 * /canali/:slug — CANALE TEMATICO (Touch Music · Touch Influencity Magazine · Arm Wrestling e quelli
 * aggiunti dal pannello). Usata anche da /arm-wrestling (URL invariato).
 * Logo = file ufficiale consegnato (mai ridisegnato). Nessun contenuto dimostrativo.
 */

const GIALLO = "#d7ff00";

const STATO: Record<string, { testo: string; pieno: boolean }> = {
  allestimento: { testo: "IN ALLESTIMENTO", pieno: false },
  attivo: { testo: "ATTIVO", pieno: true },
  "non-disponibile": { testo: "TEMPORANEAMENTE NON DISPONIBILE", pieno: false },
};

export function BadgeStatoCanale({ stato }: { stato: string }) {
  const s = STATO[stato] ?? STATO.allestimento!;
  const grigio = stato === "non-disponibile";
  return (
    <span
      className="inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-[0.2em]"
      style={{
        borderColor: grigio ? "rgba(255,255,255,.4)" : GIALLO,
        color: s.pieno ? "#000" : grigio ? "rgba(255,255,255,.75)" : GIALLO,
        background: s.pieno ? GIALLO : "transparent",
      }}
      data-testid="stato-canale"
    >
      {s.testo}
    </span>
  );
}

function LogoCanale({ src, nome, grande = false }: { src: string | null; nome: string; grande?: boolean }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={nome}
      className={`${grande ? "max-h-40 md:max-h-52" : "max-h-24"} w-auto max-w-full object-contain`}
      loading="eager"
      decoding="async"
    />
  );
}

const ICONA: Record<string, typeof FileText> = { articolo: FileText, immagine: ImageIcon, numero: BookOpen };
const NOME_TIPO: Record<string, string> = { articolo: "ARTICOLO", immagine: "IMMAGINE", numero: "NUMERO DEL MAGAZINE" };

export default function CanaleTematicoPage({ slug, riserva }: { slug: string; riserva?: React.ReactNode }) {
  const q = useCanaleTematico(slug);
  const c = q.data?.canale;

  if (q.isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white/60">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!c && riserva && !q.isError) return <>{riserva}</>;
  if (!c)
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[900px] flex-col items-center justify-center gap-4 px-4 text-center" data-testid="tematico-assente">
        <h1 className="tbh-display tbh-h2 text-white">Canale non disponibile</h1>
        <p className="text-sm text-white/60">{q.isError ? "Il catalogo non risponde: riprova tra poco." : "Questo canale non è online."}</p>
        <Link href="/canali" className="text-sm underline" style={{ color: GIALLO }}>
          Tutti i canali tematici
        </Link>
      </div>
    );

  const video = q.data?.video ?? [];
  const schede = q.data?.schede ?? [];

  return (
    <div className="bg-black pb-16 text-white" data-testid={`tematico-${c.slug}`}>
      <div className="mx-auto flex max-w-[1300px] flex-col gap-8 px-4 pt-8 md:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold tracking-[0.16em] text-white/50">
          <Link href="/channel" className="hover:text-white">
            CHANNEL
          </Link>
          <span>/</span>
          <Link href="/canali" className="hover:text-white" style={{ color: GIALLO }}>
            CANALI TEMATICI
          </Link>
        </nav>

        <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-8">
          <LogoCanale src={c.logo} nome={c.nome} grande />
          <div className="flex flex-col gap-2">
            <h1 className="tbh-display tbh-h1 leading-[0.95]">{c.nome}</h1>
            <p className="max-w-2xl text-sm text-white/65">{c.descrizione}</p>
            <div className="flex flex-wrap items-center gap-2">
              <BadgeStatoCanale stato={c.stato} />
              {video.length > 0 && (
                <span className="text-[11px] text-white/50">
                  {c.riproduzione === "sequenza"
                    ? `${video.length} video in sequenza · ${testoDurata(q.data?.durataTotaleSec)}${c.cicloH24 ? " · ciclo continuo H24" : ""}`
                    : `${video.length} video in rotazione casuale`}
                </span>
              )}
            </div>
          </div>
        </header>

        {c.stato === "non-disponibile" ? (
          <Schermata nome={c.nome} logo={c.logo} testo="Canale temporaneamente non disponibile — torna a trovarci a breve." />
        ) : video.length === 0 ? (
          <Schermata nome={c.nome} logo={c.logo} testo="Canale in allestimento — nuovi contenuti in arrivo" />
        ) : c.riproduzione === "sequenza" ? (
          <ScalettaCanaleTematico
            slug={c.slug}
            nome={c.nome}
            video={video}
            campi={c.campi}
            ciclo={c.cicloH24}
            secondiImmagine={c.secondiImmagine}
            durataTotaleSec={q.data?.durataTotaleSec ?? 0}
            senzaDurata={q.data?.senzaDurata ?? 0}
          />
        ) : (
          <PlayerCanaleTematico slug={c.slug} video={video} campi={c.campi} />
        )}

        {schede.length > 0 && (
          <section className="flex flex-col gap-4" data-testid="tematico-schede">
            <h2 className="tbh-display tbh-h3">Dal magazine</h2>
            <p className="text-xs text-white/50">Articoli, immagini e numeri del magazine: si consultano qui, non vanno in onda come video.</p>
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {schede.map((s) => {
                const Ic = ICONA[s.tipo] ?? FileText;
                const numero = s.campi.numero;
                const linkNumero = s.campi.linkNumero;
                return (
                  <article key={s.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    {s.miniatura ? (
                      <img src={s.miniatura} alt="" className="aspect-[4/3] w-full bg-black object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-white/[0.04] text-white/30">
                        <Ic className="h-8 w-8" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-1.5 p-4">
                      <span className="text-[10px] font-extrabold tracking-[0.18em]" style={{ color: GIALLO }}>
                        {NOME_TIPO[s.tipo] ?? s.tipo.toUpperCase()}
                      </span>
                      <h3 className="text-sm font-bold leading-snug">{s.titolo}</h3>
                      {(s.campi.protagonista || s.campi.argomento) && (
                        <p className="text-[11px] text-white/60">{[s.campi.protagonista, s.campi.argomento].filter(Boolean).join(" · ")}</p>
                      )}
                      {numero &&
                        (linkNumero ? (
                          <a href={linkNumero} className="text-[11px] underline" style={{ color: GIALLO }}>
                            Numero {numero}
                          </a>
                        ) : (
                          <p className="text-[11px] text-white/60">Numero {numero}</p>
                        ))}
                      <a href={s.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-1 pt-2 text-[11px] text-white/60 underline hover:text-white">
                        {s.fonte ?? "Fonte"} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Schermata({ nome, logo, testo }: { nome: string; logo: string | null; testo: string }) {
  return (
    <div
      className="relative flex aspect-video min-h-[260px] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-white/10 px-6 text-center"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(215,255,0,.10), rgba(0,0,0,0) 60%), #050505" }}
      data-testid="tematico-allestimento"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 4px)" }} />
      <LogoCanale src={logo} nome={nome} />
      <p className="tbh-display text-2xl text-white md:text-4xl">{nome}</p>
      <p className="max-w-xl text-sm font-semibold tracking-[0.04em] md:text-base" style={{ color: GIALLO }}>
        {testo}
      </p>
    </div>
  );
}

/** /canali — indice dei canali tematici accesi. */
export function CanaliTematiciPage() {
  const q = useCanaliTematici();
  const canali = q.data?.canali ?? [];
  return (
    <div className="bg-black pb-16 text-white" data-testid="canali-tematici">
      <div className="mx-auto flex max-w-[1300px] flex-col gap-6 px-4 pt-8 md:px-8">
        <header className="flex flex-col gap-2">
          <p className="text-[11px] font-extrabold tracking-[0.3em] text-white/50">TBH · CHANNEL</p>
          <h1 className="tbh-display tbh-h1" style={{ color: GIALLO }}>
            CANALI TEMATICI
          </h1>
          <p className="max-w-2xl text-sm text-white/60">
            Ogni canale ha il suo catalogo e una playlist casuale creata per ciascuno spettatore. Non sono dirette sincronizzate.
          </p>
        </header>
        {q.isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {canali.map((c) => (
            <Link
              key={c.slug}
              href={c.pagina === "/arm-wrestling" ? "/arm-wrestling" : `/canali/${c.slug}`}
              className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#d7ff00]"
              data-testid={`canale-tematico-${c.slug}`}
            >
              <div className="flex h-36 items-center justify-center rounded-xl bg-black p-3">
                {c.logo ? <img src={c.logo} alt={c.nome} className="max-h-full w-auto max-w-full object-contain" loading="lazy" decoding="async" /> : <span className="tbh-display text-2xl">{c.nome}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-base font-extrabold">{c.nome}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <BadgeStatoCanale stato={c.stato} />
                  <span className="text-[11px] text-white/50">
                    {c.video} video{c.schede ? ` · ${c.schede} schede` : ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Striscia compatta per le pagine esistenti (/channel, /influencity, schede Channel). */
export function StrisciaCanaliTematici({ solo }: { solo?: string[] }) {
  const q = useCanaliTematici();
  const canali = (q.data?.canali ?? []).filter((c) => !solo || solo.includes(c.slug) || (c.slugRegistro && solo.includes(c.slugRegistro)));
  if (!canali.length) return null;
  return (
    <div className="flex flex-wrap gap-3" data-testid="striscia-tematici">
      {canali.map((c) => (
        <Link
          key={c.slug}
          href={c.pagina === "/arm-wrestling" ? "/arm-wrestling" : `/canali/${c.slug}`}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 py-2 pl-2 pr-4 transition hover:border-[#d7ff00]"
        >
          {c.logo && <img src={c.logo} alt="" className="h-10 w-auto max-w-[110px] object-contain" loading="lazy" decoding="async" />}
          <span className="flex flex-col">
            <span className="text-xs font-extrabold text-white">{c.nome}</span>
            <span className="text-[10px] tracking-[0.12em] text-white/50">
              {STATO[c.stato]?.testo ?? ""} · {c.video} video
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
