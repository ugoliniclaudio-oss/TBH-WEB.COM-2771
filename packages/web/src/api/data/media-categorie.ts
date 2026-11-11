/**
 * CATEGORIE DELLA LIBRERIA MEDIA TBH
 *
 * Ordine di Claudio del 28/09/2026: «Creare un'unica Libreria Media TBH, organizzata almeno
 * per categorie: TBH / DM / SPORT / INFLUENCITY / TOUCH MISS COOL / J.C. HUGÒ / EVENTI /
 * LAVORO / PRODUZIONI / TERRITORIO / ACADEMY / ALTRO».
 *
 * La categoria NON è un campo da compilare a mano: si ricava dallo slot su cui il materiale
 * è caricato (es. `influencity:copertina:2025-31` → INFLUENCITY). Così l'amministratore carica
 * e basta, e la libreria si ordina da sola. Uno slot non ancora previsto finisce in ALTRO:
 * nessun materiale viene mai perso o nascosto.
 *
 * Per aggiungere una sezione futura: una voce in CATEGORIE_LIBRERIA e i suoi prefissi in
 * REGOLE. Nessun'altra modifica al Media Manager.
 */

export type CategoriaLibreria = {
  /** identificativo stabile usato nelle chiamate e nei filtri */
  slug: string;
  /** nome mostrato in amministrazione */
  nome: string;
};

export const CATEGORIE_LIBRERIA: CategoriaLibreria[] = [
  { slug: "tbh", nome: "TBH" },
  { slug: "dm", nome: "DM Comunicazioni" },
  { slug: "sport", nome: "Sport" },
  { slug: "influencity", nome: "Influencity Magazine" },
  { slug: "miss-cool", nome: "Touch Miss Cool" },
  { slug: "jc-hugo", nome: "J.C. Hugò" },
  { slug: "eventi", nome: "Eventi e Fiere" },
  { slug: "lavoro", nome: "Lavoro e Candidature" },
  { slug: "produzioni", nome: "Produzioni" },
  { slug: "territorio", nome: "Territorio e Turismo" },
  { slug: "academy", nome: "Touch Academy" },
  { slug: "altro", nome: "Altro" },
];

const SLUG_VALIDI = new Set(CATEGORIE_LIBRERIA.map((c) => c.slug));

/**
 * Da prefisso di slot a categoria. Si confronta il pezzo iniziale dello slot, quindi vale
 * sia per `influencity:copertina:...` sia per `influencity:pagine:...`.
 * L'ordine conta: la prima regola che combacia vince.
 */
const REGOLE: { prefissi: string[]; categoria: string }[] = [
  { prefissi: ["influencity", "magazine", "edicola"], categoria: "influencity" },
  { prefissi: ["miss-cool", "misscool", "missCool"], categoria: "miss-cool" },
  { prefissi: ["jc-hugo", "jchugo", "hugo", "hugoland", "musica", "brani", "touchmusic"], categoria: "jc-hugo" },
  { prefissi: ["dm", "dmcrew", "dm-crew", "dm-sport", "dmsport"], categoria: "dm" },
  { prefissi: ["sport", "partite", "squadre", "motorsport", "cremona-2026", "cremona-circuit"], categoria: "sport" },
  { prefissi: ["eventi", "fiere", "sanremo", "plaza", "touch-plaza"], categoria: "eventi" },
  { prefissi: ["lavoro", "candidature", "candidati", "rete", "commerciale"], categoria: "lavoro" },
  { prefissi: ["produzioni", "spot", "adv-tv", "advtv", "palinsesto", "monitor", "hvs"], categoria: "produzioni" },
  { prefissi: ["territorio", "turismo", "travels", "estero", "hotel-aurora", "rimini"], categoria: "territorio" },
  { prefissi: ["academy", "touch-academy", "crew", "touch-crew", "spotlight"], categoria: "academy" },
  {
    prefissi: ["tbh", "home", "hero", "pagine", "shop", "social", "ceo", "servizi-referral", "download", "news"],
    categoria: "tbh",
  },
];

/** Categoria di uno slot. Slot sconosciuto o vuoto → `altro`. */
export function categoriaDaSlot(slot: string | null | undefined): string {
  const v = (slot ?? "").trim().toLowerCase();
  if (!v) return "altro";
  const testa = v.split(":")[0] ?? "";
  if (!testa) return "altro";
  for (const regola of REGOLE) {
    if (regola.prefissi.some((p) => p.toLowerCase() === testa)) return regola.categoria;
  }
  // Fallback morbido: uno slot tipo `dm-sport-2026:gallery` combacia comunque per inizio parola.
  for (const regola of REGOLE) {
    if (regola.prefissi.some((p) => testa.startsWith(`${p.toLowerCase()}-`))) return regola.categoria;
  }
  return "altro";
}

/** Nome leggibile di una categoria (per i titoli in amministrazione). */
export function nomeCategoria(slug: string): string {
  return CATEGORIE_LIBRERIA.find((c) => c.slug === slug)?.nome ?? "Altro";
}

/** true = lo slug è una categoria prevista (usato per validare i filtri in arrivo). */
export function categoriaValida(slug: string): boolean {
  return SLUG_VALIDI.has(slug);
}
