import { useCompanies } from "../queries/catalog";
import { LinkTile } from "../components/tiles";
import { SlotMedia } from "../components/media-slot";
import { useCopertine } from "../components/immagine-tbh";
import { anteprimaGriglia, hrefSocieta, ORDINE_GRUPPO, trovaKit } from "../lib/kit-societa";
import { TBH } from "../lib/appartenenza";
import { ContentCard } from "../components/content-card";

/** 04/10/2026 — prima le società con il banner ufficiale «logo | TBH», nell'ordine di Claudio. */
function posizione(codice: string) {
  const i = (ORDINE_GRUPPO as readonly string[]).indexOf(codice);
  return i === -1 ? ORDINE_GRUPPO.length : i;
}

/** Logo ufficiale nei dati del sito, oppure quello caricato dal pannello. */
function logoDi(dati: string | null, caricato: string | null | undefined) {
  return dati ?? caricato ?? null;
}

/*
 * 03/10/2026 — «perché non ci sono i loghi come anteprima?»
 * L'anteprima-pulsante usa, in quest'ordine:
 *   1. il LOGO PULSANTE ufficiale del kit (logo + PARTE DEL GRUPPO TBH, già nella grafica);
 *   2. altrimenti il LOGO ufficiale su fondo nero, con sotto la fascia d'appartenenza TBH
 *      (logo + appartenenza = anteprima, come da regola globale);
 *   3. altrimenti il nome per esteso con «Logo ufficiale da ricevere» (niente di inventato).
 */
export default function SocietaPage() {
  const q = useCompanies();
  /**
   * I loghi caricati dal pannello /allestimento (Priorità 2bis, punto n): finché il logo non
   * è nei dati del sito, la card usa quello caricato nello spazio della società o dell'attività.
   * Prima il materiale caricato si vedeva solo nel riquadro in fondo alla pagina e la card in
   * alto restava col monogramma: lo stesso marchio raccontava due cose diverse.
   * Il logo va sempre `contain` dentro LogoBox: non si taglia e non si deforma (punto d).
   */
  const loghiSocieta = useCopertine("societa:");
  const loghiAttivita = useCopertine("attivita:");
  const capogruppo = trovaKit("touch-business-holding");

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Business Holding
        </p>
        <h1 className="tbh-display tbh-h1">Società & Attività</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Le società con partita IVA e le attività del gruppo. Ogni anteprima — logo più
          appartenenza al gruppo — apre la scheda della società.
        </p>
      </header>

      {q.isLoading ? (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-96 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <section className="mb-16">
            <h2 className="tbh-display tbh-h2 mb-6">Capogruppo e società con P.IVA</h2>
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {/* Capogruppo: banner ufficiale TOUCH BUSINESS HOLDING → la sua scheda. */}
              {capogruppo ? (
                <ContentCard
                  nome={capogruppo.nome}
                  logo={capogruppo.materiali.logo}
                  etichetta="Capogruppo"
                  testo="Business · Media · Events · Marketing · Entertainment"
                  pagina={hrefSocieta(capogruppo.codice)}
                  appartenenza={capogruppo.appartenenza}
                  anteprima={anteprimaGriglia(capogruppo)}
                  pannello="/allestimento"
                />
              ) : null}
              {[...(q.data?.societa ?? [])]
                .sort((x, y) => posizione(x.code) - posizione(y.code))
                .map((c) => (
                <LinkTile
                  key={c.code}
                  name={c.name}
                  subtitle={`${c.code} · ${c.sector}`}
                  logo={logoDi(c.logo, loghiSocieta.trova(`societa:${c.code}`, "logo")?.url)}
                  site={c.site}
                  note={c.vat ? `P.IVA ${c.vat}` : undefined}
                  pagina={hrefSocieta(c.code)}
                  appartenenza={trovaKit(c.code)?.appartenenza ?? TBH}
                  anteprima={
                    anteprimaGriglia(trovaKit(c.code)) ??
                    logoDi(c.logo, loghiSocieta.trova(`societa:${c.code}`, "logo")?.url)
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="tbh-display tbh-h2 mb-6">Attività del gruppo</h2>
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {(q.data?.attivita ?? []).map((c) => (
                <LinkTile
                  key={c.code}
                  name={c.name}
                  subtitle={`${c.code} · ${c.sector}`}
                  logo={logoDi(c.logo, loghiAttivita.trova(`attivita:${c.code}`, "logo")?.url)}
                  site={c.site}
                  pagina={hrefSocieta(c.code)}
                  appartenenza={trovaKit(c.code)?.appartenenza ?? TBH}
                  anteprima={
                    anteprimaGriglia(trovaKit(c.code)) ??
                    logoDi(c.logo, loghiAttivita.trova(`attivita:${c.code}`, "logo")?.url)
                  }
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Spazio proprio di ogni riferimento: logo, immagini, indirizzo, mappa.
          Vuoto e senza codice non compare, così i visitatori non vedono riquadri inutili. */}
      {[...(q.data?.societa ?? []), ...(q.data?.attivita ?? [])].map((c) => (
        <SlotMedia
          key={c.code}
          slot={`${c.kind === "societa" ? "societa" : "attivita"}:${c.code}`}
          titolo={`${c.name} — ${c.code}`}
          descrizione={`Logo originale, slide dei servizi, listino, indirizzo e link Google Maps di ${c.name}.`}
          tipoIniziale="logo"
          nascondiSeVuoto
        />
      ))}

      <p className="mt-12 text-sm text-[var(--tbh-muted)]">
        Dove il logo ufficiale non è ancora arrivato, il riquadro mostra il nome della società
        per esteso: appena il logo viene consegnato, compare qui e su tutto il sito.
      </p>
    </div>
  );
}
