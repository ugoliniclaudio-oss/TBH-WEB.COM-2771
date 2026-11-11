import { Link } from "wouter";
import { Puzzle, Gift, Hammer } from "lucide-react";
import { useGiochi } from "../queries/rete";
import { GiochiGiocabili } from "../components/giochi-play";

export default function GiochiPage() {
  const q = useGiochi();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Rompicapo e punti bonus
        </p>
        <h1 className="tbh-display tbh-h1">Giochi di mente</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Rebus, cruciverba, sudoku, memory e quiz del gruppo. Ogni partita darà punti bonus
          convertibili in sconti e omaggi del Touch Plaza Shop. Regolamento e soglie premio in
          definizione: nessun premio annunciato prima che sia verificato.
        </p>
      </header>

      {/* Giochi veri e giocabili subito (memory, sudoku, quiz) con gettoni reali. */}
      <GiochiGiocabili />

      <h2 className="tbh-display tbh-h2 mt-16 mb-6">In arrivo</h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(q.data?.items ?? []).map((g) => (
          <article key={g.nome} className="tbh-card p-6 flex flex-col">
            <div className="h-28 w-full rounded-2xl bg-white grid place-items-center mb-5">
              <Puzzle size={54} className="text-black/80" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="tbh-display text-2xl leading-tight">{g.nome}</h2>
              <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-white/10 text-[var(--tbh-muted)] px-2.5 py-1 rounded-full">
                <Hammer size={13} /> {g.stato}
              </span>
            </div>
            <p className="text-sm text-[var(--tbh-muted)] mt-3 grow">{g.nota}</p>
            <Link to="/in-allestimento" className="mt-5 tbh-neon-btn px-5 py-2.5 text-sm self-start">
              Avvisami all'apertura
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-14 tbh-card p-6 md:p-8 flex items-start gap-4">
        <Gift className="text-[var(--tbh-neon)] shrink-0" size={28} />
        <div>
          <h2 className="tbh-display tbh-h2 mb-2">Come funzioneranno i premi</h2>
          <p className="text-sm text-[var(--tbh-muted)] max-w-3xl">
            I punti si accumulano giocando e si spendono sul Touch Plaza Shop sotto forma di sconto o
            omaggio. Le soglie esatte e il regolamento vanno validati prima della pubblicazione:
            finché non sono confermati, questa sezione resta in allestimento.
          </p>
          <Link to="/shop" className="tbh-neon-btn inline-block mt-5 px-6 py-3">
            Vai al Touch Plaza Shop
          </Link>
        </div>
      </section>
    </div>
  );
}
