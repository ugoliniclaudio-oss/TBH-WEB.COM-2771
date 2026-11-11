import { Tv, Radio, Info } from "lucide-react";
import { Link } from "wouter";
import { HeroSezione } from "../components/hero-sezione";
import { PulsanteCanale } from "../components/zapping";
import { CaroselloOrizzontale } from "../components/carosello-orizzontale";
import { SezioneCatalogoCms } from "../components/catalogo-cms";
import { SezioneRegistroGuida } from "../components/guida-registro";
import {
  canaliOrdinati,
  CONTENUTI_IN_HOME,
  PALINSESTO_NOTA,
  PALINSESTO_SOTTOTITOLO,
  PALINSESTO_TITOLO,
  percorsoCanale,
} from "../lib/palinsesto";

/**
 * TUTTI I CANALI — la «guida TV» di TBH-WEB.
 * Tutti i canali in una schermata sola: nome, categoria e funzione. Nessun numero
 * a schermo (ordine del 28/09/2026): l'ordine è editoriale, non una numerazione.
 * Nessuna pagina nuova: ogni voce porta alla pagina canonica che esiste già.
 */
export default function GuidaCanaliPage() {
  const canali = canaliOrdinati();

  return (
    <div className="pb-16">
      <HeroSezione
        occhiello="Regia TBH-WEB · tutti i canali"
        titolo={PALINSESTO_TITOLO}
        sottotitolo={PALINSESTO_SOTTOTITOLO}
        colore="var(--tbh-neon)"
        azioni={[
          { label: "Home · la regia", to: "/", primaria: true },
          { label: "TBH / CEO", to: percorsoCanale(99) },
        ]}
      />

      <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Tv size={16} className="text-[var(--tbh-neon)]" />
          <h2 className="tbh-h2 tbh-display">TUTTI I CANALI</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {canali.map((c) => (
            <div key={c.numero} className="flex">
              <div className="w-full [&>a]:w-full">
                <PulsanteCanale canale={c} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 04/11/2026 (round 18) — tutti i Channel del registro (Touch Music Records, società, DM, NOVA, BEST…). */}
      <SezioneRegistroGuida />

      {/* Home e Channel/pagine aggiunti dal pannello Gestione contenuti (28/10/2026). */}
      <SezioneCatalogoCms />

      <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Radio size={16} className="text-[var(--tbh-neon)]" />
          <h2 className="tbh-h2 tbh-display">IN PRIMO PIANO SUL PALINSESTO</h2>
        </div>
        <p className="tbh-body text-[var(--tbh-muted)] mb-4 max-w-3xl">
          I contenuti promossi come pulsante autonomo: appartengono a un canale, ma non restano
          nascosti dentro il canale.
        </p>
        <CaroselloOrizzontale etichetta="In primo piano sul palinsesto">
          {CONTENUTI_IN_HOME.map((c) => (
            <Link
              key={`${c.canale.numero}-${c.url}`}
              to={c.url}
              className="tbh-card shrink-0 w-[230px] p-4"
              style={{ borderColor: c.canale.colore }}
              data-evidenza={c.url}
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                {c.etichetta}
              </span>
              <h3 className="tbh-display text-lg mt-1.5 leading-tight">{c.titolo}</h3>
              <span
                className="mt-3 block text-[10px] uppercase tracking-[0.16em]"
                style={{ color: c.canale.colore }}
              >
                {c.canale.nome}
              </span>
            </Link>
          ))}
        </CaroselloOrizzontale>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 md:px-8 pb-4">
        <div className="tbh-card p-5 flex gap-3 items-start">
          <Info size={18} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
          <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">{PALINSESTO_NOTA}</p>
        </div>
      </section>
    </div>
  );
}
