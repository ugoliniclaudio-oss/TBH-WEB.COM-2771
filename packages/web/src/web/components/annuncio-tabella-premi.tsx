/**
 * ANNUNCIO — «TABELLA FISSO + PREMI COMMERCIALI» · Content Creator / Assistente Digitale /
 * Segreteria Smart Working (06/10/2026).
 *
 * Importi trascritti dalla tabella consegnata da Claudio, cifra per cifra, con le due note
 * originali. Nessun dato aggiunto: niente sede, contratto, scadenza — la tabella non li indica.
 * Candidature: solo lavoro@tibihacca.com.
 */
import { Mail } from "lucide-react";
import { GalleriaSlide } from "./galleria-slide";

const EMAIL = "lavoro@tibihacca.com";
const OGGETTO = "Candidatura — Content Creator / Assistente Digitale / Segreteria Smart Working";
const CORPO =
  "Ruolo (Content Creator / Assistente Digitale / Segreteria):\nFormula (2 / 4 / 6 / 8 ore al giorno):\nCittà:\n\nBreve presentazione:\n\n\n(Allego il mio CV)";
const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent(OGGETTO)}&body=${encodeURIComponent(CORPO)}`;

const TRAGUARDI = [
  { c: 20, premio: "+€150" },
  { c: 50, premio: "+€300" },
  { c: 100, premio: "+€600" },
  { c: 200, premio: "+€900" },
  { c: 300, premio: "+€1.200+" },
];

const FORMULE = [
  { nome: "Supporto ridotto", ore: "2 h/giorno", v: ["€500", "€650", "€800", "€1.100", "€1.400", "€1.700+"] },
  { nome: "Part-time", ore: "4 h/giorno", v: ["€1.000", "€1.150", "€1.300", "€1.600", "€1.900", "€2.200+"] },
  { nome: "Part-time esteso", ore: "6 h/giorno", v: ["€1.500", "€1.650", "€1.800", "€2.100", "€2.400", "€2.700+"] },
  { nome: "Full-time", ore: "8 h/giorno", v: ["€2.000", "€2.150", "€2.300", "€2.600", "€2.900", "€3.200+"] },
];

export function AnnuncioTabellaPremi() {
  return (
    <section id="tabella-fisso-premi" className="tbh-card p-5 md:p-8 mb-12 border-2 border-[var(--tbh-neon)] min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          Opportunità TBH
        </span>
        <span className="rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
          Candidature aperte
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Pubblicato il 06/10/2026</span>
      </div>
      <h2 className="tbh-display tbh-h1 leading-[0.95] [overflow-wrap:anywhere]">
        Tabella fisso + <span className="text-[var(--tbh-neon)]">premi commerciali</span>
      </h2>
      <p className="tbh-display text-xl md:text-2xl mt-3">Content Creator / Assistente Digitale / Segreteria Smart Working</p>
      <p className="tbh-body mt-3">5 traguardi commerciali: 20 • 50 • 100 • 200 • 300 contatti qualificati.</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {TRAGUARDI.map((t) => (
          <div key={t.c} className="rounded-2xl border border-[var(--tbh-line)] p-3 text-center">
            <p className="text-xs text-[var(--tbh-muted)]">{t.c} contatti</p>
            <p className="tbh-display text-2xl text-[var(--tbh-neon)] mt-1">{t.premio}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--tbh-line)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-black text-[var(--tbh-neon)] text-left">
              <th className="p-3">Formula</th>
              <th className="p-3">Fisso mensile garantito</th>
              {TRAGUARDI.map((t) => (
                <th key={t.c} className="p-3">{t.c} contatti</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FORMULE.map((f) => (
              <tr key={f.nome} className="border-t border-[var(--tbh-line)]">
                <td className="p-3 font-semibold">
                  {f.nome}
                  <span className="block text-xs text-[var(--tbh-muted)] font-normal">{f.ore}</span>
                </td>
                {f.v.map((x, i) => (
                  <td key={i} className={`p-3 ${i === 0 ? "font-bold text-white" : ""}`}>{x}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--tbh-gold)]/60 p-4 text-sm">
        <p className="font-bold text-[var(--tbh-gold)]">Nota importante</p>
        <p className="mt-1">
          Il fisso è garantito a prescindere dagli obiettivi commerciali. I premi commerciali si aggiungono al fisso.
          Eventuali provvigioni su vendite concluse non sono incluse in questa tabella.
        </p>
        <p className="mt-2 text-xs text-[var(--tbh-muted)]">
          * Importi lordi indicativi mensili. ** I contatti devono essere qualificati e validati secondo regolamento interno.
        </p>
      </div>

      <a href={MAIL} className="tbh-neon-btn mt-6 px-6 py-3 inline-flex items-center gap-2">
        <Mail size={18} /> Candidati · invia CV a {EMAIL}
      </a>

      <div className="mt-8 max-w-3xl">
        <GalleriaSlide
          slide={[{ src: "/lavoro/tabella-premi/tabella-fisso-premi.jpg", titolo: "Tabella fisso + premi commerciali (originale)" }]}
          nome="Tabella fisso + premi commerciali"
        />
      </div>
    </section>
  );
}
