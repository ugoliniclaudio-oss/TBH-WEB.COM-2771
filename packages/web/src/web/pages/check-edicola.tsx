import { Link } from "wouter";
import { ArrowRight, CheckCircle2, CircleDashed, Info, Newspaper, RefreshCw } from "lucide-react";

import { useHomeEdicola, useOggiSuTbh } from "../queries/edicola";
import { FasciaEdicola } from "../components/card-edicola";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «EDICOLA TBH» — proposta del 28/09/2026.

   Regola 0 (docs/regole-ferree.md): la home vera e il menu non si toccano. Le
   pagine dell'Edicola esistono già ai loro indirizzi e funzionano, ma NON sono
   ancora collegate alla navigazione principale: si guardano da qui, si
   approvano, e solo dopo entrano nel menu e nella home.

   Questa pagina mostra due cose:
     1. l'elenco degli indirizzi nuovi, ognuno da aprire e controllare;
     2. l'ANTEPRIMA ESATTA del carosello «OGGI SU TBH» come apparirebbe nella
        home del portale, per decidere se metterlo e dove.
   ──────────────────────────────────────────────────────────────────────────── */

const PAGINE = [
  {
    href: "/edicola",
    titolo: "Home dell'Edicola",
    cosa: "Monitor grande «Ultima Ora» che gira da sé, più una fascia scorrevole per ogni sezione, con l'indice a pillole in alto.",
  },
  {
    href: "/edicola/territorio",
    titolo: "Sezione — esempio: Territorio",
    cosa: "La fascia diventa griglia completa, con filtro per territorio e per sottocategoria, e l'elenco delle fonti di quella sezione col loro stato reale.",
  },
  {
    href: "/edicola/eventi",
    titolo: "Sezione — Eventi & Fiere",
    cosa: "Stessa struttura: qui i contenuti con data diventano schede evento.",
  },
  {
    href: "/edicola/oroscopo",
    titolo: "Oroscopo del giorno",
    cosa: "Dodici segni più il Segno del Giorno. Finché la redazione non scrive il testo, il segno dice IN ALLESTIMENTO: nessun oroscopo generato dal sito.",
  },
  {
    href: "/edicola/giochi",
    titolo: "Giochi dell'Edicola",
    cosa: "I tre giochi reali del portale incorporati con i gettoni veri, e sotto i sette in allestimento col motivo per cui non sono accesi.",
  },
  {
    href: "/edicola/fonti",
    titolo: "Le nostre fonti",
    cosa: "Tutte le testate lette con l'esito dell'ultimo controllo, e l'elenco delle fonti ESCLUSE con il motivo dell'esclusione.",
  },
];

export default function CheckEdicolaPage() {
  const home = useHomeEdicola();
  const oggi = useOggiSuTbh();

  const fasce = home.data?.fasce ?? [];
  const piene = fasce.filter((f) => f.items.length > 0);
  const vuote = fasce.filter((f) => f.items.length === 0);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-10">
      {/* ── INTESTAZIONE DELLA BOZZA ────────────────────────────────────── */}
      <header className="tbh-rise flex flex-col gap-3">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--tbh-gold)]/50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-gold)]">
          Bozza — da approvare
        </p>
        <h1 className="tbh-display tbh-h1 flex flex-wrap items-center gap-3">
          <Newspaper size={30} className="text-[var(--tbh-neon)]" aria-hidden /> EDICOLA TBH
        </h1>
        <p className="tbh-body max-w-4xl text-[var(--tbh-muted)]">
          Le pagine sono pronte e funzionano con dati reali. Non sono ancora nel menu e non sono
          ancora nella home: si controllano da qui. Quando dai l'ok, entrano nella navigazione.
        </p>
        {typeof home.data?.totale === "number" && (
          <p className="text-[12px] text-[var(--tbh-muted)]">
            In archivio <strong className="text-[var(--tbh-neon)]">{home.data.totale}</strong>{" "}
            contenuti letti dalle fonti verificate · {piene.length} sezioni già piene ·{" "}
            {vuote.length} sezioni ancora vuote (dichiarate, non riempite).
          </p>
        )}
      </header>

      {/* ── 1 · GLI INDIRIZZI DA CONTROLLARE ───────────────────────────── */}
      <section className="mt-9" aria-label="Pagine da controllare">
        <h2 className="tbh-display mb-4 tbh-h3">1 · Le pagine, una per una</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {PAGINE.map((p) => (
            <article key={p.href} className="tbh-card flex flex-col gap-2 p-4">
              <h3 className="text-[15px] font-extrabold text-white">{p.titolo}</h3>
              <p className="grow text-sm text-[var(--tbh-muted)]">{p.cosa}</p>
              <Link
                to={p.href}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
              >
                Apri {p.href} <ArrowRight size={13} aria-hidden />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-[var(--tbh-muted)]">
          La scheda di un singolo contenuto si apre dal pulsante APRI SCHEDA di qualsiasi card:
          l'indirizzo è <code className="text-white">/edicola/articolo/…</code> per un articolo e{" "}
          <code className="text-white">/edicola/eventi/…</code> per un evento. Mai due pagine per lo
          stesso contenuto.
        </p>
      </section>

      {/* ── 2 · STATO DELLE SEZIONI ─────────────────────────────────────── */}
      {fasce.length > 0 && (
        <section className="mt-12" aria-label="Stato delle sezioni">
          <h2 className="tbh-display mb-4 tbh-h3">2 · Cosa è pieno e cosa è ancora vuoto</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="tbh-card flex flex-col gap-2 p-4">
              <h3 className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#2ECC71]">
                <CheckCircle2 size={14} aria-hidden /> Sezioni con contenuti reali ({piene.length})
              </h3>
              <ul className="flex flex-wrap gap-2">
                {piene.map((f) => (
                  <li key={f.slug}>
                    <Link
                      to={f.href}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] transition hover:-translate-y-0.5"
                      style={{ borderColor: `${f.colore}55`, color: f.colore }}
                    >
                      {f.emoji} {f.titolo}
                      <span className="text-[var(--tbh-muted)]">{f.items.length}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="tbh-card flex flex-col gap-2 border-dashed p-4">
              <h3 className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-gold)]">
                <CircleDashed size={14} aria-hidden /> Sezioni ancora vuote ({vuote.length})
              </h3>
              <ul className="flex flex-col gap-1">
                {vuote.map((f) => (
                  <li key={f.slug} className="text-sm text-[var(--tbh-muted)]">
                    <Link to={f.href} className="font-extrabold text-white hover:text-[var(--tbh-neon)]">
                      {f.emoji} {f.titolo}
                    </Link>
                    {f.tipo === "rimando"
                      ? " — ha già la sua pagina ufficiale nel portale: l'Edicola la richiama, non la duplica."
                      : f.tipo === "interna"
                        ? " — sezione interna dell'Edicola, si apre dal suo pulsante."
                        : " — nessun feed collegato: si popola dal pannello quando la redazione scrive."}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── 3 · ANTEPRIMA DEL CAROSELLO PER LA HOME ─────────────────────── */}
      <section className="mt-12" aria-label="Anteprima OGGI SU TBH">
        <h2 className="tbh-display mb-2 tbh-h3">3 · Proposta per la home: «OGGI SU TBH»</h2>
        <p className="mb-5 max-w-[95ch] text-sm text-[var(--tbh-muted)]">
          Questo è il blocco che entrerebbe nella home del portale, esattamente così, sopra o sotto
          la sezione PRIMA SERATA — lo decidi tu. Finché non lo approvi, la home resta come è
          adesso: qui è solo un'anteprima.
        </p>

        <div className="rounded-2xl border border-dashed border-[var(--tbh-gold)]/40 p-3 md:p-5">
          {oggi.isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                <RefreshCw size={14} className="animate-spin" aria-hidden /> Lettura dei contenuti
                di oggi…
              </span>
            </div>
          ) : oggi.isError ? (
            <p className="p-4 text-sm text-[#FF6B6B]">
              L'anteprima non è disponibile in questo momento.
            </p>
          ) : (
            <FasciaEdicola
              emoji={oggi.data?.emoji ?? "📰"}
              titolo={oggi.data?.titolo ?? "OGGI SU TBH"}
              descrizione="Le ultime dall'Edicola TBH: news, eventi, sport, musica, cinema e TV."
              href={oggi.data?.href ?? "/edicola"}
              items={oggi.data?.items ?? []}
              colore="var(--tbh-gold)"
            />
          )}
        </div>
      </section>

      {/* ── 4 · COSA MANCA PRIMA DI PUBBLICARE ─────────────────────────── */}
      <section className="tbh-card mt-12 flex flex-col gap-3 p-5 md:p-7">
        <h2 className="tbh-display flex items-center gap-2 tbh-h3">
          <Info size={20} className="text-[var(--tbh-neon)]" aria-hidden /> Cosa manca prima di
          pubblicare
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-[var(--tbh-muted)]">
          <li>
            · <strong className="text-white">Il tuo ok sugli indirizzi</strong> — se vanno bene
            così, l'Edicola entra nel menu principale e il carosello entra nella home.
          </li>
          <li>
            · <strong className="text-white">Pannello redazione</strong> — da fare: la pagina da cui
            scrivi l'oroscopo del giorno, accendi e spegni le fonti e pubblichi i contenuti TBH. Il
            servizio dietro è già pronto e collaudato.
          </li>
          <li>
            · <strong className="text-white">Le sezioni vuote</strong> — restano dichiarate vuote
            finché non arrivano contenuti veri: nessun titolo di riserva, nessuna immagine
            generata per riempire il buco.
          </li>
        </ul>
        <div className="mt-1 flex flex-wrap gap-2">
          <Link to="/edicola" className="tbh-neon-btn px-4 py-2 text-[12px]">
            Apri l'Edicola
          </Link>
          <Link
            to="/check-web"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            Torna alle bozze
          </Link>
        </div>
      </section>
    </div>
  );
}
