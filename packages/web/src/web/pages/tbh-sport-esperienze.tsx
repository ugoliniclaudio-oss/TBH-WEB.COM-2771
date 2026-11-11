import { Fragment, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  AlertTriangle,
  CreditCard,
  Lock,
} from "lucide-react";
import {
  DESTINATARI_TBH_SPORT,
  EMAIL_TBH_SPORT,
  ESPERIENZE_SPORT,
  LOCANDINA_4_ESPERIENZE,
  NOTE_TBH_SPORT,
  PERCORSO_TBH_SPORT,
  SCONTI_DA_APPROVARE,
  SCONTO_FIDELITY_PCT,
  SCONTO_PROMO_PCT,
  type EsperienzaSport,
} from "../../api/data/tbh-sport-esperienze";
import { GalleriaSlide } from "../components/galleria-slide";
import { waInfo, WA_NUMERO, WA_NUMERO_2 } from "../lib/whatsapp";
import { COLORE_TBH } from "../lib/identita-tbh";

/**
 * /sport/esperienze — «TBH SPORT · LE 4 ESPERIENZE» (listino di Claudio, 15/10/2026).
 * Quattro piani progressivi: ESSENTIAL → CONNECT → MEDIA PRO → ARENA.
 * Ogni piano comprende tutti i servizi del precedente. Prezzi annuali IVA esclusa.
 * Gli sconti −20% / −40% sono quelli della proposta grafica: DA APPROVARE.
 * /sport/esperienze/:slug apre la stessa pagina sul piano richiesto.
 */

const G = COLORE_TBH;

/** «2.400 €» come nelle grafiche: senza decimali, punto delle migliaia sempre presente. */
function eur(cents: number) {
  const n = Math.round(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n} €`;
}

function mailPreventivo(e: EsperienzaSport) {
  const oggetto = `Richiesta preventivo ${e.nome}`;
  const corpo = [
    "Buongiorno,",
    `vorrei ricevere informazioni e un preventivo per l'esperienza ${e.nome} — ${e.claim}.`,
    "",
    "Società / associazione:",
    "Sport e categoria:",
    "Città:",
    "Referente e telefono:",
    "Aderente Circuito TBH (sì/no):",
  ].join("\n");
  return `mailto:${EMAIL_TBH_SPORT}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;
}

/** Tutti i servizi compresi in un piano (cumulativi). */
function serviziCumulati(numero: number) {
  return ESPERIENZE_SPORT.filter((e) => e.numero <= numero).flatMap((e) => e.servizi);
}

function BoxPrezzi({ e }: { e: EsperienzaSport }) {
  const box = [
    { k: "pieno", titolo: "Prezzo pieno", valore: e.prezzi.pieno, sconto: null, stile: "outline" },
    { k: "promo", titolo: "Promo per tutti", valore: e.prezzi.promo, sconto: SCONTO_PROMO_PCT, stile: "giallo-bordo" },
    { k: "fidelity", titolo: "Fidelity TBH", valore: e.prezzi.fidelity, sconto: SCONTO_FIDELITY_PCT, stile: "giallo" },
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" data-testid={`prezzi-${e.slug}`}>
      {box.map((b) => {
        const pieno = b.stile === "giallo";
        return (
          <div
            key={b.k}
            className="min-w-0 rounded-2xl border-2 px-4 py-4 text-center"
            style={{
              borderColor: b.stile === "outline" ? "var(--tbh-line)" : G,
              background: pieno ? G : "rgba(0,0,0,.55)",
              color: pieno ? "#000" : undefined,
            }}
          >
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.16em]"
              style={{ color: pieno ? "#000" : b.stile === "giallo-bordo" ? G : "var(--tbh-muted)" }}
            >
              {b.titolo}
              {b.sconto ? ` −${b.sconto}%` : ""}
            </p>
            <p className="tbh-display mt-1 text-3xl leading-none tabular-nums md:text-[2.1rem]" data-prezzo={b.k}>
              {eur(b.valore)}
            </p>
            <p className={`mt-1 text-xs ${pieno ? "text-black/70" : "text-[var(--tbh-muted)]"}`}>+ IVA / anno</p>
          </div>
        );
      })}
    </div>
  );
}

function SchedaEsperienza({ e }: { e: EsperienzaSport }) {
  const precedente = ESPERIENZE_SPORT.find((x) => x.numero === e.numero - 1);
  return (
    <section
      id={e.slug}
      className="tbh-card scroll-mt-28 overflow-hidden"
      style={{ borderColor: e.numero === 4 ? G : undefined }}
      data-testid={`esperienza-${e.slug}`}
    >
      <a href={e.locandina} target="_blank" rel="noreferrer" className="block bg-black" aria-label={`Apri la locandina ${e.nome}`}>
        <img
          src={e.locandina}
          alt={`Locandina ufficiale ${e.nome} — ${e.claim}`}
          className="block h-auto w-full"
          loading="lazy"
          width={1536}
          height={1024}
        />
      </a>

      <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em]" style={{ color: G }}>
            Esperienza {e.numero} di 4
          </p>
          <h2 className="tbh-display mt-2 text-4xl uppercase leading-none md:text-5xl">{e.nome}</h2>
          <p className="mt-2 text-lg font-semibold text-[var(--tbh-platinum)]">{e.claim}</p>

          <div className="mt-5 rounded-xl border border-[var(--tbh-line)] bg-black/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-muted)]">Obiettivo</p>
            <p className="tbh-body mt-1">{e.obiettivo}</p>
          </div>

          {e.comprende && precedente && (
            <a
              href={`#${precedente.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-white/5"
              style={{ borderColor: G, color: G }}
            >
              <Plus size={14} /> Comprende tutto {e.comprende}, più:
            </a>
          )}

          <ul className="mt-4 grid gap-2.5">
            {e.servizi.map((s) => (
              <li key={s} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full" style={{ background: G }}>
                  <Check size={13} className="text-black" strokeWidth={3} />
                </span>
                <span className="tbh-body">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <BoxPrezzi e={e} />
          {SCONTI_DA_APPROVARE && (
            <p className="flex items-start gap-2 text-xs text-[var(--tbh-muted)]">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: G }} />
              Sconti della proposta grafica, da confermare. Prezzi annuali IVA esclusa.
            </p>
          )}
          {/* PAGAMENTO ONLINE — il link Stripe incassa il prezzo pieno di listino. */}
          {e.pagamento ? (
            <div className="rounded-2xl border-2 p-4" style={{ borderColor: G }} data-testid={`pagamento-${e.slug}`}>
              <a
                href={e.pagamento}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-black"
                style={{ background: G }}
                data-testid={`acquista-${e.slug}`}
              >
                <CreditCard size={18} /> Attiva {e.nome.replace("TBH ", "")} · {eur(e.prezzi.pieno)} + IVA
              </a>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--tbh-muted)]">
                <Lock size={13} className="mt-0.5 shrink-0" />
                Pagamento sicuro con Stripe a Touch Business Holding, al prezzo pieno di listino. Promo per
                tutti e Fidelity TBH non sono automatiche: per usarle richiedi il preventivo prima di pagare.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--tbh-line)] p-4" data-testid={`pagamento-${e.slug}`}>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em]" style={{ color: G }}>
                Pagamento online in allestimento
              </p>
              <p className="mt-1 text-xs text-[var(--tbh-muted)]">
                Per attivare {e.nome} richiedi il preventivo: ti rispondiamo con la proposta e le modalità di pagamento.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <a
              href={mailPreventivo(e)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold uppercase tracking-wide ${e.pagamento ? "border hover:bg-white/5" : "text-black"}`}
              style={e.pagamento ? { borderColor: G, color: G } : { background: G }}
              data-testid={`preventivo-${e.slug}`}
            >
              <Mail size={16} /> {e.pagamento ? "Preventivo promo / Fidelity" : "Richiedi preventivo"}
            </a>
            <a
              href={waInfo(`l'esperienza ${e.nome} di TBH SPORT`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold uppercase tracking-wide hover:bg-white/5"
              style={{ borderColor: G, color: G }}
            >
              <MessageCircle size={16} /> Info su WhatsApp
            </a>
          </div>
          <p className="text-xs text-[var(--tbh-muted)]">
            In totale {serviziCumulati(e.numero).length} servizi
            {e.numero > 1 ? `, compresi tutti quelli dei piani precedenti` : ""}.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function TbhSportEsperienzePage({ ancora }: { ancora?: string }) {
  useEffect(() => {
    const id = ancora ?? (window.location.hash ? window.location.hash.slice(1) : null);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 300);
    return () => clearTimeout(t);
  }, [ancora]);

  const tutti = serviziCumulati(4);

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-12 px-4 py-8 md:px-8 md:py-10">
      {/* ───── TESTATA ───── */}
      <header className="tbh-rise">
        <Link href="/sport" className="mb-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--tbh-muted)] hover:text-[var(--tbh-platinum)]">
          <ArrowLeft size={14} /> Area Sport
        </Link>
        <p className="text-xs font-extrabold uppercase tracking-[0.3em]" style={{ color: G }}>
          TBH SPORT · Eventi · Media · Produzioni
        </p>
        <h1 className="tbh-display tbh-h1 mt-2 uppercase">
          Le 4 esperienze <span style={{ color: G }}>TBH Sport</span>
        </h1>
        <p className="tbh-body mt-4 max-w-3xl text-[var(--tbh-muted)]">
          Quattro piani progressivi dedicati a {DESTINATARI_TBH_SPORT}. Ogni piano comprende tutti i
          servizi del precedente.
        </p>
        <p className="tbh-display mt-4 text-xl italic md:text-2xl" style={{ color: G }}>
          La tua squadra. La nostra esperienza. Il tuo successo.
        </p>

        {/* Scelta rapida: un clic per piano */}
        <nav className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Le 4 esperienze" data-testid="esperienze-nav">
          {ESPERIENZE_SPORT.map((e) => (
            <a
              key={e.slug}
              href={`#${e.slug}`}
              className="group min-w-0 rounded-2xl border border-[var(--tbh-line)] bg-black/50 p-4 transition hover:border-[#d7ff00]"
            >
              <span className="flex items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-black text-black" style={{ background: G }}>
                  {e.numero}
                </span>
                <span className="tbh-display min-w-0 text-base uppercase leading-none sm:text-lg md:text-xl">
                  {e.nome.replace("TBH ", "")}
                </span>
              </span>
              <span className="mt-2 block text-xs text-[var(--tbh-muted)]">{e.claim}</span>
              <span className="mt-2 block text-sm font-bold tabular-nums" style={{ color: G }}>
                {eur(e.prezzi.pieno)} <span className="font-normal text-[var(--tbh-muted)]">+ IVA/anno</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-wide">
          <a href="#confronto" className="inline-flex items-center gap-1 hover:text-[#d7ff00]">Confronta i piani <ChevronRight size={14} /></a>
          <a href="#riepilogo" className="inline-flex items-center gap-1 hover:text-[#d7ff00]">Riepilogo prezzi <ChevronRight size={14} /></a>
          <a href="#contatti" className="inline-flex items-center gap-1 hover:text-[#d7ff00]">Richiedi preventivo <ChevronRight size={14} /></a>
        </div>
      </header>

      {/* ───── LOCANDINA RIEPILOGATIVA ───── */}
      <a
        href={LOCANDINA_4_ESPERIENZE}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-2xl border border-[var(--tbh-line)] bg-black"
        aria-label="Apri la locandina 4 esperienze TBH Sport"
      >
        <img
          src={LOCANDINA_4_ESPERIENZE}
          alt="4 esperienze TBH SPORT — Essential, Connect, Media Pro, Arena"
          className="block h-auto w-full"
          width={1536}
          height={1024}
        />
      </a>

      {/* ───── LE 4 SCHEDE ───── */}
      <div className="flex flex-col gap-10">
        {ESPERIENZE_SPORT.map((e) => (
          <SchedaEsperienza key={e.slug} e={e} />
        ))}
      </div>

      {/* ───── CONFRONTO: COSA COMPRENDE OGNI PIANO ───── */}
      <section id="confronto" className="scroll-mt-28">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em]" style={{ color: G }}>Confronto</p>
        <h2 className="tbh-display tbh-h2 mt-1 uppercase">Cosa comprende ogni esperienza</h2>
        <p className="tbh-body mt-2 text-[var(--tbh-muted)]">Ogni piano comprende tutti i servizi del precedente.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--tbh-line)]" data-testid="tabella-confronto">
          <table className="w-full w-full table-fixed border-collapse text-[13px] md:table-auto md:text-sm">
            <thead>
              <tr className="bg-black">
                <th className="sticky left-0 w-[40%] bg-black p-2.5 text-left text-xs uppercase tracking-wider text-[var(--tbh-muted)] md:w-auto md:p-3">Servizio</th>
                {ESPERIENZE_SPORT.map((e) => (
                  <th key={e.slug} className="p-1 text-center md:p-3">
                    <span className="tbh-display block text-[11px] uppercase leading-tight md:text-base" style={{ color: G }}>{e.nome.replace("TBH ", "")}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ESPERIENZE_SPORT.map((origine) => (
                <Fragment key={origine.slug}>
                  <tr className="border-t border-[var(--tbh-line)] bg-[var(--tbh-surface)]">
                    <td colSpan={5} className="p-2 px-3 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: G }}>
                      Da {origine.nome}
                    </td>
                  </tr>
                  {origine.servizi.map((s) => (
                    <tr key={`${origine.slug}-${s}`} className="border-t border-[var(--tbh-line)]/60">
                      <td className="sticky left-0 bg-[var(--tbh-black)] p-2.5 pr-3 md:p-3 md:pr-4">{s.replace(/\.$/, "")}</td>
                      {ESPERIENZE_SPORT.map((e) => (
                        <td key={e.slug} className="p-1 text-center md:p-3">
                          {e.numero >= origine.numero ? (
                            <Check size={18} className="inline" style={{ color: G }} strokeWidth={3} aria-label="Compreso" />
                          ) : (
                            <span className="text-[var(--tbh-line)]" aria-label="Non compreso">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
              <tr className="border-t-2 border-[var(--tbh-line)] bg-black">
                <td className="sticky left-0 bg-black p-3 text-xs font-bold uppercase tracking-wider text-[var(--tbh-muted)]">
                  Servizi compresi
                </td>
                {ESPERIENZE_SPORT.map((e) => (
                  <td key={e.slug} className="p-1 text-center text-xs font-bold tabular-nums md:p-3 md:text-sm">
                    {serviziCumulati(e.numero).length}<span className="hidden md:inline"> / {tutti.length}</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ───── RIEPILOGO COMMERCIALE ───── */}
      <section id="riepilogo" className="scroll-mt-28">
        <p className="text-xs font-extrabold uppercase tracking-[0.25em]" style={{ color: G }}>Listino</p>
        <h2 className="tbh-display tbh-h2 mt-1 uppercase">Riepilogo commerciale</h2>
        <div className="mt-5 grid gap-3 sm:hidden">
          {ESPERIENZE_SPORT.map((e) => (
            <a key={e.slug} href={`#${e.slug}`} className="block rounded-2xl border border-[var(--tbh-line)] p-4">
              <span className="tbh-display block text-xl uppercase">{e.nome.replace("TBH ", "")}</span>
              <span className="mt-2 grid grid-cols-3 gap-2 text-center text-sm tabular-nums">
                <span><span className="block text-[10px] uppercase tracking-wider text-[var(--tbh-muted)]">Pieno</span>{eur(e.prezzi.pieno)}</span>
                <span className="font-bold" style={{ color: G }}><span className="block text-[10px] uppercase tracking-wider">−{SCONTO_PROMO_PCT}%</span>{eur(e.prezzi.promo)}</span>
                <span className="rounded-lg font-extrabold text-black" style={{ background: G }}><span className="block text-[10px] uppercase tracking-wider">Fidelity −{SCONTO_FIDELITY_PCT}%</span>{eur(e.prezzi.fidelity)}</span>
              </span>
            </a>
          ))}
        </div>
        <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-[var(--tbh-line)] sm:block" data-testid="tabella-riepilogo">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-black text-xs uppercase tracking-wider">
                <th className="p-3 text-left text-[var(--tbh-muted)]">Esperienza</th>
                <th className="p-3 text-right text-[var(--tbh-muted)]">Prezzo pieno</th>
                <th className="p-3 text-right" style={{ color: G }}>Sconto per tutti −{SCONTO_PROMO_PCT}%</th>
                <th className="p-3 text-right text-black" style={{ background: G }}>Fidelity TBH −{SCONTO_FIDELITY_PCT}%</th>
              </tr>
            </thead>
            <tbody>
              {ESPERIENZE_SPORT.map((e) => (
                <tr key={e.slug} className="border-t border-[var(--tbh-line)]">
                  <td className="p-3">
                    <a href={`#${e.slug}`} className="tbh-display text-lg uppercase hover:text-[#d7ff00]">
                      {e.nome.replace("TBH ", "")}
                    </a>
                  </td>
                  <td className="p-3 text-right tabular-nums">{eur(e.prezzi.pieno)}</td>
                  <td className="p-3 text-right font-bold tabular-nums" style={{ color: G }}>{eur(e.prezzi.promo)}</td>
                  <td className="p-3 text-right font-extrabold tabular-nums">{eur(e.prezzi.fidelity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--tbh-muted)]">Prezzi annuali, IVA esclusa. {ESPERIENZE_SPORT.every((e) => e.pagamento) ? "Pagamento online attivo per tutte e 4 le esperienze, al prezzo pieno; promo e Fidelity su preventivo." : `Pagamento online attivo per ${ESPERIENZE_SPORT.filter((e) => e.pagamento).map((e) => e.nome.replace("TBH ", "")).join(", ")} (prezzo pieno); gli altri piani su preventivo.`}</p>
      </section>

      {/* ───── IL PERCORSO TBH ───── */}
      <section>
        <p className="text-xs font-extrabold uppercase tracking-[0.25em]" style={{ color: G }}>Come funziona</p>
        <h2 className="tbh-display tbh-h2 mt-1 uppercase">Il percorso TBH — semplice, concreto, vincente</h2>
        <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PERCORSO_TBH_SPORT.map((p, i) => (
            <li key={p.titolo} className="tbh-card flex min-w-0 items-start gap-3 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full text-base font-black text-black" style={{ background: G }}>
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-extrabold uppercase tracking-wide">{p.titolo}</span>
                <span className="block text-sm text-[var(--tbh-muted)]">{p.testo}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ───── NOTE E CONDIZIONI ───── */}
      <section className="rounded-2xl border border-dashed p-5 md:p-6" style={{ borderColor: `${G}80` }} data-testid="note-condizioni">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.2em]" style={{ color: G }}>Note e condizioni</h2>
        <ul className="mt-3 grid gap-2">
          {NOTE_TBH_SPORT.map((n) => (
            <li key={n} className="tbh-body flex items-start gap-2 text-[var(--tbh-muted)]">
              <span style={{ color: G }}>•</span> {n}
            </li>
          ))}
        </ul>
      </section>

      {/* ───── LOCANDINE UFFICIALI ───── */}
      <section>
        <h2 className="tbh-display tbh-h3 mb-4 uppercase">Le locandine ufficiali</h2>
        <GalleriaSlide
          nome="TBH SPORT"
          slide={[
            { src: LOCANDINA_4_ESPERIENZE, titolo: "4 esperienze TBH SPORT" },
            ...ESPERIENZE_SPORT.map((e) => ({ src: e.locandina, titolo: `${e.nome} — ${e.claim}` })),
          ]}
        />
      </section>

      {/* ───── CONTATTI ───── */}
      <section id="contatti" className="tbh-card scroll-mt-28 p-5 md:p-8" style={{ borderColor: G }}>
        <h2 className="tbh-display tbh-h2 uppercase">Richiedi informazioni e preventivo</h2>
        <p className="tbh-body mt-2 text-[var(--tbh-muted)]">
          Scegli l'esperienza giusta per il tuo club: ti rispondiamo con una proposta su misura.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <a
            href={`mailto:${EMAIL_TBH_SPORT}?subject=${encodeURIComponent("Richiesta informazioni TBH SPORT — 4 esperienze")}`}
            className="flex min-w-0 items-center gap-3 rounded-xl px-4 py-4 font-bold text-black"
            style={{ background: G }}
          >
            <Mail size={20} className="shrink-0" />
            <span className="min-w-0 truncate">{EMAIL_TBH_SPORT}</span>
          </a>
          <a
            href={waInfo("le 4 esperienze TBH SPORT")}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-3 rounded-xl border px-4 py-4 font-bold hover:bg-white/5"
            style={{ borderColor: G }}
          >
            <MessageCircle size={20} className="shrink-0" style={{ color: G }} />
            <span className="min-w-0 truncate">{WA_NUMERO} · WhatsApp</span>
          </a>
          <a
            href={`tel:${WA_NUMERO_2.replace(/\s/g, "")}`}
            className="flex min-w-0 items-center gap-3 rounded-xl border px-4 py-4 font-bold hover:bg-white/5"
            style={{ borderColor: G }}
          >
            <Phone size={20} className="shrink-0" style={{ color: G }} />
            <span className="min-w-0 truncate">{WA_NUMERO_2} · Telefono</span>
          </a>
        </div>
      </section>
    </div>
  );
}
