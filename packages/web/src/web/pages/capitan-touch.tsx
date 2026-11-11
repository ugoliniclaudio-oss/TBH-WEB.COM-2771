/**
 * PAGINA PUBBLICA DEL GIOCO — «CAPITAN TOUCH: A CACCIA DEI NEURONI PERDUTI»
 *
 * Spiega come funziona, mostra le tre pose ufficiali, il contatore pubblico dei
 * Neuroni d'Oro (senza dire in quale pagina si trovano) e l'area personale del
 * giocatore: neuroni trovati, premi conquistati, premi utilizzati.
 */
import { useEffect, useState } from "react";
import { Brain, Trophy, Sparkles, Clock, Eye, CheckCircle2, Info } from "lucide-react";
import { codiceGiocatore } from "../lib/giocatore";
import {
  useContatoreOro,
  usePortafoglioCapitan,
  useSegnaUsato,
  useStatoCapitan,
} from "../queries/capitan";

const POSE = [
  {
    file: "/capitan-touch/capitan-saluta.png",
    titolo: "Ti saluta e ti indica",
    testo: "Quando è di buon umore si presenta e ti fa segno: quel dito indica un neurone.",
  },
  {
    file: "/capitan-touch/capitan-cerca.png",
    titolo: "Cerca i neuroni perduti",
    testo: "Si guarda intorno per ritrovare i neuroni che ha perso in giro per il portale.",
  },
  {
    file: "/capitan-touch/capitan-scappa.png",
    titolo: "E poi scappa",
    testo: "Resta in pagina 5–10 secondi. Se non sei svelto, sparisce fuori dallo schermo.",
  },
];

const CATEGORIE = [
  {
    chiave: "comune",
    icona: "🧠",
    nome: "Neurone Comune",
    testo: "Il gettone base. Si accumula: più ne raccogli, più sali.",
    colore: "var(--tbh-neon)",
  },
  {
    chiave: "speciale",
    icona: "🧠",
    nome: "Neurone Speciale",
    testo: "Più raro. Vale come indizio o come gettone di valore superiore.",
    colore: "#33e0ff",
  },
  {
    chiave: "premio",
    icona: "🧠",
    nome: "Neurone Premio",
    testo: "Dà diritto a un premio vero, deciso dalla direzione TBH.",
    colore: "#ff8a00",
  },
  {
    chiave: "oro",
    icona: "🥇",
    nome: "Neurone d'Oro",
    testo: "Pezzo unico: 5 in tutto il portale. Chi lo prende lo toglie dal gioco per sempre.",
    colore: "var(--tbh-gold)",
  },
] as const;

export default function CapitanTouchPage() {
  const [giocatore, setGiocatore] = useState("");
  useEffect(() => setGiocatore(codiceGiocatore()), []);

  const stato = useStatoCapitan(giocatore);
  const oro = useContatoreOro();
  const portafoglio = usePortafoglioCapitan(giocatore);
  const segnaUsato = useSegnaUsato();

  const s = stato.data;
  const o = oro.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      {/* ── Apertura ── */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="tbh-rise">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--tbh-neon)]">
            Gioco ufficiale TBH-WEB
          </p>
          <h1 className="tbh-display mt-3">
            CAPITAN TOUCH
            <br />
            <span className="text-[var(--tbh-gold)]">A CACCIA DEI NEURONI PERDUTI</span>
          </h1>
          <p className="tbh-body mt-5 max-w-[62ch]">
            Capitan Touch gira per il portale e perde i suoi neuroni. Compare all'improvviso in una
            pagina qualsiasi, fa la sua gag e dopo pochi secondi scappa. Se lo prendi al volo, il
            neurone è tuo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="tbh-card px-4 py-2 inline-flex items-center gap-2">
              <Clock size={16} className="text-[var(--tbh-neon)]" /> Resta in pagina 5–10 secondi
            </span>
            <span className="tbh-card px-4 py-2 inline-flex items-center gap-2">
              <Eye size={16} className="text-[var(--tbh-neon)]" /> Massimo{" "}
              {s?.max ?? 3} ritrovamenti al giorno
            </span>
            <span className="tbh-card px-4 py-2 inline-flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--tbh-neon)]" /> Un avatar per volta
            </span>
          </div>
        </div>

        <img
          src="/capitan-touch/capitan-saluta.png"
          alt="Capitan Touch"
          className="tbh-capitan-alone mx-auto h-[46vh] w-auto"
        />
      </section>

      {/* ── Contatore pubblico dei Neuroni d'Oro ── */}
      <section className="mt-14">
        <div
          className="tbh-card p-6 md:p-8 flex flex-wrap items-center justify-between gap-6"
          style={{ borderColor: "var(--tbh-gold)" }}
        >
          <div>
            <h2 className="tbh-h2 inline-flex items-center gap-3">
              <Trophy className="text-[var(--tbh-gold)]" size={26} /> NEURONI D'ORO IN CIRCOLAZIONE
            </h2>
            <p className="text-sm text-[var(--tbh-muted)] mt-2 max-w-[70ch]">
              Sono pochi e non si dice dove sono. Quando uno viene conquistato esce dal gioco per
              sempre: il contatore scende e non risale.
            </p>
          </div>
          <p
            className="tbh-display leading-none"
            style={{ color: "var(--tbh-gold)", fontSize: "clamp(2.6rem, 7vw, 4.6rem)" }}
          >
            {oro.isLoading ? "…" : o?.esauriti ? "ESAURITI" : `${o?.disponibili ?? 0}/${o?.totali ?? 0}`}
          </p>
        </div>
      </section>

      {/* ── Le tre pose ufficiali ── */}
      <section className="mt-14">
        <h2 className="tbh-h2">COME SI PRESENTA</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {POSE.map((p) => (
            <article key={p.file} className="tbh-card p-6 flex flex-col items-center text-center">
              <img
                src={p.file}
                alt={p.titolo}
                className="tbh-capitan-alone h-56 w-auto"
                loading="lazy"
              />
              <h3 className="tbh-h3 mt-5">{p.titolo}</h3>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">{p.testo}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Le quattro categorie ── */}
      <section className="mt-14">
        <h2 className="tbh-h2">I QUATTRO NEURONI</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIE.map((c) => (
            <article key={c.chiave} className="tbh-card p-6" style={{ borderColor: c.colore }}>
              <p className="text-3xl">{c.icona}</p>
              <h3 className="tbh-h3 mt-3" style={{ color: c.colore }}>
                {c.nome}
              </h3>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">{c.testo}</p>
              <p className="mt-4 text-2xl font-bold text-white">
                {s ? s.neuroni[c.chiave] : 0}
                <span className="text-xs text-[var(--tbh-muted)] font-normal"> tuoi</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Area personale ── */}
      <section className="mt-14">
        <h2 className="tbh-h2">LA TUA CACCIA</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Riquadro etichetta="Neuroni trovati" valore={portafoglio.data?.items.length ?? 0} />
          <Riquadro etichetta="Premi conquistati" valore={s?.premiConquistati ?? 0} />
          <Riquadro etichetta="Premi utilizzati" valore={s?.premiUtilizzati ?? 0} />
          <Riquadro
            etichetta="Ritrovamenti che restano oggi"
            valore={s?.rimasti ?? 0}
            colore="var(--tbh-gold)"
          />
        </div>

        <div className="tbh-card mt-6 p-6">
          {portafoglio.isLoading && <p className="tbh-body">Carico la tua caccia…</p>}
          {!portafoglio.isLoading && !portafoglio.data?.items.length && (
            <p className="tbh-body text-[var(--tbh-muted)]">
              Non hai ancora preso nessun neurone. Gira per il portale: Capitan Touch compare
              quando meno te lo aspetti.
            </p>
          )}
          {!!portafoglio.data?.items.length && (
            <ul className="divide-y divide-[var(--tbh-line)]">
              {portafoglio.data.items.map((r) => (
                <li key={r.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-3">
                    {r.neurone === "oro" ? (
                      <Trophy size={18} className="text-[var(--tbh-gold)]" />
                    ) : (
                      <Brain size={18} className="text-[var(--tbh-neon)]" />
                    )}
                    <span>
                      <strong className="text-white">{r.titolo}</strong>
                      <span className="text-xs text-[var(--tbh-muted)] block">
                        trovato il {r.giorno} in {r.pagina}
                      </span>
                    </span>
                  </span>
                  {r.usato ? (
                    <span className="text-xs uppercase tracking-wide text-[var(--tbh-muted)] inline-flex items-center gap-2">
                      <CheckCircle2 size={15} /> Utilizzato
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={segnaUsato.isPending}
                      onClick={() => segnaUsato.mutate({ giocatore, id: r.id })}
                      className="text-xs uppercase tracking-wide underline text-[var(--tbh-muted)] hover:text-white disabled:opacity-50"
                    >
                      Segna come utilizzato
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Regole e avvertenze, senza inventare premi ── */}
      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="tbh-card p-6">
          <h3 className="tbh-h3 inline-flex items-center gap-2">
            <Info size={20} className="text-[var(--tbh-neon)]" /> LE REGOLE
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-[var(--tbh-muted)] list-disc pl-5">
            <li>Ogni giocatore ha {s?.max ?? 3} ritrovamenti al giorno. Il conteggio riparte ogni giorno.</li>
            <li>Se Capitan Touch scappa senza essere preso, non perdi nessun ritrovamento.</li>
            <li>Non compare mai due volte contemporaneamente nella stessa navigazione.</li>
            <li>
              I premi hanno una scorta globale: si può giocare tutti, ma i Neuroni d'Oro restano
              cinque per tutto il portale.
            </li>
            <li>Un solo premio per comparsa: il doppio click non vale due neuroni.</li>
          </ul>
        </div>
        <div className="tbh-card p-6">
          <h3 className="tbh-h3">PREMI E RISCATTO</h3>
          <p className="text-sm text-[var(--tbh-muted)] mt-4">
            I neuroni sono gettoni di gioco. I premi commerciali collegati (offerte, omaggi, coupon
            presso le attività aderenti) vengono scritti dalla direzione TBH nel pannello del gioco:
            finché non sono pubblicati, la finestra di vittoria indica il premio come da definire.
            Nessun valore o sconto viene indicato qui senza conferma.
          </p>
          <p className="text-sm text-[var(--tbh-muted)] mt-4">
            Il gioco riconosce il giocatore con un codice anonimo salvato su questo dispositivo:
            svuotando i dati del browser il conteggio dei tuoi neuroni si perde.
          </p>
        </div>
      </section>
    </div>
  );
}

function Riquadro({
  etichetta,
  valore,
  colore = "var(--tbh-neon)",
}: {
  etichetta: string;
  valore: number;
  colore?: string;
}) {
  return (
    <div className="tbh-card p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--tbh-muted)]">{etichetta}</p>
      <p className="tbh-display mt-2" style={{ color: colore, fontSize: "clamp(2rem,5vw,3rem)" }}>
        {valore}
      </p>
    </div>
  );
}
