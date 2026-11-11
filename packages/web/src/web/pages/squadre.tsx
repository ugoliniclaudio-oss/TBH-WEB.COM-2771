import { ExternalLink, Radio } from "lucide-react";
import { Link } from "wouter";
import { useTeams } from "../queries/catalog";
import { useSquadre } from "../queries/portale";
import { MonitorCard, etichettaRete } from "../components/monitor";
import { StemmiMarquee, ordineStemmi } from "../components/stemmi-marquee";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import { trovaKit } from "../lib/kit-societa";
import { TBH, esterno } from "../lib/appartenenza";

/** ELENCO SOCIETÀ SEGUITE — la pagina mostra lo STEMMA di ogni società (file in
 *  /public/teams, estratti dai mockup confermati ufficiali da Claudio il 29/08/2026).
 *  Dove lo stemma non è mai stato ricevuto (RFA) resta il nome per esteso:
 *  nessun logo ricostruito o inventato. */
export default function SquadrePage() {
  const q = useTeams();
  const s = useSquadre();
  /* ORDINE DELLE SOCIETÀ (ordine di Claudio del 28/09/2026): mai casuale e mai
     l'ordine di arrivo dal servizio. Prima chi ha materiale reale (stemma
     ufficiale ricevuto), poi le altre, e a parità l'alfabeto italiano. */
  const squadre = ordineStemmi(s.data?.squadre ?? []);

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Sport · Riviera di Rimini
        </p>
        <h1 className="tbh-display tbh-h1">Squadre Partner</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Le società calcistiche seguite dal gruppo: riprese, produzione video e comunicazione.
          Stemma, nome per esteso, categoria e sito ufficiale — clicca il riquadro per aprire la
          pagina della squadra con monitor, blocchi dati e spazi commerciali.
        </p>
      </header>

      {/* Nastro stemmi alternati con il logo DM. Ordine FISSO (28/09/2026): prima le
          società con stemma ufficiale, poi l'alfabeto — niente più random a ogni visita.
          Dal 16/10/2026 il Rimini Calcio entra nel nastro, sempre in coda a tutte le altre. */}
      <div className="-mx-4 md:-mx-8 mb-10">
        <StemmiMarquee squadre={squadre} />
      </div>

      <section className="mb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <h2 className="tbh-display tbh-h2">Stemmi e pagine società</h2>
          <span className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">
            {squadre.length ? `${squadre.length} società seguite` : "caricamento…"}
          </span>
        </div>

        {s.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="tbh-card h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {squadre.map((t) => (
              <MonitorCard
                key={t.slug}
                nome={t.nome}
                logo={t.logo}
                apriPagina={`/sport/squadre/${t.slug}`}
                colore={t.colore}
                sottotitolo={t.categoria ?? t.citta}
                badge={t.gruppo ? "TBH Official" : null}
                /* Appartenenza REALE: società del gruppo = TBH; le altre sono società
                   seguite (soggetti esterni), mai marchiate TBH. */
                appartenenza={
                  t.gruppo
                    ? (trovaKit(t.slug)?.appartenenza ?? TBH)
                    : esterno(t.territorio ? "Società di interesse del territorio" : "Società seguita")
                }
                anteprima={t.gruppo ? (trovaKit(t.slug)?.materiali.logoPulsante ?? null) : null}
                esterni={[
                  ...(t.sito ? [{ etichetta: "Sito ufficiale", url: t.sito }] : []),
                  ...t.social.map((so) => ({ etichetta: etichettaRete(so.rete), url: so.url })),
                ]}
                sigillo={
                  t.seguitaDaDm
                    ? { testo: "Squadra seguita da DM", logo: t.dmLogo, to: "/dm" }
                    : null
                }
                nota={
                  t.logo
                    ? null
                    : "Stemma ufficiale non ancora ricevuto: nessuna ricostruzione grafica."
                }
              />
            ))}
          </div>
        )}

        <p className="text-xs text-[var(--tbh-muted)] mt-4 max-w-4xl">
          {s.data?.nota}
        </p>
        <p className="text-xs text-[var(--tbh-muted)] mt-2 max-w-4xl">
          I loghi delle 9 squadre con Channel sono gli originali consegnati dall'editore e approvati
          il 19/10/2026, mostrati interi e senza modifiche. Junior Gambettola non ha ancora un logo.
          Se uno stemma non corrisponde, basta inviare il file e viene sostituito.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/sport"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Area Sport
          </Link>
          <Link
            href="/dm"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            DM Comunicazioni
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="tbh-display tbh-h2 mb-2">Schede societarie e siti ufficiali</h2>
        <p className="text-[var(--tbh-muted)] mb-6 max-w-3xl">
          Anagrafica sintetica con ruolo del gruppo, campo di gioco e sito o canale ufficiale.
        </p>
        {q.isLoading ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="tbh-card h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(q.data?.teams ?? []).map((t) => (
              <article key={t.slug} className="tbh-card p-5 flex flex-col gap-2">
                <h3 className="tbh-display tbh-h3 leading-tight">{t.name}</h3>
                <p className="text-xs tracking-wide text-[var(--tbh-gold)] uppercase">{t.role}</p>
                {t.note && <p className="text-sm text-[var(--tbh-muted)] grow">{t.note}</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={`/sport/squadre/${t.slug}`}
                    className="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide text-black bg-[var(--tbh-neon)]"
                  >
                    Apri pagina
                  </Link>
                  {t.site && (
                    <a
                      href={t.site}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
                    >
                      Sito ufficiale <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="tbh-display tbh-h2 mb-2">Media partner sportivi</h2>
        <p className="text-[var(--tbh-muted)] mb-6 max-w-3xl">
          I programmi di Daniele Manuelli / DM TV in cui il gruppo opera come videoperatore.
          Repliche TV su canale 88 (Made in Bo).
        </p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {(q.data?.media ?? []).map((m) => (
            <a
              key={m.name}
              href={m.site}
              target="_blank"
              rel="noreferrer"
              className="tbh-card p-5 hover:border-[var(--tbh-neon)] transition flex flex-col gap-2"
            >
              <Radio className="text-[var(--tbh-neon)]" />
              <h3 className="tbh-display text-xl">{m.name}</h3>
              <span className="text-xs text-[var(--tbh-gold)] uppercase tracking-wide">
                {m.schedule}
              </span>
              <p className="text-sm text-[var(--tbh-muted)] grow">{m.note}</p>
              <span className="text-sm font-semibold text-[var(--tbh-neon)] inline-flex items-center gap-2">
                Apri canale <ExternalLink size={15} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="dm-sport-squadre" />
      </div>
    </div>
  );
}
