import { useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  Check,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { SbloccoAllestimento } from "../components/media-slot";
import { CampoGallery, type Materiale } from "../components/media-manager";
import { useCodiceAllestimento } from "../lib/codice-allestimento";
import { pesoLeggibile } from "../lib/ottimizza-immagine";
import {
  useEliminaMedia,
  useMediaLibreria,
  usePubblicaMedia,
  useSostituisciMedia,
  useStatoAllestimento,
} from "../queries/media";

/**
 * LIBRERIA MEDIA TBH — l'archivio unico delle immagini del portale.
 *
 * Ordine di Claudio del 28/09/2026: «Creare una Libreria Media TBH centralizzata in cui ogni
 * immagine caricata sia ricercabile, riutilizzabile, sostituibile, associabile a più contenuti,
 * eliminabile solo dopo avviso se utilizzata altrove». E ancora: «Non esporre pubblicamente
 * il Media Manager».
 *
 * Da qui si vede tutto quello che è stato caricato, con la categoria (TBH, DM, Sport,
 * Influencity, Touch Miss Cool, J.C. Hugò, Eventi, Lavoro, Produzioni, Territorio, Academy),
 * lo stato (bozza, pubblicato, archiviato) e in quanti punti del sito è usato ogni file.
 *
 * Le pagine NON si allestiscono da qui: ogni sezione ha il suo campo immagine sul posto
 * (componente unico). Questa pagina serve a cercare, controllare, sostituire e ripulire.
 */

const STATI: { id: "" | "bozza" | "pubblicato" | "archiviato"; nome: string }[] = [
  { id: "", nome: "Tutti" },
  { id: "pubblicato", nome: "Pubblicati" },
  { id: "bozza", nome: "Bozze" },
  { id: "archiviato", nome: "Archiviati" },
];

export default function PannelloMediaPage() {
  const { codice } = useCodiceAllestimento();
  const stato = useStatoAllestimento();
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [filtroStato, setFiltroStato] = useState<"" | "bozza" | "pubblicato" | "archiviato">("");
  const libreria = useMediaLibreria({
    q,
    categoria,
    stato: filtroStato || undefined,
    codice: codice || undefined,
    limite: 200,
  });
  const pubblica = usePubblicaMedia();
  const sostituisci = useSostituisciMedia();
  const elimina = useEliminaMedia();
  const [avviso, setAvviso] = useState<{ id: number; usato: { id: number; slot: string }[] } | null>(
    null,
  );

  const items = (libreria.data?.items ?? []) as (Materiale & { usi: number })[];
  const categorie = libreria.data?.categorie ?? [];

  if (stato.data && !stato.data.attivo) {
    return (
      <main className="tbh-wrap py-14">
        <div className="tbh-card p-6 flex items-start gap-3">
          <AlertTriangle className="text-[var(--tbh-gold)] shrink-0" size={22} />
          <p className="text-sm text-[var(--tbh-muted)]">
            Il caricamento è spento sul server: manca il codice di allestimento nelle impostazioni.
          </p>
        </div>
      </main>
    );
  }

  // Area riservata: senza codice non si vede nulla dell'archivio.
  if (!codice) {
    return (
      <main className="tbh-wrap py-14 grid gap-6">
        <header>
          <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
            Area riservata
          </p>
          <h1 className="tbh-display tbh-h1">Libreria Media TBH</h1>
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
            L'archivio delle immagini del portale non è pubblico: serve il codice di allestimento.
          </p>
        </header>
        <SbloccoAllestimento />
      </main>
    );
  }

  return (
    <main className="tbh-wrap py-14 grid gap-8">
      <header>
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Amministrazione · Media Manager
        </p>
        <h1 className="tbh-display tbh-h1">Libreria Media TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Tutte le immagini, i loghi e i documenti caricati sul portale, in un posto solo. Ogni
          file si cerca, si sostituisce, si mette in bozza o si pubblica. Un'immagine già qui non
          va ricaricata: si riusa dal campo della sezione, con «Scegli dalla libreria».
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            href="/allestimento"
            className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:text-white inline-flex items-center gap-2"
          >
            <Layers size={13} /> Pannello di allestimento
          </Link>
          <Link
            href="/influencity"
            className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:text-white inline-flex items-center gap-2"
          >
            <ImageIcon size={13} /> Influencity Magazine
          </Link>
        </div>
      </header>

      <section className="tbh-card p-5 grid gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="relative grow min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]"
            />
            <input
              aria-label="Cerca nell'archivio media"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca per titolo, descrizione, tag, spazio o nome del file"
              className="w-full rounded-xl bg-black/50 border border-white/15 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]"
            />
          </label>
          <span className="text-xs text-[var(--tbh-muted)]">
            {libreria.data?.totale ?? 0} materiali · {libreria.data?.bozze ?? 0} in bozza
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoria("")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
              categoria === ""
                ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                : "border-white/15 text-[var(--tbh-muted)]"
            }`}
          >
            Tutte le categorie
          </button>
          {categorie.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategoria(c.slug)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                categoria === c.slug
                  ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                  : "border-white/15 text-[var(--tbh-muted)]"
              }`}
            >
              {c.nome} <span className="opacity-60">({c.n})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATI.map((s) => (
            <button
              key={s.id || "tutti"}
              type="button"
              onClick={() => setFiltroStato(s.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                filtroStato === s.id
                  ? "border-[var(--tbh-gold)] text-[var(--tbh-gold)]"
                  : "border-white/15 text-[var(--tbh-muted)]"
              }`}
            >
              {s.nome}
            </button>
          ))}
        </div>
      </section>

      {avviso && (
        <div className="tbh-card p-5 border-[var(--tbh-gold)]/60 grid gap-3">
          <p className="text-sm text-[var(--tbh-gold)] inline-flex items-start gap-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>
              Questo file è usato in <b className="text-white">{avviso.usato.length}</b> altri punti
              del sito ({avviso.usato.map((u) => u.slot).join(", ")}). Eliminandolo sparisce anche
              da lì.
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                elimina.mutate(
                  { codice, id: avviso.id, forza: true },
                  { onSuccess: () => setAvviso(null) },
                )
              }
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-red-400/60 text-red-300 hover:bg-red-400/10"
            >
              Elimina comunque
            </button>
            <button
              type="button"
              onClick={() => setAvviso(null)}
              className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)]"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="tbh-card p-6 flex items-start gap-3">
          <FolderOpen className="text-[var(--tbh-muted)] shrink-0" size={22} />
          <p className="text-sm text-[var(--tbh-muted)]">
            Nessun materiale con questi filtri. Le immagini si caricano dal campo della sezione
            (ogni scheda ha il suo) oppure dal riquadro di prova qui sotto.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <article
              key={m.id}
              className="tbh-card p-3 flex flex-col gap-3"
            >
              <div className="rounded-xl bg-white h-[150px] grid place-items-center overflow-hidden">
                {m.tipo === "documento" ? (
                  <span className="text-black/70 text-[10px] font-bold uppercase tracking-wide">
                    Documento
                  </span>
                ) : (
                  <img
                    src={m.url}
                    alt={m.descrizione ?? m.titolo ?? ""}
                    loading="lazy"
                    className="max-h-[146px] w-auto object-contain"
                  />
                )}
              </div>

              <div className="grid gap-1">
                <h2 className="text-sm font-bold leading-tight line-clamp-2">
                  {m.titolo ?? m.chiave.split("/").pop()}
                </h2>
                <p className="text-[10px] uppercase tracking-wide text-[var(--tbh-muted)]">
                  {m.categoria} · {m.tipo}
                  {m.stato === "pubblicato" ? (
                    <span className="text-[var(--tbh-neon)]"> · pubblicato</span>
                  ) : (
                    <span className="text-[var(--tbh-gold)]"> · {m.stato}</span>
                  )}
                </p>
                <p className="text-[10px] text-[var(--tbh-muted)] break-all">{m.slot}</p>
                <p className="text-[10px] text-[var(--tbh-muted)]">
                  {m.larghezza ? `${m.larghezza}×${m.altezza}px · ` : ""}
                  {pesoLeggibile(m.peso)}
                  {m.usi > 1 ? ` · usata in ${m.usi} punti` : ""}
                  {m.urlOriginale ? " · originale conservato" : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                <a
                  href={m.urlOriginale ?? m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:border-white/40"
                >
                  Apri
                </a>
                <label className="px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)] hover:text-white inline-flex items-center gap-1.5 cursor-pointer">
                  <RefreshCw size={11} /> Sostituisci
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      sostituisci.mutate({
                        codice,
                        id: m.id,
                        slot: m.slot,
                        file,
                        tipo: m.tipo === "logo" ? "logo" : m.tipo === "documento" ? "documento" : "immagine",
                      });
                    }}
                  />
                </label>
                {m.stato !== "pubblicato" ? (
                  <button
                    type="button"
                    onClick={() => pubblica.mutate({ codice, id: m.id, stato: "pubblicato" })}
                    className="px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-[var(--tbh-neon)] text-[var(--tbh-neon)] inline-flex items-center gap-1.5"
                  >
                    <Check size={11} /> Pubblica
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => pubblica.mutate({ codice, id: m.id, stato: "archiviato" })}
                    className="px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)]"
                  >
                    Archivia
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    elimina.mutate(
                      { codice, id: m.id },
                      { onSuccess: (r) => !r.ok && setAvviso({ id: m.id, usato: r.usato }) },
                    )
                  }
                  className="px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-red-400/40 text-red-300 hover:bg-red-400/10 inline-flex items-center gap-1.5"
                >
                  <Trash2 size={11} /> Elimina
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Riquadro di servizio: qui si caricano i materiali che non appartengono ancora a
          nessuna scheda (restano in libreria, pronti da riusare dove serviranno). */}
      <section className="tbh-card p-5 grid gap-4">
        <div>
          <h2 className="tbh-display text-2xl leading-tight">Carica in libreria</h2>
          <p className="text-xs text-[var(--tbh-muted)] mt-1 max-w-3xl">
            Materiale che arriva ora e serve dopo: si carica qui e resta a disposizione di tutte
            le sezioni. Dal campo immagine di ogni scheda si scegli con «Scegli dalla libreria».
          </p>
        </div>
        <CampoGallery
          slot="libreria:generale"
          etichetta="Materiali in attesa di destinazione"
          aiuto="Le foto vengono ottimizzate per il web e l'originale resta conservato. I loghi ufficiali non vengono mai modificati."
        />
      </section>
    </main>
  );
}
