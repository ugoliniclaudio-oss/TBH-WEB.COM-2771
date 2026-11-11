import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { HeroSezione } from "../components/hero-sezione";
import { AREE, NOME_SITO } from "../lib/identita-tbh";
import { canaliOrdinati, percorsoCanale } from "../lib/palinsesto";

/* ────────────────────────────────────────────────────────────────────────────
   MAPPA DEL SITO — /mappa-sito
   Era l'unico collegamento rotto del footer (verifica-link.py lo segnalava
   come ATTESA). Qui non si scrive niente a mano: l'elenco si costruisce dalle
   stesse fonti che governano il menu (lib/identita-tbh.ts) e il palinsesto
   (lib/palinsesto.ts). Se domani nasce una pagina nuova nel menu, compare qui
   da sola: la mappa non può invecchiare.
   Le pagine legali non ci sono ancora: i testi li fornisce Claudio, quindi
   restano scritte «In allestimento» e NON cliccabili (regole ferree §1).
   ──────────────────────────────────────────────────────────────────────────── */

/** Pagine vere che non stanno in nessuna tendina del menu. */
const PAGINE_DI_SERVIZIO: { to: string; label: string; nota?: string }[] = [
  { to: "/cerca", label: "Ricerca nel sito" },
  { to: "/guida", label: "Guida ai canali" },
  {
    to: "/corsi/antincendio-livello-3",
    label: "Corso Addetto Antincendio — Livello 3",
    nota: "16 ore, esame Vigili del Fuoco, sedi Ravenna, Modena e Rimini",
  },
  { to: "/media/radio-tv", label: "Radio, TV e curiosità" },
  { to: "/servizi-referral", label: "Servizi & Referral — guadagna con noi" },
  { to: "/sport/squadre/rimini", label: "Rimini — squadre e territorio" },
  { to: "/sport/esperienze", label: "TBH SPORT — Le 4 esperienze (listino società sportive)" },
  { to: "/radio", label: "TOUCH RADIO — canale audio del gruppo TBH", nota: "ascolta la diretta, palinsesto 24/7" },
  { to: "/tv", label: "TOUCH TV — canale video del gruppo TBH", nota: "guarda la diretta, palinsesto 24/7" },
  { to: "/rubriche", label: "Rubriche — TOUCH MUSIC · DM ON AIR · DM HIGHLIGHTS" },
  { to: "/contatti", label: "Contatti" },
  { to: "/contatti-social", label: "Contatti e social" },
  { to: "/in-allestimento", label: "Pagina di cortesia" },
  { to: "/spot", label: "TOUCH SPOT — playlist degli spot interni TBH" },
  { to: "/channel/mondo-olistico", label: "MONDO OLISTICO CHANNEL", nota: "in allestimento" },
  { to: "/channel/touch-cinema", label: "TOUCH CINEMA — programmazione provvisoria (film HEDDY.video)" },
  { to: "/channel/touch-talent-professionals", label: "TOUCH TALENT & PROFESSIONALS CHANNEL", nota: "monitor 9:16, palinsesto H24" },
  { to: "/canali", label: "Canali tematici — TOUCH MUSIC · TOUCH INFLUENCITY MAGAZINE · ARM WRESTLING", nota: "playlist casuale per ogni spettatore" },
  { to: "/arm-wrestling", label: "TOUCH ARM WRESTLING", nota: "canale tematico" },
  { to: "/touch-travels", label: "TOUCH TRAVELS", nota: "in allestimento" },
  { to: "/sport/squadre/junior-gambettola", label: "Junior Gambettola", nota: "in allestimento" },
  { to: "/check-web", label: "Bozza «Check web»", nota: "proposta di homepage, non definitiva" },
  { to: "/check-web/loghi-canali", label: "Bozza «Loghi canali»", nota: "anteprima loghi TOUCH RADIO e TOUCH TV, in attesa di approvazione" },
  { to: "/check-web/home-canali", label: "Bozza «Home · TOUCH RADIO e TOUCH TV»", nota: "anteprima homepage con i due canali in primo piano, in attesa di approvazione" },
  { to: "/check-web/canali-61-73", label: "Bozza «13 voci TBH-061…073»", nota: "monitor con immagini originali, in attesa di approvazione" },
  { to: "/check-web/archivio-73", label: "Bozza «Archivio 73 asset»", nota: "catalogo verificato a vista, nessun file assegnato" },
  { to: "/check-web/home-ordine", label: "Bozza «Canale 0»", nota: "nuova homepage con i 28 Channel, in collaudo" },
];

/** Aree riservate: esistono, ma servono un codice. Si dichiarano, non si nascondono. */
const AREE_RISERVATE: { to: string; label: string }[] = [
  { to: "/allestimento", label: "Pannello di allestimento" },
  { to: "/allestimento/capitan-touch", label: "Pannello Capitan Touch" },
  { to: "/allestimento/canali-touch", label: "Pannello canali TOUCH RADIO / TOUCH TV" },
  { to: "/allestimento/channel", label: "Pannello palinsesti dei 28 Channel" },
  { to: "/allestimento/canali-tematici", label: "Pannello canali tematici (Touch Music, Influencity, Arm Wrestling)" },
  { to: "/allestimento/touch-talent", label: "Pannello Touch Talent & Professionals (monitor)" },
  { to: "/management", label: "Management · contratti" },
];

/** Schede singole: non si elencano una per una, si dice da dove si aprono. */
const SCHEDE_SINGOLE: { titolo: string; da: string; to: string }[] = [
  { titolo: "Scheda di una società o attività", da: "Registro entità TBH", to: "/tbh/registro" },
  { titolo: "Scheda di un prodotto", da: "Touch Plaza — Shop", to: "/shop" },
  { titolo: "Scheda di un servizio", da: "Tutti i servizi TBH", to: "/tbh/servizi" },
  { titolo: "Scheda di una squadra", da: "Squadre seguite", to: "/sport/squadre" },
  { titolo: "Livello TBH", da: "25 Livelli TBH", to: "/tbh/livelli" },
  { titolo: "Numero del magazine", da: "Touch Influencity", to: "/influencity" },
  { titolo: "Categoria di notizie", da: "News TBH", to: "/news" },
  { titolo: "Programma DM Comunicazioni", da: "DM Comunicazioni", to: "/dm" },
  { titolo: "Luogo di Sanremo", da: "Sanremo", to: "/sanremo" },
  { titolo: "Canale del palinsesto", da: "Guida ai canali", to: "/guida" },
  { titolo: "Scheda di una rubrica", da: "Rubriche", to: "/rubriche" },
];

/** Pagine legali: non esistono ancora. Non si finge il contrario. */
const PAGINE_LEGALI = ["Privacy", "Cookie", "Termini e condizioni"];

function VoceLink({ to, label, nota }: { to: string; label: string; nota?: string }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-baseline gap-2 py-1.5 border-b border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] transition-colors"
      >
        <span className="tbh-body text-[14px] text-white/85 group-hover:text-[var(--tbh-neon)] transition-colors">
          {label}
        </span>
        {nota ? <span className="text-[11px] text-[var(--tbh-muted)]">· {nota}</span> : null}
        <span className="ml-auto text-[11px] font-mono text-[var(--tbh-muted)]">{to}</span>
      </Link>
    </li>
  );
}

function Sezione({
  titolo,
  occhiello,
  colore,
  to,
  children,
}: {
  titolo: string;
  occhiello?: string;
  colore?: string;
  to?: string;
  children: React.ReactNode;
}) {
  const c = colore ?? "var(--tbh-neon)";
  return (
    <section className="tbh-card p-5 md:p-6" style={{ borderColor: `${c}44` }}>
      {occhiello ? (
        <div
          className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1"
          style={{ color: c }}
        >
          {occhiello}
        </div>
      ) : null}
      <h2 className="tbh-h3 mb-3" style={{ color: c }}>
        {to ? (
          <Link to={to} className="inline-flex items-center gap-2 hover:underline">
            {titolo} <ArrowRight size={16} />
          </Link>
        ) : (
          titolo
        )}
      </h2>
      {children}
    </section>
  );
}

export default function MappaSitoPage() {
  const totaleVoci =
    new Set([
      ...AREE.flatMap((a) => [a.to, ...a.items.map((i) => i.to)]),
      ...PAGINE_DI_SERVIZIO.map((p) => p.to),
      ...AREE_RISERVATE.map((p) => p.to),
      ...canaliOrdinati({ conHome: true }).map((c) => c.url),
    ]).size ?? 0;

  return (
    <div>
      <HeroSezione
        occhiello="Indice completo"
        titolo="MAPPA DEL SITO"
        evidenza={NOME_SITO}
        sottotitolo={`${totaleVoci} destinazioni, tutte raggiungibili da qui.`}
        testo="Ogni sezione del portale, in ordine, con il suo indirizzo. Se cerchi una cosa precisa usa la ricerca; se vuoi vedere tutto quello che c'è, sei nel posto giusto."
        azioni={[
          { label: "Cerca nel sito", to: "/cerca", primaria: true },
          { label: "Guida ai canali", to: "/guida" },
          { label: "Contatti", to: "/contatti" },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10 md:py-14">
        {/* ── le 16 aree del menu ──────────────────────────────────────────── */}
        <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {AREE.map((a) => (
            <Sezione
              key={a.to + a.label}
              occhiello={a.occhiello}
              titolo={a.titolo}
              colore={a.colore}
              to={a.to}
            >
              <ul>
                {a.items.map((i) => (
                  <VoceLink key={i.to + i.label} to={i.to} label={i.label} />
                ))}
              </ul>
            </Sezione>
          ))}
        </div>

        {/* ── palinsesto ───────────────────────────────────────────────────── */}
        <div className="mt-10 md:mt-14">
          <h2 className="tbh-h2 mb-1">TUTTI I CANALI TBH</h2>
          <p className="tbh-body text-[var(--tbh-muted)] mb-4 max-w-[70ch]">
            Il portale è organizzato come una TV, ma i canali si chiamano per nome: nessun numero da
            ricordare. Scorri con la barra in basso oppure apri il canale da qui.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {canaliOrdinati({ conHome: true }).map((c) => (
              <Link
                key={c.numero}
                to={percorsoCanale(c.numero)}
                className="tbh-card px-3 py-2.5 flex items-center gap-3 hover:border-[var(--tbh-neon)] transition-colors"
                style={{ borderColor: `${c.colore}33` }}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: c.colore }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-white truncate">{c.nome}</span>
                  <span className="block text-[11px] text-[var(--tbh-muted)] truncate">
                    {c.categoria}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── servizio, riservate, schede, legali ──────────────────────────── */}
        <div className="mt-10 md:mt-14 grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Sezione titolo="Pagine di servizio" occhiello="Utilità">
            <ul>
              {PAGINE_DI_SERVIZIO.map((p) => (
                <VoceLink key={p.to} to={p.to} label={p.label} nota={p.nota} />
              ))}
            </ul>
          </Sezione>

          <Sezione titolo="Aree riservate" occhiello="Serve un codice" colore="#e2c37a">
            <ul>
              {AREE_RISERVATE.map((p) => (
                <VoceLink key={p.to} to={p.to} label={p.label} />
              ))}
            </ul>
          </Sezione>

          <Sezione titolo="Schede singole" occhiello="Da dove si aprono" colore="#33e0ff">
            <p className="tbh-body text-[13px] text-[var(--tbh-muted)] mb-2">
              Le schede di dettaglio non si elencano qui: sono centinaia e cambiano. Ognuna si apre
              dal suo elenco.
            </p>
            <ul>
              {SCHEDE_SINGOLE.map((s) => (
                <VoceLink key={s.titolo} to={s.to} label={`${s.titolo} → ${s.da}`} />
              ))}
            </ul>
          </Sezione>

          <Sezione titolo="Pagine legali" occhiello="Non ancora pubblicate" colore="#e2c37a">
            <p className="tbh-body text-[13px] text-[var(--tbh-muted)] mb-3">
              I testi legali devono essere quelli veri, forniti dall'editore. Finché non ci sono,
              qui non c'è niente da aprire.
            </p>
            <ul>
              {PAGINE_LEGALI.map((l) => (
                <li
                  key={l}
                  className="flex items-center gap-2 py-1.5 border-b border-[var(--tbh-line)]"
                >
                  <span className="tbh-body text-[14px] text-white/60">{l}</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                    In allestimento
                  </span>
                </li>
              ))}
            </ul>
          </Sezione>
        </div>
      </div>
    </div>
  );
}
