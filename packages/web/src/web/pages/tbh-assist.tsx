import { Link } from "wouter";
import { MessageCircle, LifeBuoy } from "lucide-react";
import { useAssist } from "../queries/ecosistema";
import { waInfo } from "../lib/whatsapp";

/**
 * FASE 5 — TBH ASSIST (brief punto 10).
 * Assistenza tecnica e digitale. Il limite sulle attività regolamentate è dichiarato in pagina.
 */
export default function TbhAssistPage() {
  const q = useAssist();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <div className="flex items-center gap-3">
        <LifeBuoy size={30} className="text-[var(--tbh-neon)]" />
        <h1 className="tbh-display tbh-h1">TBH Assist</h1>
      </div>
      <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
        Assistenza tecnica e digitale del gruppo: ti seguiamo passo per passo su prenotazioni,
        registrazioni, acquisti online, configurazioni e uso delle piattaforme.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mt-8">
        {(q.data?.servizi ?? []).map((s) => (
          <div key={s.slug} className="tbh-card p-6 flex flex-col">
            <h2 className="tbh-display text-xl">{s.titolo}</h2>
            <p className="text-sm text-[var(--tbh-muted)] mt-2 grow">{s.cosaFa}</p>
            <p className="text-[11px] text-[var(--tbh-gold)] uppercase tracking-wide mt-3">
              {s.comeSiChiede}
            </p>
            <a
              href={waInfo(`TBH Assist — ${s.titolo}`)}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn px-4 py-2.5 text-sm mt-4 inline-flex items-center gap-2 self-start"
            >
              <MessageCircle size={16} /> Chiedi assistenza
            </a>
          </div>
        ))}
      </div>

      <div className="tbh-card p-6 md:p-8 mt-10">
        <h2 className="tbh-display tbh-h2">Dove ci fermiamo</h2>
        <p className="text-sm text-[var(--tbh-muted)] mt-3">{q.data?.limite}</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            to="/istituzioni"
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
          >
            Portali istituzionali ufficiali
          </Link>
          <Link
            to="/hospitality"
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
          >
            Prenotazioni Hospitality
          </Link>
        </div>
      </div>
    </div>
  );
}
