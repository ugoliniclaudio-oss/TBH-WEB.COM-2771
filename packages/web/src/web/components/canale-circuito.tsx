import { useMemo, useState } from "react";
import { Layers } from "lucide-react";
import { ContentCard } from "./content-card";
import { CaroselloOrizzontale, CellaCarosello } from "./carosello-orizzontale";
import { useCompanies, useProducts } from "../queries/catalog";
import { anteprimaGriglia, hrefSocieta, ORDINE_GRUPPO, trovaKit } from "../lib/kit-societa";
import { DM, TBH, TOUCH_PLAZA, esterno, type Appartenenza } from "../lib/appartenenza";
import { euro } from "../lib/euro";
import {
  ANNUNCI_BACHECA,
  MARCHI_CIRCUITO,
  SQUADRE_SEGUITE,
  circuitoDelCanale,
  type RifVoce,
} from "../lib/canale-anteprime";

/* ────────────────────────────────────────────────────────────────────────────
   DAL CIRCUITO TBH — blocco della mini-homepage di ogni canale (04/10/2026).
   Anteprima → pulsante → scheda, divise per genere e interesse. I dati vengono
   da lib/canale-anteprime.ts; qui si risolvono con il catalogo reale.
   ──────────────────────────────────────────────────────────────────────────── */

type Voce = {
  chiave: string;
  nome: string;
  etichetta: string | null;
  logo: string | null;
  anteprima: string | null;
  appartenenza: Appartenenza;
  pagina: string;
  nota: string | null;
  prezzo?: string | null;
};

type Gruppo = { genere: string; voci: Voce[] };

type Societa = { code: string; name: string; sector: string; logo: string | null };

const NOTA_LOGO = "Logo ufficiale in allestimento.";

function voceSocieta(codice: string, tutte: Societa[]): Voce | null {
  const kit = trovaKit(codice);
  const c = tutte.find((x) => x.code.toLowerCase() === (kit?.codice ?? codice).toLowerCase()) ?? null;
  if (kit) {
    return {
      chiave: `societa:${kit.codice}`,
      nome: kit.nome,
      etichetta: kit.capogruppo ? "Capogruppo" : [kit.codice, c?.sector].filter(Boolean).join(" · "),
      logo: kit.materiali.logo,
      anteprima: anteprimaGriglia(kit),
      appartenenza: kit.appartenenza,
      pagina: hrefSocieta(kit.codice),
      nota: kit.materiali.logo || kit.materiali.logoPulsante ? null : NOTA_LOGO,
    };
  }
  if (!c) return null;
  return {
    chiave: `societa:${c.code}`,
    nome: c.name,
    etichetta: `${c.code} · ${c.sector}`,
    logo: c.logo,
    anteprima: c.logo,
    appartenenza: TBH,
    pagina: hrefSocieta(c.code),
    nota: c.logo ? null : NOTA_LOGO,
  };
}

function risolvi(rif: RifVoce, tutte: Societa[]): Voce[] {
  if (rif === "gruppo") {
    return ORDINE_GRUPPO.map((k) => voceSocieta(k, tutte)).filter((v): v is Voce => v !== null);
  }
  if (rif === "squadre") {
    return SQUADRE_SEGUITE.map((s) => ({
      chiave: `squadra:${s.id}`,
      nome: s.nome,
      etichetta: "Società seguita",
      logo: s.logo,
      anteprima: s.logo,
      appartenenza: esterno("Società seguita"),
      pagina: s.pagina,
      nota: null,
    }));
  }
  const [tipo, id] = rif.split(/:(.+)/) as [string, string];
  if (tipo === "societa") {
    const v = voceSocieta(id, tutte);
    return v ? [v] : [];
  }
  if (tipo === "marchio") {
    const m = MARCHI_CIRCUITO.find((x) => x.id === id);
    if (!m) return [];
    return [
      {
        chiave: rif,
        nome: m.nome,
        etichetta: m.sottotitolo,
        logo: m.logo,
        anteprima: m.logo,
        appartenenza: m.circuito === "dm" ? DM : TBH,
        pagina: m.pagina,
        nota: null,
      },
    ];
  }
  if (tipo === "annuncio") {
    const a = ANNUNCI_BACHECA.find((x) => x.id === id);
    if (!a) return [];
    return [
      {
        chiave: rif,
        nome: a.nome,
        etichetta: a.sottotitolo,
        logo: null,
        anteprima: a.locandina,
        appartenenza: TBH,
        pagina: `/lavoro-casting/bacheca#${a.ancora}`,
        nota: null,
      },
    ];
  }
  if (tipo === "squadra") {
    return risolvi("squadre", tutte).filter((v) => v.chiave === rif);
  }
  return [];
}

export function CanaleCircuito({ numero, colore }: { numero: number; colore: string }) {
  const definizione = circuitoDelCanale(numero);
  const serveCatalogo = definizione.some((g) => g.voci?.length);
  const serveNegozio = definizione.some((g) => g.prodotti);
  const qSocieta = useCompanies();
  const qProdotti = useProducts();
  const [filtro, setFiltro] = useState<string>("Tutti");

  const gruppi = useMemo<Gruppo[]>(() => {
    const tutte: Societa[] = [...(qSocieta.data?.societa ?? []), ...(qSocieta.data?.attivita ?? [])];
    const articoli = qProdotti.data?.items ?? [];

    const voceArticolo = (p: (typeof articoli)[number]): Voce => {
      const inAllestimento = !!p.stripe && p.stripe.stato !== "pubblicato";
      return {
        chiave: `prodotto:${p.slug}`,
        nome: p.title,
        etichetta: `Touch Plaza · ${p.category}`,
        logo: null,
        anteprima: p.image,
        appartenenza: TOUCH_PLAZA,
        pagina: `/shop/p/${p.slug}`,
        nota: p.image ? null : "Foto del prodotto in allestimento.",
        prezzo: inAllestimento ? null : euro(p.priceCents),
      };
    };

    const out: Gruppo[] = [];
    for (const g of definizione) {
      const voci: Voce[] = [];
      for (const r of g.voci ?? []) voci.push(...risolvi(r, tutte));

      if (g.prodotti) {
        const { categoria, slug, tutteLeCategorie } = g.prodotti;
        if (tutteLeCategorie) {
          const categorie = Array.from(new Set(articoli.map((p) => p.category)));
          for (const cat of categorie) {
            out.push({
              genere: `${g.genere} · ${cat}`,
              voci: articoli.filter((p) => p.category === cat).map(voceArticolo),
            });
          }
          continue;
        }
        const scelti = slug
          ? slug.map((s) => articoli.find((p) => p.slug === s)).filter((p): p is (typeof articoli)[number] => !!p)
          : articoli.filter((p) => !categoria || p.category === categoria);
        voci.push(...scelti.map(voceArticolo));
      }

      // Una realtà compare una volta sola nello stesso genere.
      const viste = new Set<string>();
      const uniche = voci.filter((v) => (viste.has(v.chiave) ? false : (viste.add(v.chiave), true)));
      if (uniche.length) out.push({ genere: g.genere, voci: uniche });
    }
    return out;
  }, [definizione, qSocieta.data, qProdotti.data]);

  const caricamento =
    (serveCatalogo && qSocieta.isLoading) || (serveNegozio && qProdotti.isLoading);
  const generi = gruppi.map((g) => g.genere);
  const attivo = generi.includes(filtro) ? filtro : "Tutti";
  const visibili = attivo === "Tutti" ? gruppi : gruppi.filter((g) => g.genere === attivo);

  return (
    <section className="mx-auto max-w-[1500px] px-4 md:px-8 pb-8" data-circuito-canale={numero}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
            Anteprime · per genere e interesse
          </span>
          <h2 className="tbh-h2 tbh-display flex items-center gap-2">
            <Layers size={18} style={{ color: colore }} /> DAL CIRCUITO TBH
          </h2>
        </div>
        {generi.length > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtra per genere">
            {["Tutti", ...generi].map((g) => (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={attivo === g}
                data-genere-filtro={g}
                onClick={() => setFiltro(g)}
                className={`text-[10px] font-bold uppercase tracking-[0.14em] rounded-full px-3 py-1.5 border transition ${
                  attivo === g
                    ? "text-black border-transparent"
                    : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:text-white"
                }`}
                style={attivo === g ? { background: colore } : undefined}
              >
                {g}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {caricamento ? (
        <p className="text-sm text-[var(--tbh-muted)]">Caricamento anteprime…</p>
      ) : gruppi.length === 0 ? (
        <div className="tbh-card p-5 flex flex-col gap-1" data-circuito-vuoto>
          <span className="tbh-display text-sm tracking-[0.14em] uppercase" style={{ color: colore }}>
            In allestimento · aggiornamento continuo
          </span>
          <p className="text-sm text-[var(--tbh-muted)]">
            Le anteprime delle realtà di questo canale compaiono qui appena arriva il materiale ufficiale.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {visibili.map((g) => (
            <div key={g.genere} data-circuito-genere={g.genere}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: colore }}>
                {g.genere} <span className="text-[var(--tbh-muted)] font-normal">· {g.voci.length}</span>
              </h3>
              <CaroselloOrizzontale etichetta={`Dal circuito TBH — ${g.genere}`}>
                {g.voci.map((v) => (
                  <CellaCarosello key={v.chiave}>
                    <ContentCard
                      nome={v.nome}
                      logo={v.logo}
                      anteprima={v.anteprima}
                      etichetta={v.etichetta}
                      pagina={v.pagina}
                      appartenenza={v.appartenenza}
                      nota={v.nota}
                      formato="scheda-attivita"
                      altezzaLogo="h-36"
                      className="h-full"
                    >
                      {v.chiave.startsWith("prodotto:") ? (
                        <p className="text-sm">
                          {v.prezzo ? (
                            <>
                              <span className="text-[var(--tbh-muted)] text-xs uppercase tracking-wide">
                                Prezzo di listino{" "}
                              </span>
                              <span className="font-bold">{v.prezzo}</span>
                            </>
                          ) : (
                            <span className="text-[var(--tbh-gold)] text-xs uppercase tracking-wide">
                              In allestimento
                            </span>
                          )}
                        </p>
                      ) : null}
                    </ContentCard>
                  </CellaCarosello>
                ))}
              </CaroselloOrizzontale>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
