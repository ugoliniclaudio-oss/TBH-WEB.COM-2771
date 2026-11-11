import { Link, useParams } from "wouter";
import { ExternalLink, MapPin, MessageCircle, Phone, Mail, ArrowLeft } from "lucide-react";
import { useEntita } from "../queries/registro";
import { LogoBox } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";
import { hrefSocieta } from "../lib/kit-societa";
import { useCompanies } from "../queries/catalog";
import { TripleMonitor, type RecordTriple } from "../components/triple-monitor";
import { Briciole, PresenteNeiChannel, channelDiAttivita, destinazioneChannel, genitoreDi } from "../components/struttura";
import { useStruttura } from "../queries/struttura";

/**
 * FASE 1 — PAGINA DEDICATA DELL'ENTITÀ (brief punti 01, 05, 26, 27).
 * Una sola scheda per entità reale: attività, azienda, locale, hotel, società, squadra,
 * prodotto, programma. Il click su logo/nome/foto/SCOPRI porta QUI, non al sito esterno:
 * il sito ufficiale è un'AZIONE dentro la scheda (livello 5 della gerarchia).
 * Nessun campo inventato: ciò che manca semplicemente non viene mostrato.
 */
export default function EntitaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const q = useEntita(slug);
  const gruppo = useCompanies();
  /* 28/10/2026 — struttura comune: Channel che presentano questa scheda (una sola per attività). */
  const struttura = useStruttura();
  const genitori = channelDiAttivita(struttura.data?.channel ?? [], `/e/${slug}`);
  const genitore = genitoreDi(genitori);
  const codiciGruppo = new Set(
    [...(gruppo.data?.societa ?? []), ...(gruppo.data?.attivita ?? [])].map((c) => c.code),
  );

  if (q.isLoading)
    return <div className="p-6 text-[var(--tbh-muted)]">Caricamento scheda…</div>;

  const item = q.data?.item ?? null;
  const labels = q.data?.labels ?? {};
  const contatti = q.data?.contatti;

  if (!item)
    return (
      <div className="p-6 md:p-10 flex flex-col gap-4">
        <h1 className="tbh-display tbh-h1">Scheda non trovata</h1>
        <p className="text-[var(--tbh-muted)] max-w-2xl">
          Questa entità non è (ancora) nel registro unico. Nessun dato viene inventato per
          riempire il vuoto: se manca, va inserita nell'anagrafica.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/tbh/registro" className="tbh-neon-btn">
            Apri il registro entità
          </Link>
          <Link to="/" className="tbh-neon-btn">
            Torna alla Home
          </Link>
        </div>
      </div>
    );

  const azioni: { label: string; href: string; esterno: boolean }[] = [];
  /* Società o attività del gruppo: la pagina dedicata col kit ufficiale viene prima. */
  if (item.codiceTBH && codiciGruppo.has(item.codiceTBH))
    azioni.push({ label: "Pagina ufficiale della società", href: hrefSocieta(item.codiceTBH), esterno: false });
  if (item.sito) azioni.push({ label: "Sito ufficiale", href: item.sito, esterno: true });
  azioni.push({ label: "Contatta su WhatsApp", href: waInfo(item.nome), esterno: true });

  /** Record del modulo TRE MONITOR per questa entità: un solo ID, mai una pagina doppia. */
  const recordEntita: RecordTriple = {
    id: `entita-${slug}`,
    tipo: "azienda",
    titolo: item.nome,
    categoria: item.settore ?? "Attività della rete",
    dati: [item.citta, item.codiceTBH ? `Codice ${item.codiceTBH}` : null],
    monitor: [
      {
        // Fotogallery: solo foto ufficiali ricevute. Il logo non è una gallery.
        url: null,
        titolo: null,
        dati: "Fotogallery ufficiale da ricevere.",
        azioni: [
          { etichetta: "INVIA LE FOTO", href: waInfo(`Fotogallery ufficiale — ${item.nome}`) },
        ],
      },
      {
        url: null,
        titolo: null,
        dati: "Video promo da ricevere o da girare con la crew.",
        azioni: [
          { etichetta: "RICHIEDI IL VIDEO", href: waInfo(`Video promo — ${item.nome}`) },
        ],
      },
      {
        url: null,
        azione: true,
        titolo: "Prenota o chiedi un preventivo",
        dati: "La richiesta arriva direttamente alla direzione: nessun prezzo pubblicato senza conferma.",
        azioni: [
          {
            etichetta: "PRENOTA ORA",
            href: waInfo(`Prenotazione — ${item.nome}`),
            primaria: true,
          },
          { etichetta: "RICHIEDI PREVENTIVO", href: waInfo(`Preventivo — ${item.nome}`) },
          ...(item.sito ? [{ etichetta: "SITO UFFICIALE", href: item.sito }] : []),
        ],
      },
    ],
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 md:gap-8">
      <Briciole
        voci={[
          { label: "Home", href: "/" },
          ...(genitore ? [{ label: genitore.nome, href: destinazioneChannel(genitore) }] : []),
          { label: item.nome },
        ]}
        destra={
          <Link
            to="/tbh/registro"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--tbh-muted)]"
          >
            <ArrowLeft size={14} /> Registro entità
          </Link>
        }
      />

      {/* Testata: logo grande + nome per esteso */}
      <header className="grid gap-5 md:grid-cols-[minmax(0,320px)_1fr] items-start">
        <LogoBox name={item.nome} logo={item.logo} size="lg" url={item.sito} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {item.qualifiche.map((qq) => (
              <span
                key={qq}
                className="text-[11px] font-bold uppercase tracking-wide rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[var(--tbh-neon)]"
              >
                {(labels as Record<string, string>)[qq] ?? qq}
              </span>
            ))}
          </div>
          <h1 className="tbh-display tbh-h1">{item.nome}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--tbh-muted)]">
            {item.settore && <span>{item.settore}</span>}
            {item.citta && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} /> {item.citta}
              </span>
            )}
            {item.codiceTBH && <span>Codice {item.codiceTBH}</span>}
            {item.piva && <span>P.IVA {item.piva}</span>}
          </div>

          {/* LIVELLO 5 — AZIONI */}
          <div className="flex flex-wrap gap-3 pt-1">
            {azioni.map((a) => (
              a.esterno ? (
                <a
                  key={a.label}
                  href={a.href}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-neon-btn inline-flex items-center gap-2"
                >
                  {a.label}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <Link key={a.label} to={a.href} className="tbh-neon-btn inline-flex items-center gap-2">
                  {a.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </header>

      {/* MODULO TRE MONITOR — un record per entity_id:
          fotogallery / video promo / prenota ora. Foto e video mancanti restano
          dichiarati in allestimento: nessun logo inventato, nessun riquadro muto. */}
      <TripleMonitor record={recordEntita} />

      {/* Informazioni verificate */}
      <section className="tbh-card p-5 md:p-6 flex flex-col gap-3">
        <h2 className="tbh-display tbh-h3">Informazioni</h2>
        {item.note.length ? (
          <ul className="flex flex-col gap-2 text-sm text-[var(--tbh-muted)]">
            {item.note.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--tbh-muted)]">
            Descrizione, orari, gallery, video e mappa: in allestimento. Verranno pubblicati
            appena il materiale ufficiale è disponibile — nessun testo di riempimento.
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2 text-sm text-[var(--tbh-muted)] pt-1">
          {["Descrizione", "Gallery", "Video", "Orari", "Mappa e indicazioni", "Social ufficiali"].map(
            (campo) => (
              <div
                key={campo}
                className="flex items-center justify-between gap-3 border border-[var(--tbh-line)] rounded-xl px-3 py-2"
              >
                <span>{campo}</span>
                <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-gold)]">
                  da ricevere
                </span>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Channel che presentano questa attività: tutti puntano a QUESTA scheda. */}
      <PresenteNeiChannel canali={genitori} />

      {/* Dove compare la stessa entità (nessun doppione) */}
      {item.pagine.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="tbh-display tbh-h3">Dov'è collegata nel portale</h2>
          <p className="text-sm text-[var(--tbh-muted)] max-w-3xl">
            La stessa entità esiste una sola volta e viene richiamata in queste pagine
            attraverso collegamenti, senza duplicare i dati.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {item.pagine.map((p) => (
              <Link key={p.href} to={p.href} className="tbh-card p-4 flex flex-col gap-1">
                <span className="tbh-display text-lg">{p.label}</span>
                <span className="text-xs text-[var(--tbh-muted)]">{p.href}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contatti ufficiali TBH (mai inventati) */}
      {contatti && (
        <section className="tbh-card p-5 md:p-6 flex flex-col gap-3">
          <h2 className="tbh-display tbh-h3">Assistenza e contatti</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href={waInfo(item.nome)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 tbh-neon-btn"
            >
              <MessageCircle size={15} /> WhatsApp {contatti.whatsapp}
            </a>
            <a
              href={`tel:${(contatti.telItalia ?? "").replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 border border-[var(--tbh-line)] rounded-full px-4 py-2"
            >
              <Phone size={15} /> {contatti.telItalia}
            </a>
            <a
              href={`mailto:${contatti.email}`}
              className="inline-flex items-center gap-2 border border-[var(--tbh-line)] rounded-full px-4 py-2"
            >
              <Mail size={15} /> {contatti.email}
            </a>
          </div>
        </section>
      )}

      <p className="text-xs text-[var(--tbh-muted)]">
        Fonti anagrafiche di questa scheda: {item.fonti.join(" · ")}.
      </p>
    </div>
  );
}
