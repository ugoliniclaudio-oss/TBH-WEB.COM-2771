import { ExternalLink, Radio, Users, AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";
import { useMediaLibrary } from "../queries/medialibrary";
import { useRadioPartner } from "../queries/anagrafica";
import { waInfo } from "../lib/whatsapp";
import { LogoBox } from "../components/logo-box";

/** MEDIA, RADIO, TV & CURIOSITÀ — pagina additiva.
 *  Censisce emittenti e pagine SENZA farle sembrare partnership TBH.
 *  I numeri di follower e audience di terzi non vengono mai sommati a quelli TBH:
 *  qui non si pubblica nessun dato di audience finché non è verificato. */

const COLORE = "#ff2b2b";

export default function RadioTvCuriositaPage() {
  const q = useMediaLibrary();
  const radioPartner = useRadioPartner();
  const d = q.data;
  const radio = (d?.records ?? []).filter((r) => r.categoria === "radio-tv");
  const social = (d?.records ?? []).filter((r) => r.categoria === "social");

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: COLORE }}>
          Media censiti · non partnership TBH
        </p>
        <h1 className="tbh-display tbh-h1">Media, Radio, TV &amp; Curiosità</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Raccolta di emittenti, pagine e community collegate al mondo TBH. Una scheda unica per ogni
          media, richiamata nelle varie sezioni senza duplicazioni.
        </p>
      </header>

      <section className="tbh-card p-6 mb-10 border-l-4" style={{ borderLeftColor: COLORE }}>
        <h2 className="tbh-display text-lg mb-2 flex items-center gap-2">
          <Info size={18} style={{ color: COLORE }} /> Come vanno letti questi elenchi
        </h2>
        <p className="tbh-body text-sm text-[var(--tbh-muted)]">
          Un media presente in questa pagina è <strong>censito</strong>, non è per questo un partner
          o un cliente del Circuito. I follower e l'audience di terzi non vengono mai sommati ai
          numeri TBH: restano voci separate — community collegate, pagine gestite, media
          seguiti/censiti, audience dei media — così ogni numero resta verificabile. Per i media
          partner effettivi del gruppo resta la pagina{" "}
          <Link to="/network/media-partner" className="underline" style={{ color: COLORE }}>
            Media Partner TBH
          </Link>
          .
        </p>
      </section>

      {/* Radio nazionali censite */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4 flex items-center gap-3">
          <Radio size={22} style={{ color: COLORE }} /> Radio e canali censiti
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {radio.map((r) => (
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
              <h3 className="tbh-display text-xl leading-tight">{r.nome}</h3>
              {r.nota && <p className="text-sm text-[var(--tbh-muted)] mt-2">{r.nota}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {r.sito && (
                  <a
                    href={r.sito}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{ borderColor: `${COLORE}66`, color: COLORE }}
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
              </div>
              <p className="text-[11px] text-[var(--tbh-muted)] mt-3">Fonte: {r.fonte}</p>
            </article>
          ))}
        </div>
        <p className="text-xs text-[var(--tbh-muted)] mt-4 max-w-4xl">
          Per ogni emittente la scheda prevede anche live streaming, frequenze o canale, Instagram,
          app iOS e Android e TV/DTT: questi campi restano vuoti finché non sono verificati uno per
          uno sulle fonti ufficiali.
        </p>
      </section>

      {/* Pagine, gruppi e community di Claudio Ugolini */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4 flex items-center gap-3">
          <Users size={22} style={{ color: COLORE }} /> Claudio Ugolini — Pagine, Gruppi &amp; Community
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {social.map((r) => (
            <article key={r.id} className="tbh-card p-5 flex flex-col">
              <div className="h-24 w-full rounded-xl bg-white relative grid place-items-center overflow-hidden p-3 mb-4">
                <span className="tbh-display text-2xl text-black/80 text-center px-2 leading-tight">
                  {r.nome}
                </span>
              </div>
              <h3 className="tbh-display text-xl leading-tight">{r.nome}</h3>
              {r.nota && <p className="text-sm text-[var(--tbh-muted)] mt-2">{r.nota}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {r.social.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{ borderColor: `${COLORE}66`, color: COLORE }}
                  >
                    {s.rete} <ExternalLink size={12} />
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-[var(--tbh-muted)] mt-3">Fonte: {r.fonte}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Casting / Lavoro: link mancante */}
      <section className="tbh-card p-6 mb-10 border-l-4 border-l-[#ff8a00]">
        <h2 className="tbh-display text-xl mb-3 flex items-center gap-2">
          <AlertTriangle size={20} className="text-[#ff8a00]" /> Casting / Lavoro — collegamento da completare
        </h2>
        <p className="tbh-body text-sm text-[var(--tbh-muted)]">
          Il pulsante «Casting e opportunità di lavoro» è pronto: manca solo l'URL Facebook da
          associare, che non è arrivato insieme al testo. Appena lo mandi viene collegato qui e nella
          pagina Lavoro. Nota tecnica: un indirizzo Facebook di tipo <code>/share/</code> è meno
          stabile del link permanente della pagina — se recuperi l'URL permanente si usa quello come
          collegamento principale e lo <code>/share/</code> resta solo come riferimento.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/lavoro-casting"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Vai alla sezione Lavoro
          </Link>
          <a
            href={waInfo("Invio il link Facebook della sezione Casting / Lavoro")}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
          >
            Invia il link su WhatsApp <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* RADIO E TV PARTNER — link ufficiali forniti da Claudio il 30/08/2026.
          I loghi non sono stati forniti: si mostra il PULSANTE col nome, nessun logo inventato. */}
      <section className="tbh-card p-6 mb-10 border-l-4" style={{ borderLeftColor: COLORE }}>
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: COLORE }}>
          Link ufficiali confermati
        </p>
        <h2 className="tbh-display text-xl mb-3 flex items-center gap-2">
          <Radio size={20} style={{ color: COLORE }} /> Radio e TV partner
        </h2>
        <p className="tbh-body text-sm text-[var(--tbh-muted)] mb-5 max-w-4xl">
          Emittenti collegate al mondo TBH con sito ufficiale verificato. Loghi, frequenze e
          streaming diretti non sono ancora stati forniti: appena arrivano, compaiono qui senza
          toccare il resto della pagina.
        </p>

        {radioPartner.isLoading && (
          <p className="tbh-body text-sm text-[var(--tbh-muted)]">Caricamento…</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(radioPartner.data?.records ?? []).map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[var(--tbh-line)] p-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--tbh-muted)]">
                  {r.id} · {r.tipo}
                </p>
                <h3 className="tbh-display text-base mt-1">{r.nome}</h3>
              </div>
              <p className="text-xs text-[var(--tbh-muted)]">
                Frequenze: {r.frequenze ?? "da ricevere"} · Streaming:{" "}
                {r.streaming ? "disponibile" : "da ricevere"}
              </p>
              {r.sito ? (
                <a
                  href={r.sito}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-neon-btn inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold"
                >
                  Sito ufficiale <ExternalLink size={14} />
                </a>
              ) : (
                <Link
                  to="/in-allestimento"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]"
                >
                  In allestimento
                </Link>
              )}
              {r.daRicevere.length > 0 && (
                <p className="text-[11px] text-[var(--tbh-muted)]">
                  Manca ancora: {r.daRicevere.join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/anagrafica"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Anagrafica master TBH
          </Link>
          <a
            href={waInfo("Invio loghi, frequenze e streaming delle radio e TV partner")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Invia loghi e frequenze <ExternalLink size={14} />
          </a>
        </div>
      </section>

      <section className="tbh-card p-6">
        <h2 className="tbh-display text-xl mb-3">Come cresce questo censimento</h2>
        <p className="tbh-body text-sm text-[var(--tbh-muted)]">
          La stessa scheda si estende a radio, TV, quotidiani, magazine, web TV, streaming, podcast,
          YouTube, Facebook, Instagram e TikTok. I record vivono nella{" "}
          <Link to="/media/libreria" className="underline" style={{ color: COLORE }}>
            Media Library TBH
          </Link>
          , dove si importano in blocco da CSV o JSON invece di caricarli dieci alla volta.
        </p>
      </section>
    </div>
  );
}
