import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useStruttura, type CardStrutturaWeb, type ChannelStrutturaWeb } from "../queries/struttura";

/* ────────────────────────────────────────────────────────────────────────────
   STRUTTURA COMUNE Home → Canale → Attività → Scheda completa (28/10/2026).

   UN SOLO MODELLO grafico e funzionale, clonato ovunque e personalizzato dai dati:
     · CardModello — logo o immagine ufficiale GRANDE in un riquadro 16:9 nero (intero,
       object-contain, mai ritagliato), titolo SOTTO, l'INTERA scheda è cliccabile
       (un solo collegamento che copre la scheda; un'eventuale seconda azione resta sopra,
       senza link annidati);
     · Briciole — percorso Home › Channel › Attività nelle pagine interne;
     · GrigliaAttivita — le attività di un Channel, ognuna con la sua destinazione UNICA
       (la stessa da qualunque Channel: una sola scheda completa per attività);
     · PercorsoStruttura / AttivitaInPaginaChannel — montati una volta in app.tsx: aggiungono
       percorso e attività alle pagine Channel ESISTENTI senza cambiarne URL né contenuti.
   Nessuna descrizione ripetuta nelle schede: solo immagine, titolo e una riga di tipo.
   ──────────────────────────────────────────────────────────────────────────── */

export const GIALLO = "#d7ff00";
export const ORO = "#d4af37";
export const ROSSO_DM = "#ff2b2b";

export type ImmagineCard = { src: string; larghezza?: number | null; altezza?: number | null } | null;

export function CardModello({
  href,
  esterno = false,
  titolo,
  sotto,
  immagine,
  colore = GIALLO,
  bordo,
  tratteggiato = false,
  angoloSx,
  angoloDx,
  cta,
  secondaria,
  testid,
  testidBox,
  testidLogo,
  dati,
  livelloTitolo = 3,
}: {
  href: string;
  esterno?: boolean;
  titolo: string;
  /** Riga breve sotto il titolo (stato, tipo di attività). */
  sotto?: string | null;
  immagine: ImmagineCard;
  colore?: string;
  /** Colore del bordo a riposo (default: bianco tenue). */
  bordo?: string;
  tratteggiato?: boolean;
  angoloSx?: ReactNode;
  angoloDx?: ReactNode;
  /** Etichetta del pulsante visivo (la scheda intera è il collegamento). */
  cta: string;
  /** Seconda azione facoltativa (es. APRI SCHEDA), cliccabile a parte. */
  secondaria?: { label: string; href: string } | null;
  testid?: string;
  testidBox?: string;
  testidLogo?: string;
  dati?: Record<string, string | undefined>;
  livelloTitolo?: 2 | 3;
}) {
  const H = livelloTitolo === 2 ? "h2" : "h3";
  const etichettaLink = `${cta.charAt(0)}${cta.slice(1).toLowerCase()} · ${titolo}`;
  const classeLink =
    "absolute inset-0 z-[1] rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff00]";
  const dataAttr = Object.fromEntries(Object.entries(dati ?? {}).map(([k, v]) => [`data-${k}`, v]));
  return (
    <article
      className="group relative flex min-w-0 flex-col gap-2.5"
      data-testid={testid}
      data-card-modello={href}
      {...dataAttr}
    >
      <div
        className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border bg-black px-3 text-center transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_30px_-12px_rgba(215,255,0,0.35)] ${
          tratteggiato ? "border-dashed" : ""
        }`}
        style={{ borderColor: bordo ?? "rgba(255,255,255,0.14)", boxShadow: "inset 0 0 0 5px #0d0d0f" }}
        data-testid={testidBox}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-xl border-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ borderColor: colore }}
          aria-hidden
        />
        {angoloSx && <span className="absolute left-2.5 top-2 z-[2] max-w-[60%] truncate text-left text-[9px] font-extrabold tracking-[0.18em]">{angoloSx}</span>}
        {angoloDx && <span className="absolute right-2.5 top-2 z-[2] max-w-[45%] truncate text-right text-[9px] font-extrabold tracking-[0.14em]">{angoloDx}</span>}
        {immagine ? (
          <img
            src={immagine.src}
            alt={`Logo ${titolo}`}
            width={immagine.larghezza ?? undefined}
            height={immagine.altezza ?? undefined}
            loading="lazy"
            decoding="async"
            className="max-h-[80%] max-w-[90%] object-contain"
            data-testid={testidLogo}
          />
        ) : (
          <span className="text-balance px-1 text-[15px] font-black leading-tight tracking-[0.02em] text-white sm:text-base xl:text-[15px]">
            {titolo}
          </span>
        )}
      </div>
      <div className={`flex min-w-0 flex-col items-center gap-0.5 text-center ${immagine ? "min-h-[2.6rem]" : ""}`}>
        {/* Titolo SOTTO il logo. Senza logo il nome è già sulla faccia della scheda: niente doppione. */}
        <H className={immagine ? "text-balance break-words text-[14px] font-black leading-tight tracking-[0.02em] text-white sm:text-[15px]" : "sr-only"}>
          {titolo}
        </H>
        {sotto && (
          <p className="line-clamp-2 text-[9.5px] font-bold uppercase leading-tight tracking-[0.16em] text-white/45">{sotto}</p>
        )}
      </div>
      {secondaria ? (
        <div className="mt-auto grid grid-cols-2 gap-2" data-testid="due-pulsanti">
          <span className="rounded-full py-2 text-center text-[11px] font-extrabold tracking-[0.12em] text-black" style={{ background: colore }} aria-hidden>
            {cta}
            {esterno ? <ExternalLink className="ml-1 inline h-3 w-3 align-[-1px]" /> : null}
          </span>
          <Link
            href={secondaria.href}
            aria-label={`${secondaria.label} · ${titolo}`}
            className="relative z-[2] rounded-full border bg-black py-2 text-center text-[11px] font-extrabold tracking-[0.12em] transition hover:bg-white/10"
            style={{ borderColor: colore, color: colore }}
          >
            {secondaria.label}
          </Link>
        </div>
      ) : (
        <span
          className="mt-auto w-full rounded-full py-2 text-center text-[11px] font-extrabold tracking-[0.14em] text-black transition group-hover:brightness-110"
          style={{ background: colore }}
          aria-hidden
        >
          {cta}
          {esterno ? <ExternalLink className="ml-1 inline h-3 w-3 align-[-1px]" /> : null}
        </span>
      )}
      {esterno ? (
        <a href={href} target="_blank" rel="noreferrer" aria-label={etichettaLink} className={classeLink} data-testid={testid ? `${testid}-link` : undefined} />
      ) : (
        <Link href={href} aria-label={etichettaLink} className={classeLink} data-testid={testid ? `${testid}-link` : undefined} />
      )}
    </article>
  );
}

/* ── PERCORSO ─────────────────────────────────────────────────────────────── */

export type VoceBriciola = { label: string; href?: string | null };

export function Briciole({ voci, destra, className = "" }: { voci: VoceBriciola[]; destra?: ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 ${className}`}>
      <nav aria-label="Percorso" className="min-w-0" data-testid="briciole">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em]">
          {voci.map((v, i) => {
            const ultima = i === voci.length - 1;
            return (
              <li key={`${v.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-white/30" aria-hidden />}
                {v.href && !ultima ? (
                  <Link href={v.href} className="truncate text-white/60 transition hover:text-[#d7ff00]">
                    {v.label}
                  </Link>
                ) : (
                  <span className="truncate" style={{ color: ultima ? GIALLO : undefined }} aria-current={ultima ? "page" : undefined}>
                    {v.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {destra}
    </div>
  );
}

/* ── DATI ─────────────────────────────────────────────────────────────────── */

const CHIAVE_PROVENIENZA = "tbh-percorso-channel";

export const pulito = (u: string) => {
  const senza = u.split("#")[0]!.split("?")[0]!;
  return senza.length > 1 ? senza.replace(/\/$/, "") : senza;
};

export const destinazioneChannel = (c: ChannelStrutturaWeb) => c.pagina ?? c.scheda;

function leggiProvenienza(): string | null {
  try {
    return sessionStorage.getItem(CHIAVE_PROVENIENZA);
  } catch {
    return null;
  }
}
function salvaProvenienza(slug: string) {
  try {
    sessionStorage.setItem(CHIAVE_PROVENIENZA, slug);
  } catch {
    /* sessione privata: il percorso usa il primo Channel */
  }
}

/** Channel che contengono questa destinazione fra le attività (o di cui è la scheda completa). */
export function channelDiAttivita(lista: ChannelStrutturaWeb[], href: string): ChannelStrutturaWeb[] {
  const h = pulito(href);
  const idEntita = h.startsWith("/e/") ? h.slice(3) : null;
  return lista.filter(
    (c) => c.attivita.some((a) => !a.esterno && pulito(a.href) === h) || (idEntita !== null && c.ente?.id === idEntita),
  );
}

/** Il Channel «genitore» da mostrare nel percorso: quello da cui si arriva, se contiene l'attività. */
export function genitoreDi(genitori: ChannelStrutturaWeb[]): ChannelStrutturaWeb | null {
  if (genitori.length === 0) return null;
  const prov = leggiProvenienza();
  return genitori.find((g) => g.slug === prov) ?? genitori[0]!;
}

export function useRicordaChannel(slug: string | null | undefined) {
  useEffect(() => {
    if (slug) salvaProvenienza(slug);
  }, [slug]);
}

/* ── GRIGLIA ATTIVITÀ ─────────────────────────────────────────────────────── */

function ctaAttivita(a: CardStrutturaWeb) {
  if (a.etichetta === "Channel") return "APRI CHANNEL";
  if (a.entita && a.href.startsWith("/e/")) return "APRI SCHEDA";
  return "APRI";
}

export function CardAttivita({ a, colore = GIALLO }: { a: CardStrutturaWeb; colore?: string }) {
  return (
    <CardModello
      href={a.href}
      esterno={a.esterno}
      titolo={a.titolo}
      sotto={a.etichetta}
      immagine={a.immagine}
      colore={colore}
      cta={ctaAttivita(a)}
      testid={`attivita-${pulito(a.href).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`}
    />
  );
}

export function GrigliaAttivita({
  channel,
  mostraVuoto = false,
  conCollegamenti = true,
}: {
  channel: ChannelStrutturaWeb;
  mostraVuoto?: boolean;
  /** Collegamenti alla scheda del Channel e alla scheda completa dell'ente. */
  conCollegamenti?: boolean;
}) {
  const colore = channel.dm ? ROSSO_DM : GIALLO;
  if (channel.attivita.length === 0 && !mostraVuoto) return null;
  return (
    <section className="flex flex-col gap-4" aria-label={`Attività del Channel ${channel.nome}`} data-testid={`attivita-channel-${channel.slug}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-white/10 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: ORO }}>
            Attività del Channel
          </p>
          <h2 className="mt-1 text-balance text-xl font-black text-white md:text-2xl">{channel.nome}</h2>
        </div>
        {conCollegamenti && (
          <div className="flex flex-wrap gap-2 text-[11px] font-extrabold tracking-[0.12em]">
            <Link href={channel.scheda} className="rounded-full border border-white/20 px-3 py-1.5 text-white/75 transition hover:border-[#d7ff00] hover:text-white">
              SCHEDA DEL CHANNEL
            </Link>
            {channel.ente && (
              <Link href={`/e/${channel.ente.id}`} className="rounded-full border px-3 py-1.5 transition hover:bg-white/10" style={{ borderColor: colore, color: colore }}>
                SCHEDA COMPLETA
              </Link>
            )}
          </div>
        )}
      </div>
      {channel.attivita.length === 0 ? (
        <p className="text-sm text-white/55" data-testid="nessuna-attivita">
          Nessuna attività registrata per questo Channel: si aggiungono solo con materiale verificato.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {channel.attivita.map((a) => (
            <CardAttivita key={a.href} a={a} colore={colore} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Channel che presentano questa attività: stessa scheda richiamata da più punti. */
export function PresenteNeiChannel({ canali, titolo = "Presente nei Channel" }: { canali: ChannelStrutturaWeb[]; titolo?: string }) {
  if (canali.length === 0) return null;
  return (
    <section className="flex flex-col gap-4" aria-label={titolo} data-testid="presente-nei-channel">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: ORO }}>
        {titolo}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {canali.map((c) => (
          <CardModello
            key={c.slug}
            href={destinazioneChannel(c)}
            titolo={c.nome}
            immagine={c.logo}
            colore={c.dm ? ROSSO_DM : GIALLO}
            bordo={c.dm ? ROSSO_DM : undefined}
            cta={c.pagina ? "APRI CHANNEL" : "APRI SCHEDA"}
            testid={`presente-${c.slug}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ── MONTATI IN app.tsx ───────────────────────────────────────────────────── */

const ESCLUSI = ["/channel/scheda/", "/e/", "/allestimento", "/check-web", "/pannello", "/admin"];

function usaContesto() {
  const [loc] = useLocation();
  const q = useStruttura();
  const lista = q.data?.channel ?? [];
  const path = pulito(loc);
  const escluso = path === "/" || ESCLUSI.some((p) => path.startsWith(p));
  const channel = escluso ? undefined : lista.find((c) => c.pagina && pulito(c.pagina) === path);
  const genitori = escluso ? [] : channelDiAttivita(lista, path).filter((g) => g.slug !== channel?.slug);
  return { path, lista, escluso, channel, genitori };
}

/** Percorso Home › Channel › Attività sopra le pagine Channel e attività già esistenti. */
/** Pagine con un percorso proprio, deciso da Claudio (28/10/2026: Touch Production → Cinema → Proiezioni). */
const PERCORSO_PROPRIO = ["/channel/touch-cinema"];

export function PercorsoStruttura() {
  const { escluso, channel, genitori, path } = usaContesto();
  useRicordaChannel(channel?.slug);
  if (PERCORSO_PROPRIO.some((p) => path === p || path.startsWith(`${p}/`))) return null;
  if (escluso || (!channel && genitori.length === 0)) return null;
  const genitore = genitoreDi(genitori);
  /* Un Channel che è anche attività di un altro mostra il genitore solo se si arriva da lì. */
  const mostraGenitore = genitore && (!channel || genitore.slug === leggiProvenienza());
  const attivita = genitore?.attivita.find((a) => pulito(a.href) === path);
  const titolo = channel?.nome ?? attivita?.titolo ?? "";
  const altri = channel ? [] : genitori.filter((g) => g.slug !== genitore?.slug);
  return (
    <div className="mx-auto max-w-[1500px] px-4 pt-3 md:px-8" data-testid="percorso-struttura">
      <Briciole
        voci={[
          { label: "Home", href: "/" },
          ...(mostraGenitore ? [{ label: genitore.nome, href: destinazioneChannel(genitore) }] : []),
          { label: titolo },
        ]}
        destra={
          altri.length > 0 ? (
            <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40" data-testid="anche-in">
              Anche in:
              {altri.map((g) => (
                <Link key={g.slug} href={destinazioneChannel(g)} className="text-white/65 hover:text-[#d7ff00]">
                  {g.nome}
                </Link>
              ))}
            </p>
          ) : null
        }
      />
    </div>
  );
}

/** In fondo alle pagine Channel esistenti: le attività del Channel nel modello comune. */
export function AttivitaInPaginaChannel() {
  const { channel } = usaContesto();
  if (!channel || channel.attivita.length === 0) return null;
  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-6 md:px-8" data-testid="attivita-in-pagina">
      <GrigliaAttivita channel={channel} />
    </div>
  );
}
