import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CalendarDays,
  FileText,
  Info,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";

import { HeroSezione } from "../components/hero-sezione";
import { useKitMissCool } from "../queries/miss-cool";
import { CaroselloOrizzontale } from "../components/carosello-orizzontale";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/* ────────────────────────────────────────────────────────────────────────────
   TOUCH MISS COOL — PAGINA MASTER DEL CONCORSO.

   Sostituisce la vecchia scheda brand «in allestimento» a questo stesso
   indirizzo (ordine di Claudio del 28/09/2026). L'indirizzo non cambia: era
   già linkato da dieci punti del sito e resta valido.

   TRE REGOLE, VISIBILI A SCHERMO
   1. Nessun importo inventato. Compensi, gettoni, premi ed esclusive arrivano
      dal Kit come «DA DEFINIRE» e in pagina si leggono così, con la nota che
      spiega perché: il cachet dipende dall'evento e dalla sua tipologia.
   2. Nessuna candidata finta. Il contatore delle candidature legge il database
      vero, che parte da zero.
   3. Nessun pulsante morto. Una sezione del Kit senza pagina reale non è
      cliccabile e dice che è in allestimento.

   CORREZIONE DI CONTENUTO: il Kit 2027 parla solo al femminile. La dicitura
   «Miss & Mister Cool» che stava qui prima non è nel Kit ed è stata rimossa.
   ──────────────────────────────────────────────────────────────────────────── */

const ORO = "#e2c37a";

/** Un valore economico non ancora deliberato si scrive così, mai con un numero. */
function Importo({ valore }: { valore: string }) {
  const daDefinire = valore.trim().toUpperCase() === "DA DEFINIRE";
  return (
    <span
      className={
        daDefinire
          ? "rounded border border-dashed border-white/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]"
          : "font-extrabold text-[var(--tbh-neon)]"
      }
    >
      {valore}
    </span>
  );
}

function coloreFascia(fascia: string): string {
  if (fascia === "PLATINUM") return "#dfe4ea";
  if (fascia === "DIAMOND") return "#8fd4ff";
  if (fascia === "GOLD") return ORO;
  if (fascia.startsWith("SILVER")) return "#c2c8d0";
  return "#c98b5e";
}

export default function MissCoolPage() {
  const q = useKitMissCool();
  const d = q.data;

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <p className="tbh-body text-[var(--tbh-muted)]">Carico il Kit del concorso…</p>
      </div>
    );
  }

  if (q.isError || !d) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">TOUCH MISS COOL</h1>
        <p className="tbh-body mt-4 text-[var(--tbh-muted)]">
          Il Kit del concorso non è raggiungibile in questo momento. Nessun contenuto viene
          mostrato al suo posto.
        </p>
      </div>
    );
  }

  const c = d.concorso;

  return (
    <div>
      <HeroSezione
        occhiello={`TBH / CONCORSI · EDIZIONE ${c.edizione}`}
        titolo="TOUCH MISS COOL"
        evidenza={c.titoloWeb}
        sottotitolo={c.claim}
        testo={c.descrizione}
        colore={ORO}
        slotImmagine="hero:miss-cool"
        azioni={[
          { label: "Candidati ora", to: "/eventi/miss-cool/adesione", primaria: true },
          { label: "Regolamento", to: "/eventi/miss-cool/regolamento" },
          { label: "Le 11 premiazioni", to: "/eventi/miss-cool/premiazioni" },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-14">
        {/* ── LA NOTA CHE GOVERNA TUTTA LA PAGINA ───────────────────────── */}
        <section className="tbh-rise rounded-2xl border border-dashed border-[var(--tbh-line)] bg-white/[0.03] p-5 md:p-6">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
            <AlertTriangle size={15} aria-hidden /> Compensi e premi: da definire
          </p>
          <p className="tbh-body mt-2 max-w-4xl text-[var(--tbh-muted)]">{c.notaCompensi}</p>
        </section>

        {/* ── I DUE PERCORSI ────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="tbh-display tbh-h2">{c.occhiello.toUpperCase()}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {d.percorsi.map((p) => (
              <article
                key={p.slug}
                className="rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-5 md:p-6"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
                  Percorso {p.slug === "live" ? "live" : "web"}
                </p>
                <h3 className="tbh-display mt-1 text-xl md:text-2xl">{p.nome}</h3>
                <ol className="mt-4 flex flex-wrap gap-2">
                  {p.passi.map((passo, i) => (
                    <li
                      key={passo}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[12px]"
                    >
                      <span className="font-extrabold" style={{ color: ORO }}>
                        {i + 1}
                      </span>
                      {passo}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className="tbh-body mt-4 flex items-start gap-2 text-[var(--tbh-muted)]">
            <Sparkles size={16} className="mt-1 shrink-0" style={{ color: ORO }} aria-hidden />
            {d.convergenza}
          </p>
        </section>

        {/* ── LE OTTO SEZIONI DEL KIT ───────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="tbh-display tbh-h2">LE SEZIONI DEL CONCORSO</h2>
          <p className="tbh-body mt-2 max-w-4xl text-[var(--tbh-muted)]">
            Le otto sezioni previste dal Kit. Quelle già pronte si aprono; quelle ancora da
            definire restano dichiarate e non cliccabili — nessun pulsante che non porta a niente.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {d.sezioni.map((s) => {
              const dentro = (
                <>
                  <p className="tbh-display text-base md:text-lg">{s.titolo}</p>
                  <p className="mt-1 text-[12px] text-[var(--tbh-muted)]">{s.cosa}</p>
                  {s.href ? (
                    <p
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.12em]"
                      style={{ color: ORO }}
                    >
                      Apri <ArrowRight size={13} aria-hidden />
                    </p>
                  ) : (
                    <p className="mt-3 inline-block rounded border border-dashed border-white/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                      In allestimento
                    </p>
                  )}
                </>
              );
              const base =
                "rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-4 text-left transition";
              return s.href ? (
                <Link key={s.slug} to={s.href} className={`${base} hover:border-white/40 hover:bg-white/[0.05]`}>
                  {dentro}
                </Link>
              ) : (
                <div key={s.slug} className={`${base} opacity-70`}>
                  {dentro}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── LE 11 PREMIAZIONI, IN SINTESI ─────────────────────────────── */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="tbh-display tbh-h2">LE 11 PREMIAZIONI</h2>
              <p className="tbh-body mt-2 max-w-4xl text-[var(--tbh-muted)]">
                Undici incarichi annuali. Dalla 12ª in poi si entra fra le{" "}
                <strong className="text-white">{d.officialCandidate.titolo}</strong>.
              </p>
            </div>
            <Link
              to="/eventi/miss-cool/premiazioni"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] transition hover:border-white/50"
            >
              Tutte le premiazioni <ArrowRight size={14} aria-hidden />
            </Link>
          </div>

          <CaroselloOrizzontale etichetta="Le 11 premiazioni del concorso" className="mt-5">
            {d.classifica.map((p) => {
              const col = coloreFascia(p.fascia);
              return (
                <article
                  key={p.posizione}
                  className="w-[260px] shrink-0 rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-4"
                  style={{ borderTop: `3px solid ${col}` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="tbh-display text-2xl" style={{ color: col }}>
                      {p.posizione}ª
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em]"
                      style={{ background: `${col}22`, color: col }}
                    >
                      {p.fascia}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-snug">{p.incarico}</p>
                  <p className="mt-1 text-[12px] text-[var(--tbh-muted)]">{p.ruolo}</p>
                  <dl className="mt-3 space-y-1.5 border-t border-[var(--tbh-line)] pt-3 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-[var(--tbh-muted)]">Compenso</dt>
                      <dd>
                        <Importo valore={p.compensoFisso} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-[var(--tbh-muted)]">Gettone</dt>
                      <dd>
                        <Importo valore={p.gettonePresenza} />
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </CaroselloOrizzontale>

          <div className="mt-4 rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
              {d.officialCandidate.titolo} · {d.officialCandidate.da}
            </p>
            <p className="tbh-body mt-2 text-[var(--tbh-muted)]">{d.officialCandidate.spiegazione}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {d.officialCandidate.cosaRicevono.map((x) => (
                <li
                  key={x}
                  className="rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[12px]"
                >
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-[var(--tbh-muted)]">{d.officialCandidate.notaPremio}</p>
          </div>

          <p className="tbh-body mt-4 flex items-start gap-2 text-[var(--tbh-muted)]">
            <Award size={16} className="mt-1 shrink-0" style={{ color: ORO }} aria-hidden />
            {d.magazinePerTutte}
          </p>
        </section>

        {/* ── ROADMAP ───────────────────────────────────────────────────── */}
        <section className="mt-14" id="calendario">
          <h2 className="tbh-display tbh-h2">
            <CalendarDays size={22} className="mb-1 mr-2 inline" style={{ color: ORO }} aria-hidden />
            IL PERCORSO DELL'EDIZIONE {c.edizione}
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {d.roadmap.map((t, i) => (
              <li
                key={t.periodo}
                className="rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-4"
              >
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: ORO }}>
                  Tappa {i + 1}
                </p>
                <p className="tbh-display mt-1 text-base">{t.periodo}</p>
                <p className="mt-1 text-[13px] text-[var(--tbh-muted)]">{t.cosa}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-[12px] text-[var(--tbh-muted)]">
            <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
            {d.roadmapNota}
          </p>
        </section>

        {/* ── CANDIDATURE: IL NUMERO VERO ───────────────────────────────── */}
        <section className="mt-14 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-5 md:p-6">
            <h2 className="tbh-display text-xl md:text-2xl">
              <Users size={20} className="mb-1 mr-2 inline" style={{ color: ORO }} aria-hidden />
              CANDIDATURE RICEVUTE
            </h2>
            <div className="mt-4 flex flex-wrap gap-6">
              <div>
                <p className="tbh-display text-4xl" style={{ color: ORO }}>
                  {d.candidature.totali}
                </p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                  ricevute
                </p>
              </div>
              <div>
                <p className="tbh-display text-4xl">{d.candidature.pubblicate}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                  schede pubblicate
                </p>
              </div>
            </div>
            <p className="mt-4 text-[12px] text-[var(--tbh-muted)]">
              Sono i numeri reali del registro candidature: partono da zero e crescono solo con le
              domande effettivamente inviate. Nessun profilo di esempio viene pubblicato.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/eventi/miss-cool/adesione" className="tbh-neon-btn px-5 py-2.5 text-sm">
                Compila la domanda
              </Link>
              <Link
                to="/eventi/miss-cool/schede"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-white/50"
              >
                Vedi le candidate
              </Link>
            </div>
          </div>

          {/* ── CONTATTI UFFICIALI ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-5 md:p-6">
            <h2 className="tbh-display text-xl">CONTATTI DEL CONCORSO</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href={`https://wa.me/${c.contatti.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-[var(--tbh-neon)]"
                >
                  <MessageCircle size={16} aria-hidden /> WhatsApp {c.contatti.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${c.contatti.telefonoItalia.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 transition hover:text-[var(--tbh-neon)]"
                >
                  <Phone size={16} aria-hidden /> {c.contatti.telefonoItalia}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${c.contatti.email}`}
                  className="inline-flex items-center gap-2 transition hover:text-[var(--tbh-neon)]"
                >
                  <Mail size={16} aria-hidden /> {c.contatti.email}
                </a>
              </li>
              {c.contatti.emailCollegata && (
                <li className="border-t border-[var(--tbh-line)] pt-2">
                  <p className="inline-flex items-center gap-2 text-[var(--tbh-muted)]">
                    <Mail size={16} aria-hidden /> {c.contatti.emailCollegata}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--tbh-muted)]">
                    {c.contatti.emailCollegataNota}
                  </p>
                </li>
              )}
            </ul>
            <a
              href={c.kitPdf}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] transition hover:border-white/50"
            >
              <FileText size={14} aria-hidden /> Kit digitale {c.edizione} (PDF)
            </a>
          </div>
        </section>

        {/* ── LE SLIDE DEL KIT ──────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="tbh-display tbh-h2">IL KIT DIGITALE {c.edizione}</h2>
          <p className="tbh-body mt-2 max-w-4xl text-[var(--tbh-muted)]">
            Le {d.slide.length} pagine del Kit ufficiale, così come sono state approvate.
          </p>
          <CaroselloOrizzontale etichetta="Le pagine del Kit digitale" className="mt-5">
            {d.slide.map((s) => (
              <figure
                key={s.n}
                className="w-[300px] shrink-0 overflow-hidden rounded-2xl border border-[var(--tbh-line)] bg-black"
              >
                <img
                  src={s.immagine}
                  alt={`Kit Touch Miss Cool ${c.edizione}, pagina ${s.n}: ${s.titolo}`}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
                <figcaption className="p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: ORO }}>
                    {s.n}. {s.sezione}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-[var(--tbh-muted)]">{s.titolo}</p>
                </figcaption>
              </figure>
            ))}
          </CaroselloOrizzontale>
        </section>

        {/* ── NOTA DI CANTIERE ──────────────────────────────────────────── */}
        <section className="mt-12 rounded-2xl border border-dashed border-[var(--tbh-line)] bg-white/[0.03] p-5">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
            <Info size={15} aria-hidden /> Stato del documento
          </p>
          <p className="tbh-body mt-2 max-w-4xl text-[var(--tbh-muted)]">{c.notaBozza}</p>
        </section>
      </div>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="miss-cool-tappe" />
        <SezioneAmministrabile sezione="miss-cool-web" sblocco={false} />
      </div>
    </div>
  );
}
