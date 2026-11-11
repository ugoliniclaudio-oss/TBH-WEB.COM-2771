import { Link } from "wouter";
import { RulloTbh } from "../components/rullo-tbh";
import { IN_EVIDENZA, RULLI_HOME, contaAnteprime } from "../lib/schermi-palinsesto";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «REGIA» — INTERFACCIA A PALINSESTO VISUALE, fase 1 e 2 (08/09/2026).

   Richiesta di Claudio: la Home diventa la regia generale dell'ecosistema, con
   IN EVIDENZA in grande e sotto i rulli orizzontali di schermi 16:9 — e la domanda
   che ha posto: «qui ci sono già molti contenuti, link, collegamenti, altrimenti
   dobbiamo rifare tutto da capo?».

   La risposta è dentro questo file: NON si rifà niente. Questa pagina non contiene
   un solo contenuto nuovo. Prende i 24 canali e le loro 89 voci di programmazione,
   che sono già le pagine canoniche del sito, e le mostra come schermi. Se domani
   la bozza viene bocciata, si cancella questa pagina e il sito è esattamente
   com'era: la home vera (pages/index.tsx) non è stata toccata (regola 0).

   Vive su /check-web/regia, cioè dentro l'area bozza già concordata.
   ──────────────────────────────────────────────────────────────────────────── */

export default function RegiaPage() {
  const conta = contaAnteprime(RULLI_HOME);

  return (
    <div className="mx-auto max-w-[1500px] px-3 md:px-6 py-5 md:py-8">
      {/* ── Cartello di bozza: questa pagina non è il sito pubblicato ───────── */}
      <div className="rounded-2xl border border-[var(--tbh-gold)]/50 bg-[var(--tbh-gold)]/[0.06] p-3 md:p-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-gold)]">
          Bozza · non pubblicata
        </p>
        <h1 className="tbh-h2 mt-1">REGIA GENERALE · palinsesto visuale</h1>
        <p className="tbh-body mt-2 text-[var(--tbh-muted)] max-w-[80ch]">
          Proposta di home a schermi e rulli orizzontali. Non è stato creato nessun
          contenuto nuovo e nessuna pagina nuova: gli schermi puntano alle pagine che
          esistono già, ognuna al suo unico indirizzo. La home attuale resta intatta
          finché non dici di sì.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/check-web"
            className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
          >
            ← RULLO DEI 24 CANALI
          </Link>
          <Link
            to="/"
            className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
          >
            HOME ATTUALE
          </Link>
        </div>
      </div>

      {/* ── IN EVIDENZA: schermi grandi, stesso rapporto 16:9 ───────────────── */}
      <RulloEvidenza />

      {/* ── I RULLI, nell'ordine della specifica ────────────────────────────── */}
      {RULLI_HOME.map((r) => (
        <RulloTbh
          key={r.chiave}
          titolo={r.titolo}
          occhiello={r.occhiello}
          schermi={r.schermi}
          tutti={r.tutti ?? null}
          ariaPrecedente={r.diCanali ? "Canale precedente" : undefined}
          ariaSuccessivo={r.diCanali ? "Canale successivo" : undefined}
        />
      ))}

      {/* ── Dichiarazione onesta di quello che manca ────────────────────────── */}
      <p className="mt-8 text-[11px] leading-relaxed text-[var(--tbh-muted)] max-w-[90ch]">
        Su {conta.totale} schermi, {conta.conLogo} mostrano un marchio o uno stemma reale già
        presente nel sito; {conta.senza} dichiarano «anteprima in allestimento». Non ci mettiamo
        una foto finta né il logo di un'altra società: appena arrivano le immagini ufficiali
        prendono il posto dello slot, senza toccare la struttura.
      </p>
    </div>
  );
}

/** IN EVIDENZA — la vetrina grande in cima, anch'essa scorrevole. */
function RulloEvidenza() {
  return (
    <RulloTbh
      titolo="IN EVIDENZA"
      occhiello="La regia"
      schermi={IN_EVIDENZA}
      ariaPrecedente="Canale precedente"
      ariaSuccessivo="Canale successivo"
      grande
      classeSezione="mt-6 md:mt-8"
    />
  );
}
