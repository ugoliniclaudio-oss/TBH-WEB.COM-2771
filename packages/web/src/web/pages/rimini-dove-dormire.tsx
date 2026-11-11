import { MessageCircle } from "lucide-react";
import { CaroselloOrizzontale, CellaCarosello } from "../components/carosello-orizzontale";
import { SchedaTerritorio } from "../components/scheda-territorio";
import { InAllestimento } from "../components/in-allestimento";
import { wa } from "../lib/whatsapp";
import {
  ATTIVITA_RIMINI,
  CATEGORIE_RIMINI,
  RIMINI_DESCRIZIONE,
  RIMINI_TITOLO,
  attivitaPerCategoria,
  contaAllestimento,
} from "../../api/data/rimini-territorio";

/* ────────────────────────────────────────────────────────────────────────────
   TERRITORIO TBH — RIMINI · «Dove dormire, mangiare e divertirsi a Rimini»

   Fondo nero, testi bianchi, dettagli giallo fluo: lo stesso vestito del resto
   del sito, preso dalle variabili di styles.css (nessun colore scritto a mano
   dentro la pagina, a parte il colore proprio di ciascuna categoria).

   Una fascia per categoria, ogni fascia è un carosello orizzontale: col dito su
   telefono, con le frecce su computer. Le schede sono il preset globale
   SchedaTerritorio: la pagina non ridisegna nessuna card.

   I dati stanno tutti in api/data/rimini-territorio.ts, dove è scritto anche
   quali campi sono ancora in verifica. Qui non si aggiunge nemmeno un numero.
   ──────────────────────────────────────────────────────────────────────────── */

export default function RiminiDoveDormirePage() {
  const conta = contaAllestimento();

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
      <p className="tbh-dato text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--tbh-neon)]">
        Territorio TBH · Rimini
      </p>

      <h1 className="tbh-display tbh-h1 mt-3">{RIMINI_TITOLO}</h1>

      <p className="tbh-body mt-3 max-w-3xl text-[var(--tbh-muted)]">{RIMINI_DESCRIZIONE}</p>

      {/* Scorciatoie alle fasce: ancore vere, niente pulsanti che non portano da nessuna parte. */}
      <nav aria-label="Categorie" className="mt-6 flex flex-wrap gap-2">
        {CATEGORIE_RIMINI.map((c) => (
          <a
            key={c.slug}
            href={`#${c.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
          >
            <span aria-hidden>{c.emoji}</span>
            {c.titolo}
            <span className="text-[var(--tbh-muted)]">({attivitaPerCategoria(c.slug).length})</span>
          </a>
        ))}
      </nav>

      {/* Come si legge la scheda: dichiarato in chiaro, così nessuno scambia una
          verifica in corso per un dato pubblicato. */}
      <div className="tbh-card mt-6 p-5">
        <h2 className="tbh-display text-lg">Come leggere queste schede</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--tbh-muted)]">
          Indirizzi, telefoni e collegamenti sono stati letti uno per uno dal sito ufficiale di
          ogni attività. Dove il sito ufficiale non pubblica un dato, la riga resta{" "}
          <span className="font-semibold text-white">IN ALLESTIMENTO</span> e il riquadro del
          marchio riporta <span className="font-semibold text-white">Immagine in aggiornamento</span>
          : nessun dato viene ricostruito a occhio e nessun pulsante porta nel vuoto. Il pulsante{" "}
          <span className="font-semibold text-white">Prenota</span> apre la prenotazione assistita
          TBH su WhatsApp con il messaggio già scritto.
        </p>
        <p className="tbh-dato mt-3 text-[11px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
          {conta.totale} attività in scheda · {conta.daCompletare} con almeno un dato ancora in
          verifica
        </p>
      </div>

      {CATEGORIE_RIMINI.map((c) => {
        const elenco = attivitaPerCategoria(c.slug);
        return (
          <section key={c.slug} id={c.slug} className="mt-12 scroll-mt-24">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="tbh-display text-2xl" style={{ color: c.colore }}>
                <span aria-hidden className="mr-2">
                  {c.emoji}
                </span>
                {c.titolo}
              </h2>
              <span className="tbh-dato text-[11px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                {elenco.length} attività
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--tbh-muted)]">{c.testo}</p>

            {elenco.length > 0 ? (
              <CaroselloOrizzontale etichetta={`${c.titolo} a Rimini`} className="mt-5">
                {elenco.map((a) => (
                  <CellaCarosello key={a.id}>
                    <SchedaTerritorio attivita={a} categoria={c} />
                  </CellaCarosello>
                ))}
              </CaroselloOrizzontale>
            ) : (
              <div className="mt-5 max-w-sm">
                <InAllestimento cosa={`Fascia ${c.titolo} — Rimini`} />
              </div>
            )}
          </section>
        );
      })}

      {/* Etichette commerciali: esistono nella scheda, ma si accendono solo
          quando l'accordo è confermato. Finché non lo è, IN ALLESTIMENTO. */}
      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="tbh-card p-5">
          <h2 className="tbh-display text-lg">Partner TBH, convenzioni e promozioni</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--tbh-muted)]">
            Le schede prevedono le etichette <span className="text-white">Partner TBH</span>,{" "}
            <span className="text-white">Convenzionato</span> e{" "}
            <span className="text-white">Promozione</span>. Nessuna è accesa: verranno applicate
            solo alle attività con accordo confermato, una per una.
          </p>
          <div className="mt-4 max-w-xs">
            <InAllestimento cosa="Convenzioni Rimini" />
          </div>
        </div>

        <div className="tbh-card flex flex-col p-5">
          <h2 className="tbh-display text-lg">Prenotazione assistita</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--tbh-muted)]">
            Per hotel, ristoranti, beach club e villaggi la prenotazione si può chiedere
            direttamente all'assistenza TBH: il messaggio parte già compilato con il nome della
            struttura.
          </p>
          <a
            href={wa(
              "Buongiorno, vorrei informazioni su dove dormire, mangiare e divertirsi a Rimini.",
            )}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn mt-4 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide"
          >
            <MessageCircle size={16} /> Scrivi all'assistenza TBH
          </a>
        </div>
      </section>

      <p className="tbh-dato mt-10 text-[11px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
        Verifica dei recapiti sui siti ufficiali: 17/09/2026 · {ATTIVITA_RIMINI.length} schede
      </p>
    </div>
  );
}
