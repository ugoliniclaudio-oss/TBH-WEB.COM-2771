import { Link } from "wouter";
import { ArrowRight, Info, Radio, RefreshCw, Rss } from "lucide-react";

import { useHomeEdicola } from "../queries/edicola";
import { FasciaEdicola, MonitorUltimaOra } from "../components/card-edicola";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA TBH — LA HOME.

   Impianto richiesto dalla direzione: un monitor grande «ULTIMA ORA» che gira
   da sé, e sotto le fasce tematiche, una per sezione, ognuna scorrevole col
   dito su telefono e con le frecce su computer.

   Due regole che governano questa pagina:
     · un contenuto può comparire in più fasce, ma il pulsante APRI SCHEDA porta
       sempre allo STESSO indirizzo canonico (nessun doppione);
     · dove la fascia è vuota lo si dichiara. Nessun titolo di riserva, nessuna
       immagine generata per riempire il buco.
   ──────────────────────────────────────────────────────────────────────────── */

export default function EdicolaPage() {
  const q = useHomeEdicola();
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-10">
      {/* ── INTESTAZIONE ────────────────────────────────────────────────── */}
      <header className="tbh-rise flex flex-col gap-3">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-gold)]">
          <Rss size={12} aria-hidden /> Rassegna quotidiana TBH
        </p>
        <h1 className="tbh-display tbh-h1">{d?.titolo ?? "EDICOLA TBH"}</h1>
        <p className="tbh-body max-w-4xl text-[var(--tbh-muted)]">
          {d?.sottotitolo ??
            "News • Eventi • Sport • Musica • Cinema • TV • Animali • Oroscopo • Giochi."}
        </p>

        {/* Pulsanti di servizio: sempre una destinazione vera. */}
        <div className="mt-1 flex flex-wrap gap-2">
          <Link to="/edicola/oroscopo" className="tbh-neon-btn px-4 py-2 text-[12px]">
            🔮 Oroscopo del giorno
          </Link>
          <Link
            to="/edicola/giochi"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            🎮 Giochi
          </Link>
          <Link
            to="/edicola/fonti"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            📡 Le nostre fonti
          </Link>
        </div>

        {/* BLOCCO 1 · punto 5 (28/09/2026) — RUOLI CHIARI, NIENTE TRE ARCHIVI UGUALI.
            L'EDICOLA è l'hub: da qui si raggiungono la rivista e le notizie, che
            restano due cose distinte e ognuna a casa sua. Niente contenuti copiati
            qui dentro: solo le due porte, con scritto cosa c'è dietro. */}
        <nav aria-label="Dove portano i contenuti editoriali" className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            to="/influencity"
            className="tbh-card group flex items-start gap-3 p-4 transition hover:border-[var(--tbh-neon)]"
          >
            <span className="mt-[2px] text-[var(--tbh-neon)]">
              <Rss size={18} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-extrabold uppercase tracking-[0.14em]">
                Touch Influencity Magazine
              </span>
              <span className="tbh-body mt-1 block text-[13px] text-[var(--tbh-muted)]">
                La rivista: numeri, copertine, speciali e inserti.
              </span>
            </span>
            <ArrowRight
              size={16}
              aria-hidden
              className="ml-auto mt-1 shrink-0 text-[var(--tbh-muted)] transition group-hover:translate-x-1 group-hover:text-white"
            />
          </Link>
          <Link
            to="/news"
            className="tbh-card group flex items-start gap-3 p-4 transition hover:border-[var(--tbh-neon)]"
          >
            <span className="mt-[2px] text-[var(--tbh-neon)]">
              <Radio size={18} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-extrabold uppercase tracking-[0.14em]">
                News TBH
              </span>
              <span className="tbh-body mt-1 block text-[13px] text-[var(--tbh-muted)]">
                Le notizie e gli articoli, divisi per categoria.
              </span>
            </span>
            <ArrowRight
              size={16}
              aria-hidden
              className="ml-auto mt-1 shrink-0 text-[var(--tbh-muted)] transition group-hover:translate-x-1 group-hover:text-white"
            />
          </Link>
        </nav>
      </header>

      {/* ── INDICE DELLE FASCE: si salta dove si vuole ───────────────────── */}
      {d && d.fasce.length > 0 && (
        <nav
          aria-label="Sezioni dell'Edicola"
          /* Smartphone: la fila si scorre col dito. Computer: va a capo, cosi'
             tutte le sezioni sono in vista e nessuna resta nascosta a destra. */
          className="tbh-scroll-x mt-6 flex gap-2 pb-1 md:flex-wrap md:overflow-visible"
        >
          {d.fasce.map((f) => (
            <Link
              key={`indice-${f.slug}`}
              to={f.href}
              className="shrink-0 rounded-full border bg-black/40 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition hover:-translate-y-0.5"
              style={{ borderColor: `${f.colore}55`, color: f.colore }}
            >
              {f.emoji} {f.titolo}
              <span className="ml-1 text-[var(--tbh-muted)]">{f.items.length}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* ── MONITOR ULTIMA ORA ──────────────────────────────────────────── */}
      <section className="mt-7" aria-label="Ultima ora">
        {q.isLoading ? (
          <div className="tbh-card flex aspect-[16/9] w-full items-center justify-center border-dashed">
            <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
              <RefreshCw size={14} className="animate-spin" aria-hidden /> Lettura delle fonti…
            </span>
          </div>
        ) : (
          <MonitorUltimaOra items={d?.monitor ?? []} />
        )}
      </section>

      {/* ── LE FASCE ────────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col gap-12">
        {(d?.fasce ?? []).map((f) => (
          <FasciaEdicola
            key={f.slug}
            emoji={f.emoji}
            titolo={f.titolo}
            descrizione={f.descrizione}
            href={f.href}
            items={f.items}
            rimando={f.rimando}
            colore={f.colore}
            vuotoTesto={
              f.tipo === "rimando"
                ? "Questa sezione ha già la sua pagina ufficiale nel portale: l'Edicola la richiama e non ne fa una copia. Usa il pulsante qui sopra."
                : f.tipo === "interna"
                  ? "Sezione interna dell'Edicola: si apre col pulsante qui sopra."
                  : undefined
            }
          />
        ))}
      </div>

      {/* ── NOTA SULLE FONTI ────────────────────────────────────────────── */}
      <section className="tbh-card mt-14 flex flex-col gap-3 p-5 md:p-7">
        <h2 className="tbh-display flex items-center gap-2 tbh-h3">
          <Info size={20} className="text-[var(--tbh-neon)]" aria-hidden /> Come lavora l'Edicola
        </h2>
        <p className="max-w-[95ch] text-sm text-[var(--tbh-muted)]">{d?.nota}</p>
        <p className="max-w-[95ch] text-sm text-[var(--tbh-muted)]">{d?.notaEsterni}</p>
        {typeof d?.totale === "number" && (
          <p className="text-[12px] text-[var(--tbh-muted)]">
            In archivio <strong className="text-[var(--tbh-neon)]">{d.totale}</strong> contenuti
            pubblicati, letti dalle fonti verificate o scritti dalla redazione.
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-2">
          <Link
            to="/edicola/fonti"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            <Radio size={14} aria-hidden /> Elenco delle fonti e degli esclusi
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </section>

      {q.isError && (
        <p className="mt-6 text-sm text-[#FF6B6B]">
          L'Edicola non ha potuto leggere l'archivio in questo momento. Nessun contenuto di riserva
          viene mostrato al suo posto.
        </p>
      )}
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="edicola-news" />
      </div>
    </div>
  );
}
