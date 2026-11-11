/**
 * TBH Lavoro — scheda di un'Opportunità TBH (06/10/2026).
 * Mostra l'annuncio ORIGINALE (componente con locandine e testi invariati) con i dati
 * essenziali sopra. Gli annunci scaduti restano consultabili ma senza candidatura.
 */
import type { ComponentType } from "react";
import { Link, useParams } from "wouter";
import { Archive, ArrowLeft, Mail } from "lucide-react";
import { TestataLavoro, NotaCandidature } from "../components/tbh-lavoro";
import { annuncioPerSlug, mailCandidatura, oggiIso, scaduto } from "../lib/bacheca-annunci";
import { dataIt } from "../lib/fonti-lavoro";
import { AnnuncioTreCollaboratori } from "../components/annuncio-3-collaboratori";
import { AnnuncioFissaggioAppuntamenti } from "../components/annuncio-fissaggio-appuntamenti";
import { AnnuncioAddetteB2B } from "../components/annuncio-addette-b2b";
import { AnnuncioBallerineJcHugo } from "../components/annuncio-ballerine-jc-hugo";
import { AnnuncioCastingInviate } from "../components/annuncio-casting-inviate";
import { AnnuncioVideomaker } from "../components/annuncio-videomaker";
import { AnnuncioAssistenteProduzione } from "../components/annuncio-assistente-produzione";
import { AnnuncioCerchiamoVideomaker } from "../components/annuncio-cerchiamo-videomaker";
import { AnnuncioTabellaPremi } from "../components/annuncio-tabella-premi";
import { AnnuncioSelezioniAudiovisivo } from "../components/annuncio-selezioni-audiovisivo";

const SCHEDE: Record<string, ComponentType> = {
  "selezioni-audiovisivo-2026-2027": AnnuncioSelezioniAudiovisivo,
  "cerchiamo-videomaker": AnnuncioCerchiamoVideomaker,
  "tabella-fisso-premi-commerciali": AnnuncioTabellaPremi,
  "casting-inviate-2026-2027": AnnuncioCastingInviate,
  "ricerca-videomaker-2026-2027": AnnuncioVideomaker,
  "assistente-di-produzione": AnnuncioAssistenteProduzione,
  "addette-commerciali-b2b": AnnuncioAddetteB2B,
  "casting-ballerine-jc-hugo": () => <AnnuncioBallerineJcHugo />,
  "cerchiamo-3-collaboratori": AnnuncioTreCollaboratori,
  "commerciale-fissaggio-appuntamenti": AnnuncioFissaggioAppuntamenti,
};

export default function BachecaSchedaPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const a = annuncioPerSlug(slug);
  const Scheda = SCHEDE[slug];

  if (!a || !Scheda) {
    return (
      <div className="mx-auto max-w-[900px] px-4 md:px-8 py-12">
        <TestataLavoro occhiello="TBH Lavoro" titolo="Annuncio non trovato" testo="L'annuncio potrebbe essere stato rimosso o spostato in archivio." />
        <Link to="/lavoro-casting/bacheca" className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Torna alla bacheca
        </Link>
      </div>
    );
  }

  const chiuso = scaduto(a, oggiIso());

  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-8 md:py-10" data-scheda-annuncio={a.slug}>
      <Link to="/lavoro-casting/bacheca" className="text-sm text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)] inline-flex items-center gap-1.5 mb-4">
        <ArrowLeft size={14} /> TBH Lavoro — Bacheca annunci
      </Link>

      <div className="rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-4 mb-8 flex flex-col md:flex-row md:items-center gap-3">
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-[var(--tbh-neon)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">Opportunità TBH</span>
          <h1 className="tbh-display text-xl mt-1 [overflow-wrap:anywhere]">{a.titolo}</h1>
          <p className="text-xs text-[var(--tbh-muted)] mt-0.5 flex flex-wrap gap-x-3">
            {a.localita && <span>{a.localita}</span>}
            {a.pubblicato && <span>Pubblicato {dataIt(a.pubblicato)}</span>}
            {a.scadenza && <span>Scadenza {dataIt(a.scadenza)}</span>}
          </p>
        </div>
        {chiuso ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
            <Archive size={13} /> In archivio · candidature chiuse
          </span>
        ) : (
          <a href={mailCandidatura(a)} className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2 shrink-0">
            <Mail size={15} /> Candidati a lavoro@tibihacca.com
          </a>
        )}
      </div>

      <Scheda />

      <div className="mt-6">
        <NotaCandidature />
      </div>
    </div>
  );
}
