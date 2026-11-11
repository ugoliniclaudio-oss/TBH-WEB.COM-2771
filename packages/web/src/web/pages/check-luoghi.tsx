import { Link } from "wouter";
import { FolderOpen, MapPin, MonitorPlay } from "lucide-react";
import { FasciaLuoghi } from "../components/card-luogo";
import {
  CATEGORIE_TBH,
  CITTA_TBH,
  attivitaCitta,
  categorieCitta,
  contaAllestimento,
} from "../../api/data/territorio";
import { PADOVA_DA_RICEVERE } from "../../api/data/territorio/padova";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «CHECK WEB» — LO STANDARD UNICO DELLE POSIZIONI CENSITE

   Regola 0: si propone qui, le pagine vere non si toccano finché la direzione
   non approva. Questa pagina fa vedere il componente unico applicato a tutto
   l'archivio del Territorio TBH, città per città e categoria per categoria.

   Ogni riquadro è la stessa CardLuogo: monitor dominante, nome, categoria e
   città, poi i due pulsanti GOOGLE MAP e APRI SCHEDA. Nessun indirizzo
   internet nudo, nessun elenco di righe di testo.
   ──────────────────────────────────────────────────────────────────────────── */

export default function CheckLuoghiPage() {
  const totale = contaAllestimento();

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-12">
      <p className="tbh-dato text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-neon)]">
        Bozza check web · 18/09/2026
      </p>
      <h1 className="tbh-display mt-2 text-2xl leading-tight md:text-4xl">
        Standard unico delle posizioni censite
      </h1>
      <p className="mt-4 max-w-[860px] text-[15px] leading-relaxed text-white/85">
        Un solo componente per ogni luogo fisico del database — hotel, ristoranti, locali, beach
        club, camping, negozi, centri commerciali, aziende, sedi TBH, circuiti, impianti sportivi,
        teatri, cinema, fiere, location per eventi, attrazioni e partner del Circuito. La card
        risponde a tre domande: <strong>cos'è</strong> (monitor e nome), <strong>dov'è</strong>{" "}
        (Google Map), <strong>cosa offre</strong> (Apri scheda).
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Dato icona={<MonitorPlay size={16} />} titolo="Posizioni in archivio" valore={String(totale.totale)} />
        <Dato icona={<FolderOpen size={16} />} titolo="Schede complete" valore={String(totale.complete)} />
        <Dato
          icona={<MapPin size={16} />}
          titolo="Con un dato da ricevere"
          valore={String(totale.daCompletare)}
        />
      </div>

      <p className="mt-4 text-[12px] leading-snug text-[var(--tbh-muted)]">
        Le schede senza materiale ufficiale dichiarano il monitor «Immagine ufficiale in arrivo» e
        il pulsante mappa resta spento con la dicitura «Posizione in verifica»: nessuna immagine
        ricostruita, nessun indirizzo stimato, nessun pulsante che finge di funzionare.
      </p>

      {CITTA_TBH.map((c) => {
        const dentro = attivitaCitta(c.slug);
        const perCategoria = categorieCitta(c.slug);
        const conta = contaAllestimento(c.slug);

        return (
          <section key={c.slug} className="mt-12 border-t border-[var(--tbh-line)] pt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="tbh-dato text-[11px] font-extrabold uppercase tracking-[0.18em]"
                  style={{ color: c.colore }}
                >
                  <span aria-hidden>{c.emoji}</span> {c.nome} · {c.area}
                </p>
                <h2 className="tbh-display mt-1 text-xl md:text-2xl">{c.titolo}</h2>
              </div>
              <p className="tbh-dato text-[11px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                {conta.totale} posizioni · {conta.daCompletare} da completare
              </p>
            </div>

            {dentro.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-black/40 p-5">
                <p className="tbh-dato text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-neon)]">
                  In allestimento
                </p>
                <p className="mt-2 text-sm text-white/85">
                  Nessuna scheda di {c.nome} è ancora stata letta dal sito ufficiale delle
                  attività: l'archivio resta vuoto e dichiarato, non si riempie con dati presi da
                  portali terzi.
                </p>
                {c.slug === "padova" ? (
                  <ul className="mt-3 list-inside list-disc text-[13px] text-[var(--tbh-muted)]">
                    {PADOVA_DA_RICEVERE.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-10">
                {perCategoria.map((k) => (
                  <div key={k.slug}>
                    <h3
                      className="tbh-dato mb-3 text-[12px] font-extrabold uppercase tracking-[0.16em]"
                      style={{ color: k.colore }}
                    >
                      <span aria-hidden>{k.emoji}</span> {k.titolo}{" "}
                      <span className="text-[var(--tbh-muted)]">· {k.attivita.length}</span>
                    </h3>
                    <FasciaLuoghi
                      etichetta={`${k.titolo} — ${c.nome}`}
                      luoghi={k.attivita}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <section className="mt-12 border-t border-[var(--tbh-line)] pt-8">
        <h2 className="tbh-display text-xl md:text-2xl">Categorie del modello</h2>
        <p className="mt-2 max-w-[860px] text-sm leading-relaxed text-[var(--tbh-muted)]">
          Una posizione che appartiene a più categorie resta <strong>un solo record</strong>: viene
          richiamata in tutte le fasce che la riguardano tramite il suo ID TBH, non riscritta due
          volte.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIE_TBH.map((k) => (
            <span
              key={k.slug}
              className="tbh-dato inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: k.colore, borderColor: `${k.colore}55` }}
            >
              <span aria-hidden>{k.emoji}</span> {k.titolo}
            </span>
          ))}
        </div>
      </section>

      <p className="mt-10 text-[12px] text-[var(--tbh-muted)]">
        Bozza: le pagine pubbliche non sono state modificate.{" "}
        <Link href="/check-web" className="underline hover:text-[var(--tbh-neon)]">
          Torna alle bozze check web
        </Link>
        .
      </p>
    </div>
  );
}

function Dato({
  icona,
  titolo,
  valore,
}: {
  icona: React.ReactNode;
  titolo: string;
  valore: string;
}) {
  return (
    <div className="tbh-card flex items-center gap-3 p-4">
      <span className="text-[var(--tbh-neon)]" aria-hidden>
        {icona}
      </span>
      <span>
        <span className="tbh-display block text-xl">{valore}</span>
        <span className="tbh-dato text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
          {titolo}
        </span>
      </span>
    </div>
  );
}
