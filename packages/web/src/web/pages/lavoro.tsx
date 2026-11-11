/**
 * TBH Lavoro — contenitore /lavoro-casting (06/10/2026).
 * Bacheca per prima: gli ultimi annunci subito visibili, poi le altre sezioni.
 * I casting restano in /casting (stesso database), qui solo un richiamo.
 */
import { Link } from "wouter";
import { ArrowRight, Building2, Clapperboard, FileText, GraduationCap, Landmark } from "lucide-react";
import {
  BannerAziende,
  EvidenzaCercoLavoroHotel,
  NotaCandidature,
  RigaAnnuncio,
  TestataLavoro,
} from "../components/tbh-lavoro";
import { FILTRI_VUOTI, filtraBacheca, oggiIso, TUTTI_ANNUNCI } from "../lib/bacheca-annunci";
import { CENTRI_IMPIEGO, ASSOCIAZIONI_FEDERALBERGHI } from "../lib/fonti-lavoro-dati";

const SEZIONI = [
  { to: "/lavoro-casting/candidature", icona: FileText, titolo: "Candidature", testo: "Come candidarti alle Opportunità TBH: e-mail e moduli online." },
  { to: "/casting", icona: Clapperboard, titolo: "Casting", testo: "Videoclip, cinema, TV e reality: selezioni aperte." },
  { to: "/lavoro-casting/formazione", icona: GraduationCap, titolo: "Formazione", testo: "Antincendio, High Visibility Scout, Touch Academy." },
  {
    to: "/lavoro-casting/fonti-esterne",
    icona: Landmark,
    titolo: "Fonti esterne",
    testo: `${CENTRI_IMPIEGO.length} Centri per l'impiego e ${ASSOCIAZIONI_FEDERALBERGHI.length} associazioni Federalberghi.`,
  },
  { to: "/lavoro-casting/aziende", icona: Building2, titolo: "Per le aziende", testo: "Imprese turistiche che cercano personale." },
];

export default function LavoroCastingPage() {
  const { attivi } = filtraBacheca(TUTTI_ANNUNCI, FILTRI_VUOTI, oggiIso());
  const anteprima = attivi.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-8 md:py-10">
      <TestataLavoro
        occhiello="TBH Lavoro · lavoro e casting"
        titolo="TBH Lavoro"
        testo="Offerte di lavoro reali: Opportunità TBH e annunci di fonti esterne con link originale. Nessuna posizione inventata."
      />

      <section aria-label="Ultimi annunci">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <h2 className="tbh-display text-2xl md:text-3xl">Bacheca annunci</h2>
          <Link to="/lavoro-casting/bacheca" className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2">
            Tutti gli annunci ({attivi.length}) con filtri <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-2.5">
          {anteprima.map((a) => (
            <RigaAnnuncio key={a.slug} a={a} />
          ))}
        </div>
        <div className="mt-3">
          <NotaCandidature />
        </div>
      </section>

      <div className="mt-8">
        <EvidenzaCercoLavoroHotel />
      </div>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {SEZIONI.map(({ to, icona: Icona, titolo, testo }) => (
          <Link key={to} to={to} className="rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-4 hover:border-[var(--tbh-neon)] flex flex-col">
            <Icona size={20} className="text-[var(--tbh-neon)]" />
            <p className="tbh-display text-xl mt-2">{titolo}</p>
            <p className="text-xs text-[var(--tbh-muted)] mt-1">{testo}</p>
          </Link>
        ))}
      </section>

      <div className="mt-8">
        <BannerAziende />
      </div>
    </div>
  );
}
