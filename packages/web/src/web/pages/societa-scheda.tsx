import { Link } from "wouter";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Stamp,
  Target,
} from "lucide-react";
import { useCompanies } from "../queries/catalog";
import { LogoBox } from "../components/tiles";
import { wa, WA_NUMERO } from "../lib/whatsapp";
import { slideKit, spaziKit, trovaKit, type KitSocieta } from "../lib/kit-societa";
import { TBH } from "../lib/appartenenza";
import { Appartiene } from "../components/appartiene";
import { GalleriaSlide } from "../components/galleria-slide";

/* ────────────────────────────────────────────────────────────────────────────
   PAGINA DEDICATA DI OGNI SOCIETÀ / ATTIVITÀ — /tbh/societa/:codice
   Mostra il KIT UFFICIALE (lib/kit-societa.ts): logo pulsante, scheda ufficiale,
   timbro e firma, annunci di lavoro, articoli negozio. Quello che non è ancora
   arrivato resta dichiarato «in arrivo» / «in allestimento»: niente di inventato.
   ──────────────────────────────────────────────────────────────────────────── */

const ANCORE: Record<string, string> = {
  logo: "#logo",
  pulsante: "#scheda-ufficiale",
  scheda: "#scheda-ufficiale",
  timbro: "#timbro-firma",
  lavoro: "#lavora-con-noi",
  negozio: "#negozio",
};

function StatoKit({ kit }: { kit: KitSocieta | null }) {
  return (
    <nav aria-label="Kit ufficiale" className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {spaziKit(kit).map((s) => (
        <a
          key={s.chiave}
          href={ANCORE[s.chiave]}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition hover:border-[var(--tbh-neon)] ${
            s.pronto
              ? "border-[var(--tbh-neon)]/50 bg-[var(--tbh-neon)]/5"
              : "border-[var(--tbh-line)]"
          }`}
        >
          {s.pronto ? (
            <CheckCircle2 size={16} className="shrink-0 text-[var(--tbh-neon)]" />
          ) : (
            <Clock3 size={16} className="shrink-0 text-[var(--tbh-gold)]" />
          )}
          <span className="min-w-0">
            <span className="block font-semibold leading-tight">{s.titolo}</span>
            <span
              className={`block text-[11px] uppercase tracking-wide ${
                s.pronto ? "text-[var(--tbh-neon)]" : "text-[var(--tbh-gold)]"
              }`}
            >
              {s.pronto ? "Pubblicato" : s.chiave === "negozio" ? "In allestimento" : "In arrivo"}
            </span>
          </span>
        </a>
      ))}
    </nav>
  );
}

function Titolo({ icona, sopra, children }: { icona: React.ReactNode; sopra: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 mb-5">
      <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[var(--tbh-gold)]">
        {icona} {sopra}
      </span>
      <h2 className="tbh-display tbh-h2 leading-tight">{children}</h2>
    </div>
  );
}

function Attesa({ testo }: { testo: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--tbh-gold)]/50 p-5 text-[var(--tbh-muted)]">
      <p className="text-xs uppercase tracking-widest text-[var(--tbh-gold)] mb-1">In arrivo</p>
      <p className="tbh-body">{testo}</p>
    </div>
  );
}

/** Blocchi comuni a tutte le società: lavoro, negozio, contatti. */
function BlocchiComuni({ nome, kit }: { nome: string; kit: KitSocieta | null }) {
  const annunci = kit?.annunciLavoro ?? [];
  const articoli = kit?.articoliNegozio ?? [];
  return (
    <>
      <section id="lavora-con-noi" className="scroll-mt-28">
        <Titolo icona={<Briefcase size={14} />} sopra="Annunci di lavoro">
          Lavora con {nome}
        </Titolo>
        {annunci.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {annunci.map((a) => (
              <article key={a.titolo} className="tbh-card overflow-hidden">
                {a.immagine ? <img src={a.immagine} alt={a.titolo} className="w-full" loading="lazy" /> : null}
                <div className="p-5 flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-[var(--tbh-gold)]">{a.settore}</span>
                  <h3 className="tbh-display tbh-h3">{a.titolo}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {a.ruoli.map((r) => (
                      <li key={r} className="rounded-full border border-[var(--tbh-line)] px-3 py-1 text-sm">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Attesa
            testo={`Le slide degli annunci di lavoro di ${nome} (settore, ruoli e requisiti) vengono pubblicate qui appena arrivano. Intanto le posizioni aperte del gruppo sono in bacheca.`}
          />
        )}
        <div className="flex flex-wrap gap-3 mt-4">
          <Link to="/lavoro-casting/bacheca" className="tbh-neon-btn px-5 py-2.5 inline-flex items-center gap-2">
            <Briefcase size={15} /> Bacheca annunci TBH
          </Link>
          <a
            href={wa(`Buongiorno, vorrei informazioni sulle posizioni aperte di ${nome}.`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 hover:border-[var(--tbh-neon)]"
          >
            <MessageCircle size={15} /> Info su WhatsApp
          </a>
          <Link
            to="/lavoro-casting/candidature"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 hover:border-[var(--tbh-neon)]"
          >
            <Briefcase size={15} /> Candidati online
          </Link>
          <a
            href={`mailto:lavoro@tibihacca.com?subject=${encodeURIComponent(`Candidatura — ${nome}`)}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 hover:border-[var(--tbh-neon)]"
          >
            <Mail size={15} /> lavoro@tibihacca.com
          </a>
        </div>
      </section>

      <section id="negozio" className="scroll-mt-28">
        <Titolo icona={<ShoppingBag size={14} />} sopra="Touch Plaza · Shop">
          Articoli di {nome}
        </Titolo>
        {articoli.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {articoli.map((a) => (
              <li key={a.titolo}>
                {a.slugShop ? (
                  <Link to={`/shop/p/${a.slugShop}`} className="tbh-card p-4 block hover:border-[var(--tbh-neon)]">
                    {a.titolo}
                  </Link>
                ) : (
                  <div className="tbh-card p-4">{a.titolo}</div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--tbh-gold)]/50 p-5 text-[var(--tbh-muted)]">
            <p className="text-xs uppercase tracking-widest text-[var(--tbh-gold)] mb-1">In allestimento</p>
            <p className="tbh-body">
              Gli articoli per il negozio di {nome} sono in allestimento. Appena pronti compaiono qui e
              nello shop con lo stesso prezzo.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-3 mt-4">
          <Link to="/shop" className="tbh-neon-btn px-5 py-2.5 inline-flex items-center gap-2">
            <ShoppingBag size={15} /> Vai allo shop
          </Link>
          <a
            href={wa(`Buongiorno, vorrei informazioni sugli articoli di ${nome}.`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 hover:border-[var(--tbh-neon)]"
          >
            <MessageCircle size={15} /> Chiedi info
          </a>
        </div>
      </section>

      <section className="tbh-card p-5 md:p-6 flex flex-col gap-3">
        <h2 className="tbh-display tbh-h3">Contatti ufficiali</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={wa(`Buongiorno, vi contatto per ${nome}.`)}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-5 py-2.5 inline-flex items-center gap-2"
          >
            <MessageCircle size={15} /> WhatsApp {WA_NUMERO}
          </a>
          <a
            href="mailto:supporto@touch-business.com"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 hover:border-[var(--tbh-neon)]"
          >
            <Mail size={15} /> supporto@touch-business.com
          </a>
        </div>
      </section>
    </>
  );
}

function PaginaKit({ kit, settore }: { kit: KitSocieta; settore: string | null }) {
  const m = kit.materiali;
  return (
    <>
      {/* Testata: SOLO LOGO = allestimento e identità (regola globale, punto 1): non è un pulsante */}
      <header id="logo" className="scroll-mt-28 grid gap-6 md:grid-cols-[minmax(0,300px)_1fr] items-center">
        {m.logo ? (
          <div className="mx-auto w-full max-w-[260px] md:max-w-[300px]">
            <img src={m.logo} alt={`Logo ufficiale ${kit.nome}`} className="w-full h-auto drop-shadow-[0_0_30px_rgba(215,255,0,0.18)]" />
          </div>
        ) : null}
        <div className="flex flex-col gap-3 min-w-0">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--tbh-neon)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
            <BadgeCheck size={13} /> TBH Official · {kit.capogruppo ? "Capogruppo" : kit.codice}
          </span>
          <h1 className="tbh-display tbh-h1 leading-[1.05] break-words">{kit.nome}</h1>
          <Appartiene a={kit.appartenenza} />
          {kit.sottotitolo ? (
            <p className="text-sm md:text-base tracking-[0.12em] uppercase text-[var(--tbh-gold)]">{kit.sottotitolo}</p>
          ) : null}
          {settore ? <p className="text-[var(--tbh-muted)]">{settore}</p> : null}
          {kit.aree.length ? (
            <ul className="flex flex-wrap gap-2">
              {kit.aree.map((a) => (
                <li key={a} className="rounded-full bg-white/5 border border-[var(--tbh-line)] px-3 py-1 text-xs uppercase tracking-widest">
                  {a}
                </li>
              ))}
            </ul>
          ) : null}
          {kit.motto.length ? (
            <p className="tbh-display text-lg md:text-xl tracking-[0.2em] text-[var(--tbh-neon)]">
              {kit.motto.join(" · ")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-1">
            {kit.collegamenti.slice(0, 1).map((c) => (
              <Link key={c.href} to={c.href} className="tbh-neon-btn px-5 py-2.5 inline-flex items-center gap-2">
                {c.label}
              </Link>
            ))}
            <a
              href="#scheda-ufficiale"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 hover:border-[var(--tbh-neon)]"
            >
              <FileText size={15} /> Scheda ufficiale
            </a>
            <a
              href={wa(`Buongiorno, vi contatto per ${kit.nome}.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 hover:border-[var(--tbh-neon)]"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      <StatoKit kit={kit} />

      {/* Identità + mission e valori */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="tbh-card p-5 md:p-6">
          <Titolo icona={<FileText size={14} />} sopra="Identità">
            Chi siamo
          </Titolo>
          <dl className="divide-y divide-[var(--tbh-line)]">
            {kit.identita.map((v) => (
              <div key={v.etichetta} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 gap-y-0.5 py-2.5">
                <dt className="text-xs uppercase tracking-widest text-[var(--tbh-gold)] pt-0.5">{v.etichetta}</dt>
                <dd className="break-words">{v.valore}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-6">
          {kit.mission ? (
            <div className="tbh-card p-5 md:p-6">
              <Titolo icona={<Target size={14} />} sopra="La nostra mission">
                Perché esistiamo
              </Titolo>
              <p className="tbh-body text-lg leading-relaxed">{kit.mission}</p>
            </div>
          ) : null}
          {kit.valori.length ? (
            <div className="tbh-card p-5 md:p-6">
              <Titolo icona={<Sparkles size={14} />} sopra="I nostri valori">
                Cosa ci guida
              </Titolo>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {kit.valori.map((v) => (
                  <li
                    key={v}
                    className="rounded-xl border border-[var(--tbh-neon)]/40 px-3 py-3 text-center font-bold uppercase tracking-wider text-sm"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* Attività, servizi, divise */}
      {kit.attivita.length || kit.servizi.length ? (
        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {kit.attivita.length ? (
            <div className="tbh-card p-5 md:p-6">
              <Titolo icona={<CheckCircle2 size={14} />} sopra="Attività principali">
                Cosa facciamo
              </Titolo>
              <ul className="flex flex-col gap-2.5">
                {kit.attivita.map((a) => (
                  <li key={a} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--tbh-neon)]" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-col gap-6">
            {kit.servizi.length ? (
              <div className="tbh-card p-5 md:p-6">
                <Titolo icona={<Sparkles size={14} />} sopra="I nostri servizi">
                  Servizi
                </Titolo>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {kit.servizi.map((s) => (
                    <li key={s}>
                      <a
                        href={wa(`Buongiorno, vorrei informazioni su «${s}» — ${kit.nome}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-full min-h-16 items-center justify-center rounded-xl border border-[var(--tbh-line)] px-2 py-3 text-center text-sm font-semibold uppercase tracking-wide hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                      >
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--tbh-muted)]">Tocca un servizio per chiedere informazioni su WhatsApp.</p>
              </div>
            ) : null}
            {kit.divise.length ? (
              <div className="tbh-card p-5 md:p-6">
                <h3 className="tbh-display tbh-h3 mb-3">Le nostre divise</h3>
                <ul className="flex flex-wrap gap-2">
                  {kit.divise.map((d) => (
                    <li key={d} className="rounded-full border border-[var(--tbh-line)] px-3 py-1 text-sm uppercase tracking-wide">
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--tbh-muted)]">Le divise sono illustrate nella scheda ufficiale qui sotto.</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {kit.claim ? (
        <p className="tbh-display text-center text-2xl md:text-4xl italic text-[var(--tbh-neon)] py-2">«{kit.claim}»</p>
      ) : null}

      {/* Slide principale + galleria: ‹ PRECEDENTE | ANTEPRIME SLIDE | SUCCESSIVA › */}
      <section id="scheda-ufficiale" className="scroll-mt-28">
        <Titolo icona={<FileText size={14} />} sopra="Scheda ufficiale · slide e grafiche">
          La scheda di {kit.acronimo ?? kit.nome}
        </Titolo>
        <div className="mx-auto max-w-4xl">
          <GalleriaSlide slide={slideKit(kit)} nome={kit.nome} />
        </div>
      </section>

      {/* Timbro e firma */}
      <section id="timbro-firma" className="scroll-mt-28">
        <Titolo icona={<Stamp size={14} />} sopra="Timbro e firma">
          Logo con timbro e firma
        </Titolo>
        {m.timbroFirma ? (
          /* Compatto: la versione grande è già nella galleria qui sopra (slide «Timbro e firma»). */
          <figure className="tbh-card p-4 md:p-5 grid gap-4 sm:grid-cols-[minmax(0,320px)_1fr] items-center">
            <a href={m.timbroFirma} target="_blank" rel="noreferrer" className="block rounded-xl bg-white p-2">
              <img src={m.timbroFirma} alt={`Timbro e firma ${kit.nome}`} className="w-full" loading="lazy" />
            </a>
            <figcaption className="flex flex-col gap-3 text-sm text-[var(--tbh-muted)]">
              <span>
                Timbro ufficiale e firma del legale rappresentante, da usare su documenti, attestati e
                comunicazioni ufficiali della società.
              </span>
              <a href={m.timbroFirma} download className="inline-flex w-fit items-center gap-1.5 text-[var(--tbh-neon)]">
                Scarica timbro e firma <ExternalLink size={13} />
              </a>
            </figcaption>
          </figure>
        ) : (
          <Attesa testo="Il logo con timbro e firma viene pubblicato qui appena arriva." />
        )}
      </section>

      <BlocchiComuni nome={kit.nome} kit={kit} />

      {kit.collegamenti.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="tbh-display tbh-h3">Dov'è collegata nel portale</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kit.collegamenti.map((c) => (
              <Link key={c.href} to={c.href} className="tbh-card p-4 flex flex-col gap-1 hover:border-[var(--tbh-neon)]">
                <span className="tbh-display text-lg">{c.label}</span>
                <span className="text-xs text-[var(--tbh-muted)]">{c.href}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function SocietaSchedaPage({ slug }: { slug: string }) {
  const q = useCompanies();
  const kit = trovaKit(slug);
  const tutte = [...(q.data?.societa ?? []), ...(q.data?.attivita ?? [])];
  const codice = (kit?.codice ?? slug).toLowerCase();
  const c = tutte.find((x) => x.code.toLowerCase() === codice) ?? null;

  if (!kit && q.isLoading) return <div className="p-6 text-[var(--tbh-muted)]">Caricamento scheda…</div>;

  if (!kit && !c)
    return (
      <div className="p-6 md:p-10 flex flex-col gap-4">
        <h1 className="tbh-display tbh-h1">Scheda non trovata</h1>
        <p className="text-[var(--tbh-muted)] max-w-2xl">Questa società non è nell'elenco del gruppo.</p>
        <Link to="/tbh/societa" className="tbh-neon-btn px-5 py-2.5 w-fit">
          Società & Attività
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-8 flex flex-col gap-10 md:gap-14">
      <Link
        to="/tbh/societa"
        className="inline-flex w-fit items-center gap-2 text-xs uppercase tracking-widest text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        <ArrowLeft size={14} /> Società & Attività
      </Link>

      {kit ? (
        <PaginaKit kit={kit} settore={c?.sector ?? null} />
      ) : c ? (
        <>
          <header id="logo" className="scroll-mt-28 grid gap-6 md:grid-cols-[minmax(0,300px)_1fr] items-center">
            <LogoBox name={c.name} logo={c.logo} size="lg" url={c.site} />
            <div className="flex flex-col gap-3 min-w-0">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--tbh-neon)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
                <BadgeCheck size={13} /> TBH Official · {c.code}
              </span>
              <h1 className="tbh-display tbh-h1 leading-[1.05] break-words">{c.name}</h1>
              <Appartiene a={TBH} />
              <p className="text-sm tracking-[0.12em] uppercase text-[var(--tbh-gold)]">
                {c.kind === "societa" ? "Società con P.IVA" : "Attività del gruppo"} · {c.sector}
              </p>
              {c.vat ? <p className="text-[var(--tbh-muted)]">P.IVA {c.vat}</p> : null}
              {c.site ? (
                <a href={c.site} target="_blank" rel="noreferrer" className="tbh-neon-btn px-5 py-2.5 w-fit inline-flex items-center gap-2">
                  Sito ufficiale <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
          </header>
          <StatoKit kit={null} />
          <section id="scheda-ufficiale" className="scroll-mt-28 grid gap-4 md:grid-cols-2">
            <GalleriaSlide slide={[]} nome={c.name} />
            <div id="timbro-firma" className="scroll-mt-28">
              <Attesa testo={`Il logo con timbro e firma di ${c.name} viene pubblicato qui appena arriva.`} />
            </div>
          </section>
          <BlocchiComuni nome={c.name} kit={null} />
        </>
      ) : null}
    </div>
  );
}
