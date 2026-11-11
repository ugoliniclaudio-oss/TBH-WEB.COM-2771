import { ExternalLink, Download, Database, ShieldCheck, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { useMediaLibrary } from "../queries/medialibrary";
import { waInfo } from "../lib/whatsapp";
import { LogoBox } from "../components/logo-box";

/** LOGHI E COLLEGAMENTI UFFICIALI — pagina pubblica, in sola lettura.
 *
 *  BLOCCO 1 · punto 7 (28/09/2026): NON è la Libreria Media. La Libreria Media
 *  vera, quella con carica/sostituisci/pubblica, è una sola e sta dentro
 *  /allestimento/media (ordine di Claudio: «non esporre pubblicamente il Media
 *  Manager»). Questa pagina serve solo a mostrare quali loghi e collegamenti
 *  ufficiali abbiamo e quali mancano ancora: due ruoli diversi, non un doppione.
 *  Mostra l'archivio unico di loghi, immagini e collegamenti e il tracciato per
 *  l'importazione massiva (CSV / JSON). Nessun logo ricreato: dove non c'è il file
 *  ufficiale compare il nome per esteso e lo stato «da verificare». */

const COLORE = "#9dff3c";

const STATO_LABEL: Record<string, string> = {
  verificato: "Verificato",
  "da-verificare": "Da verificare",
  "non-disponibile": "Non disponibile",
};

const PROVENIENZA_LABEL: Record<string, string> = {
  "foto-nostra": "Foto nostra",
  "immagine-ufficiale": "Immagine ufficiale utilizzabile",
  incorporata: "Incorporata da servizio esterno",
  "url-di-riferimento": "Solo URL di riferimento",
  assente: "Nessuna immagine caricata",
};

export default function MediaLibraryPage() {
  const q = useMediaLibrary();
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: COLORE }}>
          Loghi e collegamenti ufficiali · Archivio pubblico
        </p>
        <h1 className="tbh-display tbh-h1">Loghi, immagini e collegamenti</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Un solo archivio per loghi, fotografie e link ufficiali, con importazione massiva da CSV o
          JSON invece del caricamento a dieci immagini per volta. Ogni record porta la fonte e lo
          stato di verifica.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border px-4 py-2" style={{ borderColor: `${COLORE}66` }}>
            {d ? `${d.totale} record in archivio` : "caricamento…"}
          </span>
          <span className="rounded-full border px-4 py-2 border-[var(--tbh-line)]">
            {d ? `${d.verificati} verificati` : ""}
          </span>
          <span className="rounded-full border px-4 py-2 border-[var(--tbh-line)]">
            {d ? `${d.conLogo} con logo ufficiale caricato` : ""}
          </span>
        </div>
      </header>

      {/* Regole */}
      <section className="tbh-card p-6 mb-10 border-l-4" style={{ borderLeftColor: COLORE }}>
        <h2 className="tbh-display text-xl mb-3 flex items-center gap-2">
          <ShieldCheck size={20} style={{ color: COLORE }} /> Regole dell'archivio
        </h2>
        <ul className="tbh-body text-[var(--tbh-muted)] space-y-2 text-sm">
          <li>· I loghi si prendono solo dal sito ufficiale dell'organizzazione o dal materiale fornito dalla direzione. Nessun logo ricreato o ridisegnato.</li>
          <li>· I loghi TBH e DM restano gli originali forniti: non vengono mai sostituiti con risultati trovati online.</li>
          <li>· Le fotografie sono classificate per provenienza: foto nostra, immagine ufficiale utilizzabile, incorporata da servizio esterno, semplice URL di riferimento.</li>
          <li>· Un media censito in questa libreria non è per questo un partner o un cliente TBH.</li>
        </ul>
      </section>

      {/* Tracciato di importazione */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4 flex items-center gap-3">
          <Database size={22} style={{ color: COLORE }} /> Tracciato di importazione massiva
        </h2>
        <div className="tbh-card p-6">
          <p className="tbh-body text-[var(--tbh-muted)] mb-4 text-sm">
            Compila un CSV o un JSON con queste colonne e l'archivio importa centinaia di record in
            una volta sola, collegando ogni elemento alla pagina TBH di destinazione.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {(d?.tracciato ?? []).map((c) => (
              <span
                key={c}
                className="rounded-md border border-[var(--tbh-line)] px-3 py-1 text-xs font-mono"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={d?.file.csv ?? "/in-allestimento"}
              download
              className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
            >
              <Download size={16} /> Scarica il tracciato CSV
            </a>
            <a
              href={d?.file.json ?? "/in-allestimento"}
              download
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
            >
              <Download size={16} /> Scarica il tracciato JSON
            </a>
            <a
              href={waInfo("Media Library TBH: invio un file di importazione massiva")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
            >
              Invia il file compilato <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Categorie e record */}
      {(d?.categorie ?? []).map((c) => (
        <section key={c.slug} className="mb-12">
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <h2 className="tbh-display tbh-h2">{c.label}</h2>
            <span className="text-sm text-[var(--tbh-muted)]">
              {c.records.length > 0 ? `${c.records.length} record` : "in allestimento"}
            </span>
          </div>
          {c.nota && <p className="text-sm text-[var(--tbh-muted)] mb-4">{c.nota}</p>}

          {c.records.length === 0 ? (
            <div className="tbh-card p-5 text-sm text-[var(--tbh-muted)]">
              Nessun record verificato in questa categoria: si popola con la prima importazione.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {c.records.map((r) => (
                <article key={r.id} className="tbh-card p-5 flex flex-col">
                  {/* Punto 5: riquadro marchio unico e globale, non un box per pagina. */}
                  <LogoBox
                    nome={r.nome}
                    logo={r.logoUrl}
                    formato="scheda-attivita"
                    altezzaClasse="h-24"
                    fondo="chiaro"
                    className="mb-4"
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[11px] text-[var(--tbh-muted)]">{r.id}</span>
                    <span
                      className="rounded-full border px-2 py-0.5 text-[11px]"
                      style={{
                        borderColor: r.stato === "verificato" ? `${COLORE}88` : "var(--tbh-line)",
                        color: r.stato === "verificato" ? COLORE : "var(--tbh-muted)",
                      }}
                    >
                      {STATO_LABEL[r.stato] ?? r.stato}
                    </span>
                  </div>
                  <h3 className="tbh-display text-xl leading-tight">{r.nome}</h3>
                  {r.nota && <p className="text-sm text-[var(--tbh-muted)] mt-2">{r.nota}</p>}

                  <p className="text-xs text-[var(--tbh-muted)] mt-3 flex items-center gap-2">
                    <ImageIcon size={13} /> {PROVENIENZA_LABEL[r.provenienzaImmagini]}
                  </p>
                  <p className="text-xs text-[var(--tbh-muted)] mt-1">Fonte: {r.fonte}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.sito && (
                      <a
                        href={r.sito}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--tbh-neon)]"
                      >
                        Sito ufficiale <ExternalLink size={12} />
                      </a>
                    )}
                    {r.youtube && (
                      <a
                        href={r.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--tbh-neon)]"
                      >
                        YouTube <ExternalLink size={12} />
                      </a>
                    )}
                    {r.maps && (
                      <a
                        href={r.maps}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--tbh-neon)]"
                      >
                        Mappa <ExternalLink size={12} />
                      </a>
                    )}
                    {r.social.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--tbh-neon)]"
                      >
                        {s.rete} <ExternalLink size={12} />
                      </a>
                    ))}
                    {r.paginaTbh && (
                      <Link
                        to={r.paginaTbh}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"
                        style={{ borderColor: `${COLORE}66`, color: COLORE }}
                      >
                        Pagina TBH collegata
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Cosa manca */}
      <section className="tbh-card p-6 border-l-4 border-l-[#ff8a00]">
        <h2 className="tbh-display text-xl mb-3 flex items-center gap-2">
          <AlertTriangle size={20} className="text-[#ff8a00]" /> Materiale ancora da ricevere
        </h2>
        <ul className="tbh-body text-[var(--tbh-muted)] space-y-2 text-sm">
          {(d?.daRicevere ?? []).map((v) => (
            <li key={v}>· {v}</li>
          ))}
        </ul>
        <a
          href={waInfo("Media Library TBH: invio i link e i loghi mancanti")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
        >
          Invia i link mancanti su WhatsApp <ExternalLink size={14} />
        </a>
      </section>

      <p className="text-xs text-[var(--tbh-muted)] mt-8 max-w-4xl">{d?.nota}</p>
    </div>
  );
}
