import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, LayoutGrid, MessageCircle, Search, Tv, X } from "lucide-react";

import {
  canaleLogo,
  canaliOrdinati,
  percorsoCanale,
  PALINSESTO_NOTA,
  PALINSESTO_TITOLO,
  type Canale,
} from "../lib/palinsesto";
import {
  RULLI_HOME,
  IN_EVIDENZA,
  contaAnteprime,
  type RulloDefinito,
} from "../lib/schermi-palinsesto";
import { CaroselloOrizzontale } from "../components/carosello-orizzontale";
import { type Schermo } from "../components/schermo-tbh";
import { RulloTbh } from "../components/rullo-tbh";
import { RiquadroLogo } from "../components/tessera-logo";
import { MenuAttivita, PorteAzione, SchermoPrincipale } from "../components/regia-canale-0";
import { useProducts, useTeams } from "../queries/catalog";
import { useOggiSuTbh } from "../queries/edicola";
import { waInfo } from "../lib/whatsapp";

/* ────────────────────────────────────────────────────────────────────────────
   HOME — PALINSESTO DIGITALE. Rifacimento del 15/09/2026.

   Ordine di Claudio, alla lettera: «il sito non ha l'apparenza di un palinsesto
   digitale, pieno di monitor con anteprima del contenuto più pulsante che apre a
   una pagina. L'ho chiesto più volte e non l'ho mai visto realizzato.»

   Cosa è stato fatto, e perché così:
     · la home NON è più un elenco di 40 sezioni verticali (era il difetto: doppioni,
       funzioni mai chieste, nessuna somiglianza con un palinsesto). Ora è una
       SCHERMATA DI REGIA: monitor 16:9 in rulli orizzontali, come una TV;
     · ogni monitor mostra l'anteprima reale che abbiamo (marchio del gruppo, stemma
       della squadra, foto del prodotto) e porta il suo pulsante APRI SCHEDA che apre
       la PAGINA CANONICA. Dove l'anteprima ufficiale non è ancora arrivata il monitor
       lo dichiara: «Anteprima in allestimento». Nessuna immagine finta, nessun logo
       prestato da un'altra società;
     · la struttura non è inventata qui: è il palinsesto già approvato in
       lib/palinsesto.ts (24 canali) tradotto in schermi da lib/schermi-palinsesto.ts.
       Una pagina esiste UNA SOLA VOLTA: un contenuto può comparire in più rulli, ma
       l'indirizzo che apre è sempre lo stesso (punto 7 / punto 43 della specifica);
     · niente di quello che c'era prima è stato buttato: tutte le destinazioni restano
       nel menu ☰, nel mosaico dei canali, nella guida (/guida) e nella mappa del sito
       (/mappa-sito). In home restano i monitor, non i doppioni.

   Regola sul responsive: scorre SOLO il rullo, mai la pagina. Nessuno zoom.

   ── AGGIORNAMENTO 28/09/2026 · CANALE 0 ───────────────────────────────────
   Ordine di Claudio (documento «FASE 1 — È DA QUI CHE INIZIEREI»), applicato
   direttamente su questa home (non in bozza, sua scelta esplicita; lo snapshot
   «un passo indietro» è stato fatto prima di toccare il file). L'ordine della
   pagina è ora quello del documento:

     TESTATA → SCHERMO PRINCIPALE (un solo grande contenuto, reale, dall'Edicola)
     → «COSA VUOI FARE?» (sei porte: GUARDA · SCOPRI · LAVORA · PARTECIPA ·
     ACQUISTA · CONTATTACI) → telecomando → IN EVIDENZA → i rulli → i canali
     → «ALTRE COSE DA FARE NEL SITO» (il menu completo, per intero).

   Due precisazioni sue, rispettate alla lettera:
     · il menu NON è stato tolto: torna in fondo alla home come «altre scelte di
       attività da eseguire nel sito», con tutte le aree e tutte le loro voci.
       Nessuna destinazione è andata persa;
     · lo schermo principale non ospita riempitivi: se l'Edicola non ha un
       contenuto verificato, il monitor dichiara «schermo in allestimento».

   I tre pezzi nuovi vivono in components/regia-canale-0.tsx.
   ──────────────────────────────────────────────────────────────────────────── */

/* ORDINE DI CLAUDIO DEL 28/09/2026 — «MAI IL NUMERO A SCHERMO».
   Il telecomando e il mosaico mostravano il codice interno del canale (01, 02…)
   come contenuto principale della pillola. Ora mostrano SOLO il nome, con il
   marchio ufficiale quando esiste (canaleLogo) e un'icona neutra quando non
   esiste: mai un numero al posto del logo, mai un logo prestato.
   L'ordine è quello editoriale di canaliOrdinati() — priorità calcolata, poi il
   campo `ordine` — non l'ordine di scrittura del file e mai casuale. */

/** Il telecomando: i nomi dei canali, in fila, come sulla TV.
 *  Ordine di Claudio del 28/09/2026 sulle liste orizzontali: su computer le due
 *  frecce sono sempre a vista (e si scorre anche con ← →), su telefono si scorre
 *  col dito. Quindi il telecomando non è più uno scorrimento fatto a mano:
 *  usa la fascia unica CaroselloOrizzontale, con le voci «Canale precedente /
 *  successivo» perché qui si scorrono canali, non contenuti. */
function Telecomando() {
  return (
    <CaroselloOrizzontale
      etichetta="Telecomando — i canali TBH"
      ariaPrecedente="Canale precedente"
      ariaSuccessivo="Canale successivo"
      /* La fascia arriva al bordo del pannello: le frecce stanno dentro, così non
         finiscono sotto la mascotte fissa in basso a destra. */
      frecceDentro
      className="md:px-14"
    >
      {canaliOrdinati().map((c) => (
        <Link
          key={c.numero}
          to={percorsoCanale(c.numero)}
          className="flex shrink-0 snap-start items-center gap-2 rounded-xl border bg-black/50 px-3 py-2 transition hover:-translate-y-0.5"
          style={{ borderColor: `${c.colore}55` }}
          title={c.nome}
        >
          <MarchioCanale canale={c} lato={24} />
          <span className="block max-w-[180px] truncate text-[10px] font-bold uppercase tracking-[0.14em]">
            {c.nome}
          </span>
        </Link>
      ))}
    </CaroselloOrizzontale>
  );
}

/** Il marchio del canale: logo ufficiale se c'è, altrimenti icona neutra. */
function MarchioCanale({ canale, lato }: { canale: Canale; lato: number }) {
  const logo = canaleLogo(canale);
  return (
    <span
      className="grid shrink-0 place-content-center rounded-lg"
      style={{
        height: lato,
        width: lato,
        background: `${canale.colore}1f`,
        border: `1px solid ${canale.colore}55`,
      }}
    >
      {logo ? (
        <img
          src={logo}
          alt={canale.nome}
          loading="lazy"
          className="object-contain"
          style={{ height: lato - 6, width: lato - 6 }}
        />
      ) : (
        <Tv size={Math.round(lato * 0.5)} style={{ color: canale.colore }} aria-hidden />
      )}
    </span>
  );
}

/** Il mosaico dei canali: ogni casella è un monitor con il marchio e il nome. */
function MosaicoCanali({ chiudi }: { chiudi?: () => void }) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {canaliOrdinati().map((c) => (
        <Link
          key={c.numero}
          to={percorsoCanale(c.numero)}
          onClick={chiudi}
          className="rounded-2xl border bg-black/40 p-3 transition hover:-translate-y-0.5"
          style={{ borderColor: `${c.colore}55` }}
        >
          <div
            className="flex h-16 items-center justify-center rounded-xl md:h-20"
            style={{ background: `linear-gradient(140deg, ${c.colore}26, transparent 70%)` }}
          >
            {canaleLogo(c) ? (
              <RiquadroLogo src={canaleLogo(c)!} alt={c.nome} misura="sm" colore={c.colore} />
            ) : (
              <Tv size={26} style={{ color: c.colore }} aria-hidden />
            )}
          </div>
          <p className="mt-2 truncate text-[9px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
            {c.categoria}
          </p>
          <p className="break-words text-[11px] font-bold leading-tight">{c.nome}</p>
          <span
            className="mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold tracking-[0.12em]"
            style={{ borderColor: `${c.colore}88`, color: c.colore }}
          >
            ENTRA <ArrowRight size={10} />
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Index() {
  const [mosaico, setMosaico] = useState(false);
  const products = useProducts("Tutti");
  const teams = useTeams();

  /* Il mosaico a tutto schermo si chiude anche col tasto Esc: prima si poteva
     uscire solo dalla X, e una schermata che copre tutto senza via d'uscita da
     tastiera è una trappola (regola «nessun vicolo chiuso»). */
  useEffect(() => {
    if (!mosaico) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMosaico(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [mosaico]);

  /* Lo schermo principale: il primo contenuto reale dell'Edicola, niente di
     costruito per l'occasione. Se non c'è, il monitor lo dichiara. */
  const oggi = useOggiSuTbh();
  const inOnda = oggi.data?.items?.[0] ?? null;

  const conteggio = useMemo(() => contaAnteprime(RULLI_HOME), []);

  /** Monitor dallo shop: anteprima = foto reale del prodotto, mai un segnaposto. */
  const rulloShop: RulloDefinito | null = useMemo(() => {
    const items = products.data?.items ?? [];
    if (!items.length) return null;
    return {
      chiave: "prodotti",
      titolo: "IN VENDITA ADESSO",
      occhiello: "Touch Plaza Shop · schede prodotto reali",
      tutti: { etichetta: "TUTTO LO SHOP", to: "/shop" },
      schermi: items.slice(0, 18).map<Schermo>((p) => ({
        id: `/shop/p/${p.slug}`,
        categoria: `Shop · € ${(p.priceCents / 100).toFixed(2).replace(".", ",")}`,
        titolo: p.title,
        sottotitolo: p.blurb,
        immagine: p.image ?? null,
        colore: "#ff8a00",
        azioni: [{ tipo: "scheda", to: `/shop/p/${p.slug}` }],
      })),
    };
  }, [products.data]);

  /** Monitor delle squadre: stemma ufficiale, mai ritagliato. */
  const rulloSquadre: RulloDefinito | null = useMemo(() => {
    const items = teams.data?.teams ?? [];
    if (!items.length) return null;
    return {
      chiave: "squadre",
      titolo: "SQUADRE SEGUITE",
      occhiello: "Stemmi ufficiali · schede squadra",
      tutti: { etichetta: "TUTTE LE SQUADRE", to: "/sport" },
      schermi: items.map<Schermo>((t) => ({
        id: `/sport/squadre/${t.slug}`,
        categoria: t.role ?? "Sport",
        titolo: t.name,
        logo: t.logo ?? null,
        colore: "#2f7bff",
        azioni: [{ tipo: "scheda", to: `/sport/squadre/${t.slug}` }],
      })),
    };
  }, [teams.data]);

  /* I rulli, nell'ordine di messa in onda: palinsesto, poi i contenuti reali dal
     database (shop e squadre), poi gli altri canali. */
  const rulli: RulloDefinito[] = useMemo(() => {
    const base = [...RULLI_HOME];
    const out: RulloDefinito[] = [];
    for (const r of base) {
      out.push(r);
      if (r.chiave === "novita" && rulloSquadre) out.push(rulloSquadre);
      if (r.chiave === "sport" && rulloShop) out.push(rulloShop);
    }
    return out;
  }, [rulloShop, rulloSquadre]);

  return (
    <div className="pb-10">
      {/* ───────── 1 · TESTATA: chi siamo e dove si è finiti ───────── */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-[var(--tbh-line)] bg-black/50 px-4 py-4 md:px-6 md:py-5">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[var(--tbh-neon)]">
              <Tv size={13} /> La regia · in onda ora
            </p>
            <h1 className="tbh-h1 mt-1.5 leading-[1.05]">TBH-WEB</h1>
            <p className="tbh-body mt-1.5 max-w-[70ch] text-[13px] text-[var(--tbh-muted)]">
              Il sito si guarda come una televisione: ogni canale ha un nome, non un numero. Qui
              sotto c'è quello che è in onda adesso, e subito dopo i pulsanti per dire cosa vuoi
              fare.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMosaico(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-neon)] px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] text-[var(--tbh-neon)]"
            >
              <LayoutGrid size={15} /> MOSAICO CANALI
            </button>
            <Link
              to="/guida"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              TUTTI I CANALI
            </Link>
            <Link
              to="/cerca"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              <Search size={14} /> CERCA
            </Link>
            <a
              href={waInfo("Informazioni da TBH-WEB.com")}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold tracking-[0.14em]"
            >
              <MessageCircle size={14} /> PARLA CON NOI
            </a>
          </div>
        </div>
      </section>

      {/* ───────── 2 · SCHERMO PRINCIPALE: un solo contenuto, quello vero ───────── */}
      <SchermoPrincipale item={inOnda} caricamento={oggi.isLoading} />

      {/* ───────── 3 · COSA VUOI FARE: le sei porte ───────── */}
      <PorteAzione waHref={waInfo("Informazioni da TBH-WEB.com")} />

      {/* ───────── 4 · TELECOMANDO: i numeri sempre a portata di pollice ───────── */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 pt-8">
        <div className="rounded-3xl border border-[var(--tbh-line)] bg-black/40 p-3 md:p-4">
          <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
            Telecomando · scegli il canale
          </p>
          <Telecomando />
        </div>
      </section>

      {/* ───────── PRIMA SERATA: i monitor grandi ───────── */}
      {/* 29/10/2026 (round 15): stesso rullo degli altri, con frecce Indietro/Avanti spente ai limiti. */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 pt-8">
        <RulloTbh
          titolo="IN EVIDENZA"
          occhiello="Prima serata"
          schermi={IN_EVIDENZA}
          tutti={{ etichetta: "TUTTI I CANALI", to: "/guida" }}
          ariaPrecedente="Canale precedente"
          ariaSuccessivo="Canale successivo"
          grande
          classeSezione=""
        />
      </section>

      {/* ───────── I RULLI: monitor + APRI SCHEDA, uno per area ───────── */}
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        {rulli.map((r) => (
          <RulloTbh
            key={r.chiave}
            titolo={r.titolo}
            occhiello={r.occhiello}
            schermi={r.schermi}
            tutti={r.tutti ?? null}
            ariaPrecedente={r.diCanali ? "Canale precedente" : undefined}
            ariaSuccessivo={r.diCanali ? "Canale successivo" : undefined}
          />
        ))}
      </div>

      {/* ───────── TUTTI I CANALI, sempre visibili in fondo ───────── */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 pt-10">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
              Mosaico
            </p>
            <h2 className="tbh-h3 leading-tight">{PALINSESTO_TITOLO}</h2>
          </div>
          <Link
            to="/mappa-sito"
            className="rounded-full border border-[var(--tbh-gold)] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[var(--tbh-gold)]"
          >
            MAPPA DEL SITO
          </Link>
        </div>
        <div className="mt-3">
          <MosaicoCanali />
        </div>

        {/* Verità sui contenuti: quanti monitor hanno già l'anteprima reale. */}
        <p className="mt-5 max-w-[95ch] text-[11px] text-[var(--tbh-muted)]">
          In onda {conteggio.totale} monitor: {conteggio.conLogo} hanno già l'anteprima ufficiale,{" "}
          {conteggio.senza} tengono lo slot dichiarato «in allestimento». {PALINSESTO_NOTA}
        </p>
      </section>

      {/* ───────── ALTRE COSE DA FARE: il menu completo, in home ─────────
         Ordine di Claudio del 28/09/2026: il menu non si toglie, torna qui come
         «altre scelte di attività da eseguire nel sito». Tutte le aree, tutte le
         voci, ognuna al suo indirizzo canonico. */}
      <MenuAttivita />

      {/* ───────── MOSAICO A TUTTO SCHERMO ───────── */}
      {mosaico && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label={PALINSESTO_TITOLO}
        >
          <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
                  Regia TBH-WEB
                </p>
                <h2 className="tbh-h2">{PALINSESTO_TITOLO}</h2>
              </div>
              <button
                type="button"
                onClick={() => setMosaico(false)}
                aria-label="Chiudi il mosaico dei canali"
                className="rounded-xl border border-[var(--tbh-line)] p-2.5 hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5">
              <MosaicoCanali chiudi={() => setMosaico(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
