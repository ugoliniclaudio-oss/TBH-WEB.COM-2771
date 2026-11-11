import { Link, useParams } from "wouter";
import { ExternalLink, Phone, Mail, ImageOff, Hourglass } from "lucide-react";
import { useSchedaMaster } from "../queries/anagrafica";
import { MiTroviQui } from "../components/mi-trovi-qui";
import { FeedbackScheda } from "../components/contatore";
import { SlotMedia } from "../components/media-slot";
import { useCopertine } from "../components/immagine-tbh";

/**
 * SCHEDA MASTER TBH — regola assoluta di Claudio (30/08/2026):
 * «logo, banner, nuvola, card o carosello devono aprire SEMPRE la scheda interna:
 *  mai mandare l'utente fuori dal sito con un clic su una card».
 *
 * La scheda esiste una volta sola (ID MASTER) e viene richiamata da tutte le sezioni.
 * Dove il dato non è stato fornito NON si inventa nulla: compare «In allestimento» oppure,
 * se manca il logo, un pulsante con il nome per esteso.
 */
export default function SchedaMasterPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useSchedaMaster(slug ?? "");
  const s = data?.scheda ?? null;
  /**
   * Logo caricato dal pannello /allestimento sullo spazio di questa scheda (Priorità 2bis, n):
   * finché il logo ufficiale non è nei dati, l'intestazione usa quello caricato invece di
   * restare col riquadro «logo da ricevere» mentre il file è già in archivio due blocchi sotto.
   */
  const loghi = useCopertine(`master:${slug ?? ""}`);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-16 text-[var(--tbh-muted)]">
        Carico la scheda…
      </div>
    );
  }

  if (!s) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-16">
        <h1 className="tbh-display tbh-h1">Scheda non presente in anagrafica</h1>
        <p className="tbh-body text-[var(--tbh-muted)] mt-4">
          Questa scheda non è ancora stata inserita nell'anagrafica master. Nessun dato viene
          inventato: appena arrivano i dati la pubblichiamo.
        </p>
        <Link to="/anagrafica" className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex mt-6">
          Vai all'anagrafica master
        </Link>
      </div>
    );
  }

  const luogo = [s.indirizzo, s.citta, s.provincia ? `(${s.provincia})` : null]
    .filter(Boolean)
    .join(" ");

  /* Il logo va sempre `contain`: mai tagliato, mai deformato (punto d della Priorità 2bis). */
  const logoScheda = s.logo ?? loghi.trova(`master:${slug ?? ""}`, "logo")?.url ?? null;

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-14">
      <div className="flex flex-wrap items-center gap-5">
        {logoScheda ? (
          <img
            src={logoScheda}
            alt={s.nome}
            width={132}
            height={132}
            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-contain bg-black border border-[var(--tbh-line)] shrink-0"
          />
        ) : (
          <span className="w-28 h-28 md:w-32 md:h-32 grid place-items-center gap-1 rounded-2xl border border-dashed border-[var(--tbh-line)] text-[var(--tbh-muted)] text-[10px] uppercase text-center px-2 shrink-0">
            <ImageOff size={22} />
            Logo ufficiale da ricevere
          </span>
        )}
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-muted)]">
            ID MASTER {s.id}
          </p>
          <h1 className="tbh-display tbh-h1">{s.nome}</h1>
          <p className="text-[var(--tbh-gold)] text-sm uppercase tracking-wider">{s.categoria}</p>
          {luogo ? <p className="tbh-body text-[var(--tbh-muted)] mt-1">{luogo}</p> : null}
        </div>
      </div>

      {/* Universi TBH in cui la scheda compare: la scheda resta UNA, cambia solo la vetrina. */}
      <div className="mt-6 flex flex-wrap gap-2">
        {s.universi.map((u) => (
          <span
            key={u}
            className="px-3 py-1.5 rounded-full border border-[var(--tbh-line)] text-[11px] font-bold uppercase tracking-wider text-[var(--tbh-platinum)]"
          >
            {u}
          </span>
        ))}
      </div>

      {s.descrizione ? <p className="tbh-body mt-6 max-w-2xl">{s.descrizione}</p> : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {s.sito ? (
          <a
            href={s.sito}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
          >
            <ExternalLink size={15} /> Sito ufficiale
          </a>
        ) : (
          <Link
            to="/in-allestimento"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide text-[var(--tbh-muted)]"
          >
            <Hourglass size={15} /> Sito ufficiale in allestimento
          </Link>
        )}
        {s.telefono ? (
          <a
            href={`tel:${s.telefono.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
          >
            <Phone size={15} /> {s.telefono}
          </a>
        ) : null}
        {s.email ? (
          <a
            href={`mailto:${s.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
          >
            <Mail size={15} /> {s.email}
          </a>
        ) : null}
        <MiTroviQui
          nome={s.nome}
          citta={s.citta}
          indirizzo={s.indirizzo}
          punto={s.lat != null && s.lon != null ? { lat: s.lat, lon: s.lon } : null}
          conWaze
        />
      </div>

      {s.social.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {s.social.map((so) => (
            <a
              key={so.url}
              href={so.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full border border-[var(--tbh-line)] text-[11px] font-bold uppercase hover:border-[var(--tbh-neon)]"
            >
              {so.rete}
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="tbh-card p-6">
          <h2 className="tbh-display text-xl text-[var(--tbh-gold)]">Dentro il portale</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-2">
            Da questa scheda si resta sempre dentro TBH: nessuna card butta l'utente fuori dal sito.
          </p>
          <ul className="mt-4 grid gap-2">
            {s.correlati.map((c) => (
              <li key={c.to}>
                <Link
                  to={c.to}
                  className="block px-4 py-2.5 rounded-xl border border-[var(--tbh-line)] text-sm font-semibold hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="tbh-card p-6">
          <h2 className="tbh-display text-xl text-[var(--tbh-gold)]">Cosa manca ancora</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-2">
            Scritto in chiaro, senza riempitivi: appena arriva il materiale la scheda si completa.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {s.daRicevere.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <Hourglass size={14} className="text-[var(--tbh-gold)] mt-1 shrink-0" /> {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Spazio da allestire: logo, immagini, indirizzo e mappa caricati da chi ha il codice. */}
      <SlotMedia
        slot={`master:${slug}`}
        titolo="Logo, immagini e indirizzo di questa scheda"
        descrizione="Materiale reale caricato dal gruppo: logo ufficiale, foto, slide servizi, indirizzo completo con link alla mappa."
        tipoIniziale="logo"
      />

      {/* Micro-feedback reale: un voto per scheda e per dispositivo, alimenta il dato pubblico. */}
      <div className="mt-8">
        <FeedbackScheda chiave={`master-${slug}`} />
      </div>

      {data?.nota ? (
        <p className="text-[11px] text-[var(--tbh-muted)] mt-8 max-w-3xl">{data.nota}</p>
      ) : null}
    </div>
  );
}
