import { Link, useLocation } from "wouter";
import { CalendarDays, Clock, Disc3, ExternalLink, Image as ImageIcon, Library, Music4, Radio, Tv, UserRound } from "lucide-react";

import {
  INFO_PIATTAFORME,
  MESSAGGIO_ATTESA,
  PERCORSI_MUSICA,
  dataLeggibile,
  testoPulsante,
} from "../../api/data/uscite-musicali";
import { useUsciteMusicali, type UscitaPubblica } from "../queries/uscite-musicali";

/* ══════════════════════════════════════════════════════════════════════════════
   USCITE MUSICALI — pezzi comuni (04/11/2026, round 16).
   · PulsantiUscita: un pulsante per ogni indirizzo PRESENTE; nessun indirizzo = «Collegamenti di
     ascolto in arrivo».
   · TabellaLinkUscita: piattaforma, data programmata, disponibilità confermata, ultima verifica.
   · CollegamentiMusica: i collegamenti reciproci fra le pagine esistenti dell'area musica.
   · ElencoUscite: le schede di pubblicazione (pagina dell'artista, Channel Touch Music, Radio).
   ══════════════════════════════════════════════════════════════════════════════ */

const GIALLO = "#d7ff00";
const ORO = "#d4af37";

type LinkPubblico = UscitaPubblica["link"][number];

export const TIPO_LEGGIBILE: Record<string, string> = { singolo: "Singolo", album: "Album" };

/**
 * I pulsanti della pubblicazione.
 * 04/11/2026 (round 17, Claudio: «non mostrare un servizio come disponibile finché non è stato verificato
 * il collegamento diretto») — pulsante cliccabile SOLO per i link con disponibilità confermata; quelli
 * inseriti ma non ancora verificati compaiono come «in verifica», senza collegamento.
 */
export function PulsantiUscita({
  link: tutti,
  messaggioAttesa,
  compatto = false,
}: {
  link: LinkPubblico[];
  messaggioAttesa: string | null;
  compatto?: boolean;
}) {
  const link = tutti.filter((l) => l.disponibilitaConfermata);
  const inVerifica = tutti.filter((l) => !l.disponibilitaConfermata);
  const chipVerifica =
    inVerifica.length > 0 ? (
      <p className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/45" data-testid="uscita-in-verifica">
        In verifica:
        {inVerifica.map((l) => (
          <span key={l.id} className="rounded-full border border-white/15 px-2 py-0.5">
            {l.piattaforma === "altro-store" && l.etichetta ? l.etichetta : INFO_PIATTAFORME[l.piattaforma].nome}
          </span>
        ))}
      </p>
    ) : null;
  if (link.length === 0)
    return (
      <div className="flex flex-col gap-2">
        <p
          className={`inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-dashed px-4 py-2 font-extrabold uppercase tracking-[0.12em] ${compatto ? "text-[10px]" : "text-[11px]"}`}
          style={{ borderColor: `${ORO}99`, color: ORO }}
          data-testid="uscita-attesa"
        >
          <Clock size={13} /> {messaggioAttesa || MESSAGGIO_ATTESA}
        </p>
        {chipVerifica}
      </div>
    );
  const accesso = link.filter((l) => INFO_PIATTAFORME[l.piattaforma].gruppo === "accesso");
  const store = link.filter((l) => INFO_PIATTAFORME[l.piattaforma].gruppo === "store");
  const social = link.filter((l) => INFO_PIATTAFORME[l.piattaforma].gruppo === "social");
  const dim = compatto ? "px-3 py-2 text-[10px]" : "px-4 py-2.5 text-[11px]";
  return (
    <div className="flex flex-col gap-2" data-testid="uscita-pulsanti">
      {accesso.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {accesso.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              data-testid={`pulsante-${l.piattaforma}`}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full font-extrabold uppercase tracking-[0.12em] text-black transition hover:brightness-110 ${dim}`}
              style={{ background: GIALLO }}
            >
              <Disc3 size={13} /> {testoPulsante(l)}
            </a>
          ))}
        </div>
      )}
      {store.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {store.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              data-testid={`pulsante-${l.piattaforma}`}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full border font-extrabold uppercase tracking-[0.12em] transition hover:text-black ${dim} hover:bg-[#d4af37]`}
              style={{ borderColor: ORO, color: ORO }}
            >
              <ExternalLink size={12} /> {testoPulsante(l)}
            </a>
          ))}
        </div>
      )}
      {social.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {social.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              data-testid={`pulsante-${l.piattaforma}`}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-white/25 font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white ${dim}`}
            >
              <ExternalLink size={12} /> {testoPulsante(l)}
            </a>
          ))}
        </div>
      )}
      {chipVerifica}
    </div>
  );
}

/** Stato di un link: confermato, programmato, da confermare. */
function Disponibilita({ l }: { l: LinkPubblico }) {
  if (l.disponibilitaConfermata)
    return <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-black" style={{ background: GIALLO }}>Confermata</span>;
  return (
    <span className="rounded-full border border-white/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/70">
      Da confermare
    </span>
  );
}

/** Piattaforma · data programmata · disponibilità confermata · ultima verifica. */
export function TabellaLinkUscita({ link }: { link: LinkPubblico[] }) {
  if (link.length === 0)
    return <p className="text-sm text-[var(--tbh-muted)]">Nessuna piattaforma ancora registrata: i collegamenti si aggiungono appena disponibili.</p>;
  return (
    <div className="overflow-x-auto" data-testid="tabella-link-uscita">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-white/15 text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-gold)]">
            <th className="py-2 pr-3 font-extrabold">Piattaforma</th>
            <th className="py-2 pr-3 font-extrabold">Data programmata</th>
            <th className="py-2 pr-3 font-extrabold">Disponibilità</th>
            <th className="py-2 font-extrabold">Ultima verifica</th>
          </tr>
        </thead>
        <tbody>
          {link.map((l) => {
            const info = INFO_PIATTAFORME[l.piattaforma];
            return (
              <tr key={l.id} className="border-b border-white/10 align-top">
                <td className="py-2.5 pr-3">
                  {/* Collegamento cliccabile solo dopo la verifica (round 17). */}
                  {l.disponibilitaConfermata ? (
                    <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-white hover:underline">
                      {l.piattaforma === "altro-store" && l.etichetta ? l.etichetta : info.nome}
                      {info.social ? ` · ${l.ambito === "profilo" ? "profilo ufficiale" : "brano"}` : ""}
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="font-bold text-white/70">
                      {l.piattaforma === "altro-store" && l.etichetta ? l.etichetta : info.nome}
                      {info.social ? ` · ${l.ambito === "profilo" ? "profilo ufficiale" : "brano"}` : ""}
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-3 text-white/80">{dataLeggibile(l.dataProgrammata) ?? <span className="text-white/45">da comunicare</span>}</td>
                <td className="py-2.5 pr-3">
                  <Disponibilita l={l} />
                </td>
                <td className="py-2.5 text-white/80">
                  {dataLeggibile(l.ultimaVerifica) ?? <span className="text-white/45">non ancora verificato</span>}
                  {l.notaVerifica && <span className="block text-[11px] text-white/45">{l.notaVerifica}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Le pagine dell'area musica, collegate fra loro (la pagina corrente non si ripete). */
const VOCI_MUSICA = [
  { href: PERCORSI_MUSICA.touchMusicRecords, nome: "Touch Music Records Channel", icona: Disc3 },
  /* 04/11/2026 (round 17) */
  { href: PERCORSI_MUSICA.discografia, nome: "Discografia", icona: Library },
  { href: PERCORSI_MUSICA.radio, nome: "Touch Music Radio", icona: Radio },
  { href: PERCORSI_MUSICA.touchMusicChannel, nome: "Touch Music Channel", icona: Tv },
  { href: PERCORSI_MUSICA.artista, nome: "DJ J.C. Hugò", icona: UserRound },
  { href: PERCORSI_MUSICA.catalogo, nome: "Catalogo musicale", icona: Music4 },
  { href: PERCORSI_MUSICA.calendario, nome: "Calendario uscite", icona: CalendarDays },
] as const;

export function CollegamentiMusica({ titolo = "Area musica", className = "" }: { titolo?: string; className?: string }) {
  const [percorso] = useLocation();
  const voci = VOCI_MUSICA.filter((v) => v.href.split("#")[0] !== percorso || v.href.includes("#"));
  return (
    <nav aria-label={titolo} className={`rounded-2xl border border-white/10 bg-black/60 p-4 ${className}`} data-testid="collegamenti-musica">
      <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ORO }}>
        {titolo}
      </p>
      <ul className="flex flex-wrap gap-2">
        {voci.map((v) => (
          <li key={v.href}>
            <Link
              href={v.href}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white/85 transition hover:border-[#d7ff00] hover:text-[#d7ff00]"
            >
              <v.icona size={13} /> {v.nome}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Copertina dell'uscita: quella vera del brano o la dichiarazione «Cover da caricare». */
export function CopertinaUscita({ src, titolo, className = "" }: { src: string | null; titolo: string; className?: string }) {
  if (!src)
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 bg-black/60 text-center ${className}`}>
        <ImageIcon size={18} className="text-[var(--tbh-muted)]" />
        <span className="px-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">Cover da caricare</span>
      </div>
    );
  return <img src={src} alt={titolo} loading="lazy" className={`object-cover ${className}`} />;
}

export function dataUscitaTesto(u: Pick<UscitaPubblica, "dataUscita">) {
  return dataLeggibile(u.dataUscita) ?? "Data da confermare";
}

/** Le schede di pubblicazione, compatte, con il link alla scheda e al calendario. */
export function ElencoUscite({ titolo = "Uscite · singoli e album", className = "" }: { titolo?: string; className?: string }) {
  const q = useUsciteMusicali();
  const uscite = q.data?.uscite ?? [];
  if (q.isLoading || uscite.length === 0) return null;
  return (
    <section className={`flex flex-col gap-3 ${className}`} data-testid="elenco-uscite">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="tbh-display tbh-h3" style={{ color: GIALLO }}>
          {titolo}
        </h2>
        <Link href={PERCORSI_MUSICA.calendario} className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/70 hover:text-[#d7ff00]">
          Calendario uscite →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {uscite.map((u) => (
          <li key={u.id}>
            <Link
              href={u.scheda}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-2.5 transition hover:border-[#d7ff00]"
              data-testid={`uscita-${u.id}`}
            >
              <CopertinaUscita src={u.brano.cover} titolo={u.brano.titolo} className="h-16 w-16 shrink-0 rounded-lg" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: ORO }}>
                  {TIPO_LEGGIBILE[u.tipo]} · {dataUscitaTesto(u)}
                </span>
                <span className="block truncate font-bold text-white">{u.brano.titolo}</span>
                <span className="block truncate text-[12px] text-white/55">
                  {(() => {
                    const n = u.link.filter((l) => l.disponibilitaConfermata).length;
                    return n ? `${n} piattaform${n === 1 ? "a" : "e"} verificat${n === 1 ? "a" : "e"}` : u.messaggioAttesa || MESSAGGIO_ATTESA;
                  })()}
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d7ff00]">Apri scheda</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
