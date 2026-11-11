import { ChevronLeft, ChevronRight, LayoutGrid, Tv } from "lucide-react";
import { Link } from "wouter";
import { HeroSezione } from "../components/hero-sezione";
import { SlotContenuti } from "../components/slot-contenuti";
import { SchedaContenuto } from "../components/zapping";
import { CaroselloOrizzontale } from "../components/carosello-orizzontale";
import { CanaleCircuito } from "../components/canale-circuito";
import {
  canaleLogo,
  canalePerNumero,
  canalePrecedente,
  canaliOrdinati,
  canaleSuccessivo,
  percorsoCanale,
} from "../lib/palinsesto";

/**
 * MINI-HOMEPAGE DI CANALE — specifica MASTER di Claudio del 05/09/2026.
 *
 * Ogni canale ha la sua schermata: nome, funzione, programmazione e zapping.
 * Ordine di Claudio del 28/09/2026: il numero del canale è un codice interno e
 * NON si stampa mai a schermo. Il visitatore vede nomi, marchi reali e contenuti.
 * Le voci della programmazione portano SEMPRE alla pagina canonica già esistente:
 * qui non nasce nessun doppione tecnico.
 */
export default function CanalePage({ numero }: { numero: string }) {
  const n = Number.parseInt(numero, 10);
  const canale = Number.isFinite(n) ? canalePerNumero(n) : undefined;

  if (!canale) {
    return (
      <div className="pb-16">
        <HeroSezione
          occhiello="Palinsesto"
          titolo="CANALE NON ASSEGNATO"
          sottotitolo="Questo indirizzo non corrisponde a nessun canale. L'elenco completo mostra tutti quelli attivi."
          colore="var(--tbh-gold)"
          azioni={[
            { label: "Tutti i canali", to: "/guida", primaria: true },
            { label: "Home · la regia", to: "/" },
          ]}
        />
      </div>
    );
  }

  const giu = canalePrecedente(canale.numero);
  const su = canaleSuccessivo(canale.numero);
  // Ordine editoriale calcolato (priorità, poi ordine interno): mai casuale.
  const altri = canaliOrdinati().filter((c) => c.numero !== canale.numero);

  return (
    <div className="pb-16" data-canale-pagina={canale.numero}>
      <HeroSezione
        occhiello={canale.categoria}
        titolo={canale.nome}
        sottotitolo={canale.funzione}
        colore={canale.colore}
        azioni={[
          { label: "Entra", to: canale.url, primaria: true },
          { label: "Tutti i canali", to: "/guida" },
        ]}
      />

      {/* ZAPPING: canale precedente / successivo sempre a portata di mano */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 -mt-2">
        <div className="tbh-card p-3 flex items-center justify-between gap-3">
          <Link
            to={percorsoCanale(giu.numero)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 min-w-0"
            aria-label={`Canale precedente: ${giu.nome}`}
            data-zap="prec"
          >
            <ChevronLeft size={18} className="text-[var(--tbh-neon)] shrink-0" />
            <span className="text-left min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
                ← Precedente
              </span>
              <span className="block tbh-display text-sm truncate">{giu.nome}</span>
            </span>
          </Link>

          <Link
            to="/guida"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--tbh-line)] text-[11px] uppercase tracking-[0.14em] hover:bg-white/5"
          >
            <LayoutGrid size={14} /> Canali
          </Link>

          <Link
            to={percorsoCanale(su.numero)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 min-w-0"
            aria-label={`Canale successivo: ${su.nome}`}
            data-zap="succ"
          >
            <span className="text-right min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
                Successivo →
              </span>
              <span className="block tbh-display text-sm truncate">{su.nome}</span>
            </span>
            <ChevronRight size={18} className="text-[var(--tbh-neon)] shrink-0" />
          </Link>
        </div>
      </section>

      {/* PROGRAMMAZIONE DEL CANALE */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
              {canale.nome}
            </span>
            <h2 className="tbh-h2 tbh-display">LA PROGRAMMAZIONE</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {canale.badge.map((b) => (
              <span
                key={b}
                className="text-[9px] font-bold uppercase tracking-[0.16em] rounded-full px-2.5 py-1 border"
                style={{ color: canale.colore, borderColor: canale.colore }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {canale.programmazione.map((p) => (
            <SchedaContenuto key={p.url + p.titolo} contenuto={p} colore={canale.colore} />
          ))}
        </div>
      </section>

      {/* DAL CIRCUITO TBH (04/10/2026): anteprima → pulsante → scheda, per genere e interesse */}
      <CanaleCircuito numero={canale.numero} colore={canale.colore} />

      {/* Spazio di allestimento: loghi e materiali veri del canale, caricati dal pannello */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8">
        <SlotContenuti
          slot={`canale-${canale.numero}:materiali`}
          modo="loghi"
          titolo="Materiali del canale"
          descrizione="Loghi ufficiali, immagini e collegamenti caricati dal pannello di allestimento."
          colonne={4}
        />
      </section>

      {/* CONTINUA A FARE ZAPPING */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Tv size={16} className="text-[var(--tbh-neon)]" />
          <h2 className="tbh-h2 tbh-display">CONTINUA A FARE ZAPPING</h2>
        </div>
        <CaroselloOrizzontale
          etichetta="Gli altri canali TBH"
          ariaPrecedente="Canale precedente"
          ariaSuccessivo="Canale successivo"
        >
          {altri.map((c) => {
            const logo = canaleLogo(c);
            return (
              <Link
                key={c.numero}
                to={percorsoCanale(c.numero)}
                className="tbh-card shrink-0 snap-start px-4 py-3 flex items-center gap-3"
                style={{ borderColor: c.colore }}
                data-zapping={c.numero}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={c.nome}
                    width={28}
                    height={28}
                    className="size-7 shrink-0 rounded-md object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className="size-7 shrink-0 grid place-items-center rounded-md border"
                    style={{ borderColor: `${c.colore}66`, color: c.colore }}
                    aria-hidden
                  >
                    <Tv size={14} />
                  </span>
                )}
                <span className="text-[11px] uppercase tracking-[0.14em] whitespace-nowrap">
                  {c.nome}
                </span>
              </Link>
            );
          })}
        </CaroselloOrizzontale>
      </section>
    </div>
  );
}
