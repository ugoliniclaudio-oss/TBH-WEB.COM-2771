import { useState } from "react";
import { Link } from "wouter";
import { Clapperboard, Info, Music4, Route } from "lucide-react";
import { useCastingAperti } from "../queries/casting";
import {
  BarraFiltriCasting,
  CardCasting,
  CaroselloCasting,
  filtraCasting,
  type CastingPubblico,
  type FiltroCasting,
} from "../components/casting-tbh";

/* ────────────────────────────────────────────────────────────────────────────
   CASTING VIDEOCLIP — pagina pubblica (Priorità 2quater del 29/09/2026).

   «Ogni videoclip in preparazione deve poter generare il proprio casting,
    collegato all'ID del brano.»

   La pagina legge il record master dei casting: se la direzione non ne ha aperto
   nessuno, la pagina lo dichiara e resta vuota. Nessun casting di esempio, nessun
   ruolo, nessuna data e nessun compenso inventati.
   ──────────────────────────────────────────────────────────────────────────── */

export default function CastingPage() {
  const q = useCastingAperti();
  const [filtro, setFiltro] = useState<FiltroCasting>("tutti");

  const tutti: CastingPubblico[] = q.data?.casting ?? [];
  const aperti = tutti.filter((c) => c.aperto);
  const chiusi = tutti.filter((c) => !c.aperto);
  const elenco = filtraCasting(tutti, filtro);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
      <header className="tbh-rise mb-9">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
          Touch Music · Road to 2030
        </p>
        <h1 className="tbh-display tbh-h1">CASTING VIDEOCLIP</h1>
        <p className="tbh-body mt-3 max-w-3xl text-[var(--tbh-muted)]">
          {q.data?.sottotitolo ??
            "Partecipa ai prossimi progetti musicali di J.C. Hugò / Touch Music."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tbh/produzioni/road-to-2030"
            className="tbh-body inline-flex items-center gap-2 rounded-full border border-[var(--tbh-gold)] px-5 py-2.5 text-[13px] font-bold text-[var(--tbh-gold)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
          >
            <Route size={16} /> Road to 2030
          </Link>
          <Link
            href="/musica"
            className="tbh-body inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-[13px] font-bold hover:border-[var(--tbh-neon)]"
          >
            <Music4 size={16} /> Il catalogo musicale
          </Link>
          <Link
            href="/lavoro-casting"
            className="tbh-body inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-[13px] font-bold hover:border-[var(--tbh-neon)]"
          >
            <Clapperboard size={16} /> Lavoro &amp; Casting
          </Link>
        </div>
      </header>

      {q.isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tbh-card h-[420px] animate-pulse" />
          ))}
        </div>
      )}

      {q.isError && (
        <div className="tbh-card border-dashed p-6">
          <p className="tbh-body text-[14px] text-[var(--tbh-muted)]">
            L&apos;elenco dei casting non è raggiungibile in questo momento. Riprova fra poco.
          </p>
        </div>
      )}

      {q.data && (
        <>
          {/* IL CAROSELLO VISUALE, come ordinato: locandina, titolo, ruoli, scadenza, stato. */}
          <CaroselloCasting
            casting={aperti}
            vuoto="Nessun casting aperto in questo momento. Quando un videoclip entra in pre-produzione, il suo casting compare qui."
          />

          {tutti.length > 0 && (
            <section className="mt-12">
              <h2 className="tbh-display tbh-h2 mb-4">TUTTI I CASTING</h2>
              <BarraFiltriCasting attivo={filtro} onCambia={setFiltro} />
              {elenco.length === 0 ? (
                <div className="tbh-card mt-5 border-dashed p-6">
                  <p className="tbh-body text-[14px] text-[var(--tbh-muted)]">
                    Nessun casting in questa categoria.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {elenco.map((c) => (
                    <CardCasting key={c.id} c={c} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* LE CATEGORIE DI RUOLO: arrivano dal server, si estendono dal pannello. */}
          {q.data.categorie.length > 0 && (
            <section className="mt-12">
              <h2 className="tbh-display tbh-h3 mb-3">CHI CERCHIAMO</h2>
              <ul className="flex flex-wrap gap-2">
                {q.data.categorie.map((c) => (
                  <li
                    key={c.k}
                    className="tbh-body rounded-full border border-white/12 px-4 py-2 text-[13px]"
                  >
                    {c.segno} {c.nome}
                  </li>
                ))}
              </ul>
              <p className="tbh-body mt-3 text-[12px] text-[var(--tbh-muted)]">
                I ruoli effettivamente ricercati sono quelli indicati in ciascun casting.
              </p>
            </section>
          )}

          {chiusi.length > 0 && (
            <p className="tbh-body mt-10 text-[13px] text-[var(--tbh-muted)]">
              {chiusi.length} casting {chiusi.length === 1 ? "non è più aperto" : "non sono più aperti"}:
              restano consultabili qui sopra con il loro stato reale.
            </p>
          )}

          {/* I CONSENSI: qui c'è solo l'elenco delle spunte, i testi arrivano dall'editore. */}
          <section className="mt-12 tbh-card p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 size-5 shrink-0 text-[var(--tbh-gold)]" />
              <div>
                <h2 className="tbh-display tbh-h3">Consensi richiesti alla candidatura</h2>
                <ul className="mt-3 space-y-1.5">
                  {q.data.consensi.map((c) => (
                    <li key={c.k} className="tbh-body text-[13px]">
                      · {c.etichetta}
                      {c.obbligatorio ? (
                        <span className="text-[var(--tbh-gold)]"> (obbligatorio)</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="tbh-body mt-3 text-[12px] text-[var(--tbh-muted)]">
                  {q.data.consensiNota}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
