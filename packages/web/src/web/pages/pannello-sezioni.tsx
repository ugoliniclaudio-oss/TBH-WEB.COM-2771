import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Lock,
  Search,
} from "lucide-react";
import { SbloccoAllestimento } from "../components/media-slot";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import { useCodiceAllestimento } from "../lib/codice-allestimento";
import { useSezioniAmministrabili } from "../queries/schede";

/**
 * SEZIONI AMMINISTRABILI — l'ingresso unico del pannello (ordine di Claudio, 28/09/2026).
 *
 * «Entri → scegli la sezione → Modifica → carichi foto → inserisci informazioni →
 *  anteprima → pubblichi.»
 *
 * Questa è la prima schermata di quel percorso: l'elenco di tutte le sezioni del sito che
 * si allestiscono da qui, raggruppate per area, con quanti contenuti hanno e in che stato
 * (bozza, anteprima, pubblicato, archiviato). Si sceglie una sezione e si lavora subito:
 * lo stesso modulo che compare nella pagina pubblica, con i comandi amministrativi.
 *
 * Non inventa niente: le sezioni senza contenuti restano a zero, e sul sito il visitatore
 * legge IN ALLESTIMENTO finché non si pubblica qualcosa.
 *
 * Area riservata: senza codice di allestimento non compare nessun comando e nessun
 * contenuto in bozza. Le sezioni marcate «riservata» (Lavoro/Candidature) non escono mai
 * verso il sito pubblico, qualunque stato abbiano le loro schede — il filtro è sul server.
 */

type Conteggi = {
  totale: number;
  bozza: number;
  anteprima: number;
  pubblicato: number;
  archiviato: number;
};

function Numeretto({ n, nome, tono }: { n: number; nome: string; tono: string }) {
  if (n === 0) return null;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${tono}`}>
      {n} {nome}
    </span>
  );
}

export default function PannelloSezioniPage() {
  const { codice } = useCodiceAllestimento();
  const q = useSezioniAmministrabili(codice || undefined);
  const [cerca, setCerca] = useState("");
  const [scelta, setScelta] = useState<string | null>(null);

  const sezioni = q.data?.sezioni ?? [];
  const admin = q.data?.admin ?? false;

  const gruppi = useMemo(() => {
    const testo = cerca.trim().toLowerCase();
    const base = testo
      ? sezioni.filter(
          (s) =>
            s.nome.toLowerCase().includes(testo) ||
            s.chiave.toLowerCase().includes(testo) ||
            s.gruppo.toLowerCase().includes(testo) ||
            (s.descrizione ?? "").toLowerCase().includes(testo),
        )
      : sezioni;
    const mappa = new Map<string, typeof base>();
    for (const s of base) mappa.set(s.gruppo, [...(mappa.get(s.gruppo) ?? []), s]);
    return [...mappa.entries()];
  }, [sezioni, cerca]);

  const scelto = sezioni.find((s) => s.chiave === scelta) ?? null;

  if (q.data && !q.data.attivo) {
    return (
      <main className="tbh-wrap py-14">
        <div className="tbh-card flex items-start gap-3 p-6">
          <AlertTriangle className="shrink-0 text-[var(--tbh-gold)]" size={22} />
          <p className="text-sm text-[var(--tbh-muted)]">
            L&apos;amministrazione dei contenuti è spenta sul server: manca il codice di
            allestimento nelle impostazioni.
          </p>
        </div>
      </main>
    );
  }

  // Area riservata: senza codice non si mostra l'elenco delle sezioni.
  if (!codice) {
    return (
      <main className="tbh-wrap grid gap-6 py-14">
        <header>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            Area riservata
          </p>
          <h1 className="tbh-display tbh-h1">Sezioni amministrabili</h1>
          <p className="tbh-body mt-3 max-w-3xl text-[var(--tbh-muted)]">
            Da qui si allestiscono i contenuti di tutte le sezioni del portale: titoli, testi,
            date, contatti, immagini, gallery e allegati. Serve il codice di allestimento.
          </p>
        </header>
        <SbloccoAllestimento />
      </main>
    );
  }

  // Una sezione scelta: si lavora dentro, con lo stesso modulo della pagina pubblica.
  if (scelto) {
    return (
      <main className="tbh-wrap grid gap-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setScelta(null)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white"
          >
            <ArrowLeft size={14} /> Tutte le sezioni
          </button>
          {scelto.pagina && (
            <Link
              href={scelto.pagina}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--tbh-neon)]"
            >
              Vedi la pagina pubblica <ExternalLink size={13} />
            </Link>
          )}
        </div>

        <header>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            {scelto.gruppo}
          </p>
          <h1 className="tbh-display tbh-h1">{scelto.nome}</h1>
          {scelto.nota && (
            <p className="mt-3 max-w-3xl rounded-xl border border-[var(--tbh-gold)]/40 bg-[var(--tbh-gold)]/5 p-3 text-[12px] text-[var(--tbh-gold)]">
              {scelto.nota}
            </p>
          )}
        </header>

        <SezioneAmministrabile sezione={scelto.chiave} />
      </main>
    );
  }

  return (
    <main className="tbh-wrap grid gap-8 py-10">
      <header>
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
          Pannello riservato · contenuti del sito
        </p>
        <h1 className="tbh-display tbh-h1">Sezioni amministrabili</h1>
        <p className="tbh-body mt-3 max-w-3xl text-[var(--tbh-muted)]">
          Scegli la sezione, aggiungi un contenuto, carica le foto, scrivi le informazioni, guarda
          l&apos;anteprima e pubblica. Per cominciare basta il titolo: il resto si completa anche
          in un altro momento, perché ogni contenuto nasce in bozza e diventa pubblico solo quando
          lo pubblichi tu.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-[var(--tbh-muted)]">
          <Link href="/allestimento/media" className="text-[var(--tbh-neon)] underline">
            Libreria Media TBH
          </Link>
          <Link href="/allestimento" className="underline hover:text-white">
            Allestimento loghi e spazi fissi
          </Link>
        </div>
      </header>

      <label className="tbh-card flex items-center gap-3 p-3">
        <Search size={16} className="text-[var(--tbh-muted)]" />
        <input
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
          placeholder="Cerca una sezione: magazine, miss cool, sport, lavoro, eventi…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--tbh-muted)]"
        />
      </label>

      {q.isLoading && <p className="text-sm text-[var(--tbh-muted)]">Carico le sezioni…</p>}

      {gruppi.map(([gruppo, voci]) => (
        <section key={gruppo} className="grid gap-3">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[var(--tbh-neon)]">{gruppo}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {voci.map((s) => {
              const c = s.conteggi as Conteggi;
              return (
                <button
                  key={s.chiave}
                  type="button"
                  onClick={() => setScelta(s.chiave)}
                  className="tbh-card p-5 text-left transition-colors hover:border-[var(--tbh-neon)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="tbh-h3 font-bold leading-tight">{s.nome}</p>
                    {s.riservata && (
                      <span
                        title="Sezione riservata: non esce mai sul sito pubblico"
                        className="shrink-0 text-[var(--tbh-gold)]"
                      >
                        <Lock size={15} />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--tbh-muted)]">{s.descrizione}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.totale === 0 ? (
                      <span className="rounded-full border border-dashed border-white/25 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--tbh-muted)]">
                        Nessun contenuto
                      </span>
                    ) : (
                      <>
                        <Numeretto
                          n={c.pubblicato}
                          nome="pubblicati"
                          tono="border-[var(--tbh-neon)]/50 text-[var(--tbh-neon)]"
                        />
                        <Numeretto
                          n={c.anteprima}
                          nome="in anteprima"
                          tono="border-[var(--tbh-gold)]/50 text-[var(--tbh-gold)]"
                        />
                        <Numeretto
                          n={c.bozza}
                          nome="bozze"
                          tono="border-white/25 text-[var(--tbh-muted)]"
                        />
                        <Numeretto
                          n={c.archiviato}
                          nome="archiviati"
                          tono="border-white/15 text-white/40"
                        />
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] uppercase tracking-wide text-[var(--tbh-muted)]">
                    {s.pagina ?? "—"} · {s.elemento}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {!q.isLoading && gruppi.length === 0 && (
        <p className="text-sm text-[var(--tbh-muted)]">Nessuna sezione corrisponde alla ricerca.</p>
      )}

      {!admin && (
        <div className="tbh-card flex items-start gap-3 p-5">
          <AlertTriangle className="shrink-0 text-[var(--tbh-gold)]" size={20} />
          <p className="text-[12px] text-[var(--tbh-muted)]">
            Il codice salvato su questo dispositivo non è stato riconosciuto dal server: i comandi
            di modifica restano spenti. Rientra con il codice corretto.
          </p>
        </div>
      )}
    </main>
  );
}
