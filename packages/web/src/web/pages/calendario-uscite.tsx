import { Link } from "wouter";
import { CalendarDays } from "lucide-react";

import { useUsciteMusicali, type UscitaPubblica } from "../queries/uscite-musicali";
import { CollegamentiMusica, CopertinaUscita, PulsantiUscita, TIPO_LEGGIBILE, dataUscitaTesto } from "../components/uscite-musicali";
import { PERCORSI_MUSICA } from "../../api/data/uscite-musicali";
import { useAnteprimaPagina } from "../lib/anteprima-pagina";

/**
 * CALENDARIO USCITE — /musica/calendario-uscite (04/11/2026, round 16).
 * Le schede di pubblicazione con data, raggruppate per mese; poi quelle «Data da confermare».
 * Ogni voce porta alla scheda del brano. Le date sono solo quelle inserite a mano.
 */

const GIALLO = "#d7ff00";
const ORO = "#d4af37";

function meseDi(d: string) {
  const [a, m] = d.split("-");
  const t = new Date(Number(a), Number(m) - 1, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function Voce({ u }: { u: UscitaPubblica }) {
  return (
    <li className="tbh-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center" data-testid={`calendario-${u.id}`}>
      <Link href={u.scheda} className="shrink-0">
        <CopertinaUscita src={u.brano.cover} titolo={u.brano.titolo} className="h-24 w-24 rounded-xl" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: ORO }}>
          {TIPO_LEGGIBILE[u.tipo]} · {dataUscitaTesto(u)}
        </p>
        <Link href={u.scheda} className="font-bold leading-tight text-white hover:text-[#d7ff00]">
          {u.brano.titolo}
        </Link>
        {u.brano.artista && <p className="text-[12px] text-white/60">{u.brano.artista}</p>}
        <PulsantiUscita link={u.link} messaggioAttesa={u.messaggioAttesa} compatto />
      </div>
      <Link
        href={u.scheda}
        className="inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black"
        style={{ background: GIALLO }}
      >
        Apri scheda
      </Link>
    </li>
  );
}

export default function CalendarioUscitePage() {
  const q = useUsciteMusicali();
  useAnteprimaPagina({
    titolo: "Calendario uscite · Touch Music Records · TBH-WEB",
    descrizione: "Singoli e album di DJ J.C. Hugò: date di uscita e collegamenti alle piattaforme.",
  });
  const uscite = q.data?.uscite ?? [];
  const datate = uscite.filter((u) => !!u.dataUscita);
  const daConfermare = uscite.filter((u) => !u.dataUscita);
  const mesi = new Map<string, UscitaPubblica[]>();
  for (const u of datate) {
    const k = u.dataUscita!.slice(0, 7);
    mesi.set(k, [...(mesi.get(k) ?? []), u]);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:py-12" data-testid="calendario-uscite">
      {/* Il percorso (Home › Touch Music Channel › Calendario uscite) lo mostra già la barra del sito:
          questa pagina è fra i collegamenti dei Channel musica. */}
      <header className="flex flex-col gap-2">
        {/* Loghi consegnati da Claudio il 04/11/2026 (file originali, non ritoccati). */}
        <Link href={PERCORSI_MUSICA.touchMusicRecords} className="flex flex-wrap items-center gap-3 self-start" aria-label="Touch Music Records Channel">
          <img src="/musica/records/touch-music-records-channel.jpe" alt="Touch Music Records Channel" className="h-16 w-auto rounded-lg md:h-20" />
        </Link>
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
          <CalendarDays size={14} /> Touch Music Records
        </p>
        <h1 className="tbh-display tbh-h1 leading-none" style={{ color: GIALLO }}>
          Calendario uscite
        </h1>
        <p className="max-w-2xl text-sm text-white/70">
          Singoli e album con la loro scheda. Le date compaiono solo quando sono ufficiali; i pulsanti solo quando il collegamento esiste.
        </p>
      </header>

      {q.isLoading ? (
        <p className="text-[var(--tbh-muted)]">Caricamento…</p>
      ) : uscite.length === 0 ? (
        <p className="text-[var(--tbh-muted)]">Nessuna uscita in calendario.</p>
      ) : (
        <>
          {[...mesi.entries()].map(([k, l]) => (
            <section key={k} className="flex flex-col gap-3" data-testid={`mese-${k}`}>
              <h2 className="tbh-display tbh-h3" style={{ color: GIALLO }}>
                {meseDi(k)}
              </h2>
              <ul className="flex flex-col gap-3">
                {l.map((u) => (
                  <Voce key={u.id} u={u} />
                ))}
              </ul>
            </section>
          ))}
          {daConfermare.length > 0 && (
            <section className="flex flex-col gap-3" data-testid="da-confermare">
              <h2 className="tbh-display tbh-h3" style={{ color: GIALLO }}>
                Data da confermare
              </h2>
              <ul className="flex flex-col gap-3">
                {daConfermare.map((u) => (
                  <Voce key={u.id} u={u} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <CollegamentiMusica titolo="Area musica · collegamenti" />
    </div>
  );
}
