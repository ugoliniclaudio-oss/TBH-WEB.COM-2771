import { useState } from "react";
import { Link } from "wouter";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useVisibilita } from "../queries/visibilita";
import { wa } from "../lib/whatsapp";

/**
 * Brand & Personalizzazioni → BRAND IN INTERVISTA · STUDIO · DIRETTA.
 * Selettore a 6 scene, immagine grande con hotspot numerati cliccabili (frecce + numeri in
 * overlay, non disegnati dentro la foto), spiegazione della posizione sotto l'immagine.
 * Nessun prezzo, nessun marchio reale: il marchio dimostrativo è sempre "IL TUO BRAND".
 */
export default function VisibilitaInOndaPage() {
  const q = useVisibilita();
  const [scenaIdx, setScenaIdx] = useState(0);
  const [posSel, setPosSel] = useState<number | null>(null);

  const scene = q.data?.scene ?? [];
  const scena = scene[scenaIdx];
  const posizioni = scena?.posizioni ?? [];
  const selezionata = posizioni.find((p) => p.numero === posSel) ?? null;
  const marchio = q.data?.marchioDemo ?? "IL TUO BRAND";

  const waSimulazione = wa(
    selezionata && scena
      ? `Vorrei una simulazione del mio brand nella posizione "${selezionata.titolo}" (${scena.titolo}).`
      : "Vorrei una simulazione del mio brand in intervista, in studio o in diretta.",
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <Link
          to="/tbh/brand-personalizzazioni"
          className="inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)] mb-4"
        >
          <ArrowLeft size={16} /> Brand &amp; Personalizzazioni
        </Link>
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Brand &amp; Personalizzazioni · sottosezione
        </p>
        <h1 className="tbh-display tbh-h1">
          Brand in intervista · studio · diretta
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Non compri «uno spot». Da una sola trasmissione nascono decine di occasioni in cui il tuo
          marchio si vede: scegli la scena, tocca i numeri sull'immagine e guarda dove finisce{" "}
          <span className="text-[var(--tbh-neon)] font-semibold">{marchio}</span>.
        </p>
        {q.data && (
          <p className="text-sm text-[var(--tbh-gold)] mt-2">
            {q.data.conteggi.scene} scene · {q.data.conteggi.posizioni} posizioni pubblicitarie
            spiegate una per una
          </p>
        )}
      </header>

      {/* Selettore a 6 schede */}
      <div className="flex flex-wrap gap-2 mb-6">
        {scene.map((s, i) => (
          <button
            key={s.slug}
            onClick={() => {
              setScenaIdx(i);
              setPosSel(null);
            }}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide border transition ${
              i === scenaIdx
                ? "bg-[var(--tbh-neon)] text-black border-[var(--tbh-neon)]"
                : "border-[var(--tbh-line)] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {q.isLoading && <div className="tbh-card h-[420px] animate-pulse" />}

      {scena && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
          {/* Immagine grande con hotspot numerati */}
          <div className="tbh-card overflow-hidden">
            <div className="relative">
              <img
                src={scena.immagine}
                alt={`Simulazione: ${scena.titolo}`}
                className="w-full block"
              />
              {/* Etichetta del marchio dimostrativo */}
              <span className="absolute top-3 left-3 bg-black/75 text-[var(--tbh-neon)] text-[11px] md:text-xs font-bold tracking-[0.18em] px-3 py-1.5 rounded-full">
                {marchio}
              </span>
              <span className="absolute bottom-3 right-3 bg-black/75 text-white/70 text-[10px] md:text-[11px] px-3 py-1.5 rounded-full">
                Simulazione dimostrativa
              </span>

              {posizioni.map((p) => {
                const attiva = p.numero === posSel;
                return (
                  <button
                    key={p.numero}
                    onClick={() => setPosSel(attiva ? null : p.numero)}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    aria-label={`Posizione ${p.numero}: ${p.titolo}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  >
                    <span
                      className={`grid place-items-center rounded-full font-bold tbh-display text-sm md:text-base w-7 h-7 md:w-9 md:h-9 border-2 transition ${
                        attiva
                          ? "bg-[var(--tbh-neon)] text-black border-white scale-110"
                          : "bg-black/80 text-[var(--tbh-neon)] border-[var(--tbh-neon)] hover:bg-[var(--tbh-neon)] hover:text-black"
                      }`}
                    >
                      {p.numero}
                    </span>
                    <span className="hidden md:block absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap bg-black/85 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      {p.titolo}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-5">
              <h2 className="tbh-display tbh-h2">{scena.titolo}</h2>
              <p className="text-sm text-[var(--tbh-gold)] mt-1">{scena.sottotitolo}</p>
              <div className="mt-4 rounded-2xl border border-[var(--tbh-line)] p-4 min-h-[110px]">
                {selezionata ? (
                  <>
                    <p className="text-xs text-[var(--tbh-muted)] uppercase tracking-[0.18em]">
                      Posizione {selezionata.numero}
                    </p>
                    <h3 className="tbh-display text-xl md:text-2xl text-[var(--tbh-neon)] mt-1">
                      {selezionata.titolo}
                    </h3>
                    <p className="tbh-body text-[var(--tbh-platinum)] mt-2">
                      {selezionata.spiegazione}
                    </p>
                    <a
                      href={wa(
                        `Vorrei il mio brand in questa posizione: "${selezionata.titolo}" (${scena.titolo}).`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="tbh-neon-btn px-4 py-2.5 text-sm inline-flex items-center gap-2 mt-4"
                    >
                      <MessageCircle size={16} /> Voglio questa posizione
                    </a>
                  </>
                ) : (
                  <p className="tbh-body text-[var(--tbh-muted)]">
                    Tocca un numero sull'immagine: qui compare la spiegazione di quella forma di
                    visibilità.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Elenco cliccabile delle posizioni della scena */}
          <div className="tbh-card p-5">
            <h3 className="tbh-display text-lg md:text-xl mb-3">
              Le {posizioni.length} posizioni di questa scena
            </h3>
            <ul className="grid gap-2">
              {posizioni.map((p) => (
                <li key={p.numero}>
                  <button
                    onClick={() => setPosSel(p.numero === posSel ? null : p.numero)}
                    className={`w-full text-left flex items-start gap-3 rounded-xl px-3 py-2.5 border transition ${
                      p.numero === posSel
                        ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/10"
                        : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                    }`}
                  >
                    <span className="tbh-display text-[var(--tbh-neon)] w-6 shrink-0">
                      {p.numero}
                    </span>
                    <span className="text-sm font-semibold">{p.titolo}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Prima · Durante · Dopo */}
      <section className="mt-12">
        <h2 className="tbh-display tbh-h2 mb-2">Prima · Durante · Dopo</h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-5">
          Una sola collaborazione produce visibilità in tre momenti diversi: nei giorni precedenti,
          in onda e per tutto il tempo in cui il contenuto resta online.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {(q.data?.momenti ?? []).map((m, i) => (
            <div key={m.fase} className="tbh-card p-5">
              <div className="flex items-baseline gap-3">
                <span className="tbh-display text-4xl text-[var(--tbh-neon)]">{i + 1}</span>
                <h3 className="tbh-display text-2xl uppercase">{m.fase}</h3>
              </div>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">{m.nota}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {m.voci.map((v) => (
                  <span
                    key={v}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--tbh-line)] text-[var(--tbh-platinum)]"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA finale */}
      <section className="mt-12 tbh-card p-6 md:p-10 text-center">
        <h2 className="tbh-display text-3xl md:text-5xl leading-tight">
          Vuoi vedere il tuo brand in questa posizione?
        </h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-2xl mx-auto mt-3">
          Ti prepariamo una simulazione con il tuo marchio sulle superfici che ti interessano. Nessun
          prezzo standard: si definisce sulla combinazione scelta.
        </p>
        <a
          href={waSimulazione}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-7 py-4 text-base md:text-lg inline-flex items-center gap-2 mt-6"
        >
          <MessageCircle size={20} /> Richiedi una simulazione
        </a>
        <p className="text-xs text-[var(--tbh-muted)] mt-4">WhatsApp +39 379 208 8524</p>
      </section>

      {q.data && (
        <p className="text-xs text-[var(--tbh-muted)] mt-8 max-w-4xl">{q.data.nota}</p>
      )}
    </div>
  );
}
