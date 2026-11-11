import {
  ExternalLink,
  Gift,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { HeroSezione } from "../components/hero-sezione";
import { SlotContenuti } from "../components/slot-contenuti";
import {
  SERVIZI_REFERRAL,
  REFERRAL_TITOLO,
  REFERRAL_SOTTOTITOLO,
  REFERRAL_INTRO,
  REFERRAL_PASSI,
  REFERRAL_PUNTI,
  REFERRAL_NOTA,
  type ServizioReferral,
} from "../lib/servizi-referral";

/**
 * SERVIZI & REFERRAL — GUADAGNA CON NOI (ordine di Claudio del 05/09/2026).
 *
 * Due percorsi distinti su ogni scheda, come da istruzioni:
 * A) logo, immagine, titolo e pulsante servizio → SITO UFFICIALE del brand;
 * B) pulsante «Guadagna con noi» → LINK REFERRAL PERSONALE di Claudio.
 * Tutti i link si aprono in una nuova scheda con rel="noopener noreferrer".
 *
 * I loghi ufficiali NON sono ricreati con l'IA: finché non arrivano i file originali,
 * al loro posto c'è il nome del brand per esteso, comunque cliccabile verso il sito
 * ufficiale, e lo spazio di allestimento `servizi-referral:loghi` pronto a riceverli.
 */

const ICONE_PUNTI = [ShieldCheck, TrendingUp, Users, Zap];

function Scheda({ s }: { s: ServizioReferral }) {
  const referralAttivo = Boolean(s.linkReferral);

  return (
    <article
      className="tbh-card overflow-hidden flex flex-col"
      style={{ borderColor: s.colore }}
      data-servizio-referral={s.id}
    >
      {/* A) AREA LOGO/IMMAGINE: porta al sito ufficiale del brand */}
      <a
        href={s.linkUfficiale}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-5 pt-5 pb-4 border-b border-[var(--tbh-line)] hover:opacity-90"
        aria-label={`Apri il sito ufficiale di ${s.nome}`}
      >
        {s.etichetta ? (
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] rounded-full px-3 py-1 mb-3"
            style={{ color: s.colore, border: `1px solid ${s.colore}` }}
          >
            {s.etichetta}
          </span>
        ) : null}
        <span className="block tbh-display text-3xl leading-tight" style={{ color: s.colore }}>
          {s.nome}
        </span>
        <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mt-2">
          {s.categoria}
        </span>
      </a>

      <div className="p-5 flex flex-col gap-4 grow">
        <p className="text-sm text-[var(--tbh-muted)]">{s.descrizione}</p>

        {s.vantaggi ? (
          <ul className="flex flex-col gap-1.5">
            {s.vantaggi.map((v) => (
              <li key={v} className="text-sm font-semibold inline-flex items-start gap-2">
                <Sparkles size={14} className="shrink-0 mt-1" style={{ color: s.colore }} /> {v}
              </li>
            ))}
          </ul>
        ) : null}

        {s.bonus ? (
          <div className="rounded-xl border border-[var(--tbh-gold)]/50 bg-[var(--tbh-gold)]/10 p-3 flex items-start gap-2">
            <Gift size={16} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
            <p className="text-sm">{s.bonus}</p>
          </div>
        ) : null}

        {s.codiceInvito ? (
          <div className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-center">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
              Codice invito
            </span>
            <span className="tbh-display text-2xl text-[var(--tbh-gold)]">{s.codiceInvito}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 mt-auto">
          {/* A) pulsante servizio → sito ufficiale */}
          <a
            href={s.linkUfficiale}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 hover:border-[var(--tbh-neon)]"
          >
            {s.labelUfficiale.toUpperCase()} <ExternalLink size={15} />
          </a>

          {/* B) pulsante referral → link personale di Claudio */}
          {referralAttivo ? (
            <a
              href={s.linkReferral as string}
              target="_blank"
              rel="noopener noreferrer"
              className="tbh-neon-btn px-4 py-3 text-sm inline-flex items-center justify-center gap-2"
            >
              {s.labelReferral.toUpperCase()} <ExternalLink size={15} />
            </a>
          ) : (
            <span className="rounded-full border border-dashed border-[var(--tbh-line)] px-4 py-3 text-sm font-semibold text-center text-[var(--tbh-muted)]">
              {s.labelReferral.toUpperCase()} — link da incollare
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ServiziReferralPage() {
  return (
    <div>
      <HeroSezione
        occhiello="TBH · Più servizi, più opportunità, più valore"
        titolo={REFERRAL_TITOLO}
        evidenza={REFERRAL_SOTTOTITOLO}
        sottotitolo="Sempre con te"
        testo={REFERRAL_INTRO}
        colore="var(--tbh-gold)"
        slotImmagine="hero:servizi-referral"
        azioni={[
          { label: "Touch Pay · pagamenti", to: "/pagamenti" },
          { label: "Parla con noi", to: "/contatti" },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
        {/* SCHEDE GRAFICHE: due percorsi distinti su ognuna */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SERVIZI_REFERRAL.map((s) => (
            <Scheda key={s.id} s={s} />
          ))}
        </section>

        {/* TABELLA RIEPILOGATIVA */}
        <section className="tbh-card p-5 md:p-6 mt-10">
          <h2 className="tbh-display tbh-h2 mb-4">Tabella riepilogativa</h2>
          <div className="tbh-scroll-x overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                  <th className="pb-2 pr-3 font-semibold">Servizio</th>
                  <th className="pb-2 pr-3 font-semibold">Categoria</th>
                  <th className="pb-2 pr-3 font-semibold">Bonus / vantaggi</th>
                  <th className="pb-2 pr-3 font-semibold">Codice invito</th>
                  <th className="pb-2 pr-3 font-semibold">Apri servizio</th>
                  <th className="pb-2 font-semibold">Guadagna con noi</th>
                </tr>
              </thead>
              <tbody>
                {SERVIZI_REFERRAL.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--tbh-line)] align-top">
                    <td className="py-3 pr-3 text-sm font-bold whitespace-nowrap">{s.nome}</td>
                    <td className="py-3 pr-3 text-sm text-[var(--tbh-muted)] whitespace-nowrap">
                      {s.categoria}
                    </td>
                    <td className="py-3 pr-3 text-sm">
                      {s.vantaggi ? s.vantaggi.join(", ") : (s.bonus ?? "—")}
                    </td>
                    <td className="py-3 pr-3 text-sm font-semibold text-[var(--tbh-gold)] whitespace-nowrap">
                      {s.codiceInvito ?? "—"}
                    </td>
                    <td className="py-3 pr-3">
                      <a
                        href={s.linkUfficiale}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--tbh-neon)] whitespace-nowrap"
                      >
                        Vai al sito <ExternalLink size={13} />
                      </a>
                    </td>
                    <td className="py-3">
                      {s.linkReferral ? (
                        <a
                          href={s.linkReferral}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tbh-neon-btn px-3 py-1.5 text-xs inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          Link referral <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span className="inline-block rounded-full border border-dashed border-[var(--tbh-line)] px-3 py-1.5 text-xs font-semibold text-[var(--tbh-muted)] whitespace-nowrap">
                          Da confermare
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* COME FUNZIONA */}
        <section className="mt-10">
          <h2 className="tbh-display tbh-h2 mb-4">Come funziona</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REFERRAL_PASSI.map((p) => (
              <div key={p.passo} className="tbh-card p-5">
                <span className="tbh-display text-3xl text-[var(--tbh-neon)]">{p.passo}</span>
                <span className="block text-sm font-bold uppercase tracking-wide mt-1">
                  {p.titolo}
                </span>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{p.testo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PUNTI DI FORZA */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          {REFERRAL_PUNTI.map((p, i) => {
            const Icona = ICONE_PUNTI[i] ?? ShieldCheck;
            return (
              <div key={p.titolo} className="tbh-card p-5 flex items-start gap-3">
                <Icona size={22} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-sm font-bold uppercase tracking-wide">{p.titolo}</span>
                  <span className="block text-sm text-[var(--tbh-muted)] mt-1">{p.testo}</span>
                </div>
              </div>
            );
          })}
        </section>

        <div className="mt-10">
          <SlotContenuti
            slot="servizi-referral:loghi"
            modo="loghi"
            colonne={4}
            titolo="Loghi ufficiali dei servizi"
            descrizione="I loghi originali dei brand si caricano qui: non vengono ricreati né disegnati."
          />
        </div>

        <p className="text-[11px] text-[var(--tbh-muted)] mt-8 max-w-4xl">{REFERRAL_NOTA}</p>
      </div>
    </div>
  );
}
