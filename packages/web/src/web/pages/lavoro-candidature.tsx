/**
 * TBH Lavoro — Candidature (06/10/2026). Separata dalle offerte: qui le PERSONE inviano il
 * profilo. Candidature TBH solo a lavoro@tibihacca.com o con i moduli online già attivi.
 */
import { Link } from "wouter";
import { ArrowRight, Clapperboard, FileText, Landmark, Mail, MessageCircle } from "lucide-react";
import { TestataLavoro } from "../components/tbh-lavoro";
import { ANNUNCI_TBH, EMAIL_LAVORO_TBH, oggiIso, scaduto } from "../lib/bacheca-annunci";
import { waInfo } from "../lib/whatsapp";

export default function LavoroCandidaturePage() {
  const oggi = oggiIso();
  const conModulo = ANNUNCI_TBH.filter((a) => a.contatti.modulo && !scaduto(a, oggi));
  const spontanea = `mailto:${EMAIL_LAVORO_TBH}?subject=${encodeURIComponent("Candidatura spontanea — TBH Lavoro")}`;

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-8 md:py-10">
      <TestataLavoro
        occhiello="TBH Lavoro · candidature"
        titolo="Invia la tua candidatura"
        testo="Le offerte stanno in Bacheca; qui trovi come candidarti alle Opportunità TBH. Per gli annunci di fonti esterne ci si candida sul sito originale."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border-2 border-[var(--tbh-neon)] bg-[var(--tbh-surface)] p-5">
          <Mail className="text-[var(--tbh-neon)]" />
          <h2 className="tbh-display text-2xl mt-2">Via e-mail</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-1">
            Unico indirizzo per le candidature TBH. Indica nell'oggetto l'annuncio, allega CV o portfolio, città e
            disponibilità.
          </p>
          <a href={spontanea} className="tbh-neon-btn px-5 py-2.5 text-sm mt-4 inline-flex items-center gap-2">
            <Mail size={15} /> {EMAIL_LAVORO_TBH}
          </a>
        </section>

        <section className="rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-5">
          <FileText className="text-[var(--tbh-gold)]" />
          <h2 className="tbh-display text-2xl mt-2">Con il modulo online</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-1">Disponibile per questi annunci:</p>
          <ul className="mt-3 grid gap-2">
            {conModulo.map((a) => (
              <li key={a.slug}>
                <Link
                  to={a.contatti.modulo ?? "/lavoro-casting/bacheca"}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--tbh-line)] px-3 py-2 text-sm hover:border-[var(--tbh-neon)]"
                >
                  <span className="min-w-0 [overflow-wrap:anywhere]">{a.titolo}</span>
                  <ArrowRight size={14} className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <Link to="/lavoro-casting/bacheca" className="rounded-2xl border border-[var(--tbh-line)] p-4 hover:border-[var(--tbh-neon)]">
          <p className="font-semibold">Prima scegli l'offerta</p>
          <p className="text-xs text-[var(--tbh-muted)] mt-1">TBH Lavoro — Bacheca annunci, con filtri per zona e settore.</p>
        </Link>
        <Link to="/casting" className="rounded-2xl border border-[var(--tbh-line)] p-4 hover:border-[#b26bff]">
          <p className="font-semibold inline-flex items-center gap-2"><Clapperboard size={15} /> Casting</p>
          <p className="text-xs text-[var(--tbh-muted)] mt-1">Videoclip, cinema, TV: candidatura dalla scheda del singolo casting.</p>
        </Link>
        <Link to="/istituzioni" className="rounded-2xl border border-[var(--tbh-line)] p-4 hover:border-[var(--tbh-neon)]">
          <p className="font-semibold inline-flex items-center gap-2"><Landmark size={15} /> DID e pratiche</p>
          <p className="text-xs text-[var(--tbh-muted)] mt-1">Centri per l'impiego, agibilità, portali ufficiali.</p>
        </Link>
      </div>

      <p className="text-xs text-[var(--tbh-muted)] mt-6 flex items-start gap-2">
        <MessageCircle size={14} className="mt-0.5 shrink-0" />
        <span>
          WhatsApp solo per informazioni, non per inviare candidature:{" "}
          <a href={waInfo("TBH Lavoro")} target="_blank" rel="noreferrer" className="text-[var(--tbh-neon)]">
            chiedi informazioni
          </a>
          .
        </span>
      </p>
    </div>
  );
}
