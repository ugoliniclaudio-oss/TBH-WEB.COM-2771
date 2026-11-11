import { useMediaPrefisso, useMediaSlot } from "../queries/media";
import { eImmagine } from "./media-slot";

/* ══════════════════════════════════════════════════════════════════════════════
   IMMAGINE TBH — il modo unico in cui tutto il sito mostra un'immagine.

   Ordine di Claudio del 29/09/2026 (REGOLE-MASTER, Priorità 2bis «Sistema universale
   immagini e anteprime»):

   «Carichi un'immagine master di buona qualità e il sito genera: card canale → card
    prodotto → hero scheda → miniatura carosello → versione mobile. […] Le CARD devono
    mantenere dimensioni omogenee anche quando le immagini originali hanno dimensioni
    differenti. Per fotografie/prodotti object-fit: cover. Per loghi object-fit: contain.
    Non deformare immagini. Non tagliare loghi. Non ricostruire loghi. Non generare
    automaticamente immagini false. […] NON richiedere di caricare manualmente copie
    differenti della stessa immagine.»

   Perché sta in un file solo (regola anti-doppioni, Priorità 1bis punto g):
   · la misura del riquadro la decide l'USO (card, miniatura, hero, mobile), non la pagina;
   · come si taglia lo decide l'IMMAGINE (tipo + inquadratura salvata nel pannello);
   · se l'immagine non c'è ancora, la scritta di attesa dice LA VERITÀ su quel contenuto
     («Foto del prodotto da caricare» su un kit beauty, non «Logo ufficiale da ricevere»).

   Nessuna immagine viene inventata, generata o ricostruita: se manca, manca, e si vede
   scritto che cosa serve.
   ══════════════════════════════════════════════════════════════════════════════ */

/** A cosa serve il riquadro: da qui esce il rapporto, non dalla pagina. */
export type UsoImmagine =
  /** Card di canale, prodotto, notizia: 16:9. */
  | "card"
  /**
   * ANTEPRIMA DI UN ARTICOLO DEL NEGOZIO: 4:3 (30/09/2026, ordine di Claudio «rendi le
   * immagini di anteprima articoli ben visibili e proporzionate agli spazi, se sono
   * piccoli aumenta, crea una dimensione standard per tutti»).
   *
   * Perché un rapporto suo e non il 16:9 delle altre card: le immagini degli articoli
   * sono le slide ufficiali del listino, con dentro il prezzo, i vantaggi e il marchio.
   * In 16:9 quella roba finiva tagliata sopra e sotto. Il 4:3 è un terzo più alto — si
   * vede di più — ed è UNA misura sola per tutti gli articoli, quindi le card restano
   * allineate anche quando le slide arrivano di formati diversi.
   */
  | "articolo"
  /** Miniatura di carosello e risultati di ricerca: 4:3. */
  | "miniatura"
  /** Riquadro quadrato: loghi in griglia, stemmi, avatar. */
  | "quadrata"
  /** Testata grande di una scheda: 16:9. */
  | "hero"
  /** Persone e locandine: 4:5. */
  | "verticale"
  /** Nessun rapporto imposto: il riquadro lo decide chi chiama (raro). */
  | "libera";

const RAPPORTO: Record<UsoImmagine, string> = {
  card: "aspect-[16/9]",
  articolo: "aspect-[4/3]",
  miniatura: "aspect-[4/3]",
  quadrata: "aspect-square",
  hero: "aspect-[16/9]",
  verticale: "aspect-[4/5]",
  libera: "",
};

/**
 * TIPO MEDIA — deciso da Claudio nel pannello. Serve a due cose: come si inquadra
 * (un logo non si taglia) e che cosa c'è scritto quando l'immagine non è ancora arrivata.
 */
export type TipoVisuale =
  | "logo"
  | "prodotto"
  | "immagine"
  | "locandina"
  | "copertina"
  | "thumbnail"
  | "servizio"
  | "slide"
  | "documento";

/** I tipi che NON vanno mai tagliati: devono starci dentro tutti interi. */
const INTERI: TipoVisuale[] = ["logo", "locandina", "slide", "documento"];

/**
 * La scritta di attesa, tipo per tipo. È la correzione chiesta da Claudio:
 * «correggerei anche quella dicitura: non tutto deve avere un "logo"».
 */
const ATTESA: Record<TipoVisuale, string> = {
  logo: "Logo ufficiale da ricevere",
  prodotto: "Foto del prodotto da caricare",
  immagine: "Foto da caricare",
  locandina: "Locandina da ricevere",
  copertina: "Copertina da caricare",
  thumbnail: "Anteprima del video da caricare",
  servizio: "Immagine del servizio da caricare",
  slide: "Slide da caricare",
  documento: "Documento da caricare",
};

/** Quello che serve per disegnare un'immagine: è la riga del Media Manager. */
export type MaterialeVisuale = {
  url: string;
  titolo?: string | null;
  descrizione?: string | null;
  tipo?: string | null;
  mime?: string | null;
  /** `auto` (logo intero, foto piena) · `cover` · `contain`. Mai deformata. */
  adattamento?: string | null;
  focusX?: number | null;
  focusY?: number | null;
  zoom?: number | null;
};

/**
 * L'IMMAGINE CHE STA GIÀ NEI DATI DEL SITO (la slide ufficiale di un articolo del listino,
 * consegnata da Claudio) diventa un materiale come gli altri, con una regola in più: non si
 * taglia. Quelle slide hanno dentro prezzo, vantaggi e marchio — ritagliarle per far quadrare
 * un riquadro vuol dire nascondere il prezzo, ed è l'errore che Claudio ha segnalato il
 * 30/09/2026. Si vedono intere, dentro la misura standard dell'uso, senza deformarle.
 *
 * Le foto caricate dal pannello NON passano da qui: quelle mantengono l'inquadratura
 * (cover + focal point) che Claudio ha scelto lui quando le ha caricate.
 */
export function materialeDaListino(
  url: string,
  titolo?: string | null,
): MaterialeVisuale {
  return { url, titolo: titolo ?? null, tipo: "prodotto", adattamento: "contain" };
}

/** cover o contain: lo decide l'inquadratura salvata, altrimenti il tipo. */
export function adattamentoDi(item: MaterialeVisuale): "cover" | "contain" {
  const scelto = (item.adattamento ?? "auto").toLowerCase();
  if (scelto === "cover" || scelto === "contain") return scelto;
  return INTERI.includes((item.tipo ?? "immagine") as TipoVisuale) ? "contain" : "cover";
}

/**
 * UN'IMMAGINE GIÀ CARICATA, dentro il riquadro giusto.
 *
 * Il riquadro tiene la misura dell'uso (le card restano tutte uguali anche con foto
 * verticali dentro); l'immagine ci sta dentro con `cover` o `contain` e con il focal
 * point scelto nel pannello. Niente `fill`: deformare è vietato.
 */
export function ImmagineTBH({
  item,
  uso = "card",
  alt,
  className = "",
  sfondo = "bg-black/40",
  arrotonda = "rounded-2xl",
}: {
  item: MaterialeVisuale;
  uso?: UsoImmagine;
  /** Testo alternativo. Se non passato si usa descrizione (ALT TEXT) o titolo. */
  alt?: string;
  className?: string;
  /** Dietro un logo `contain` serve un fondo: i loghi ufficiali arrivano su bianco. */
  sfondo?: string;
  arrotonda?: string;
}) {
  const fit = adattamentoDi(item);
  const zoom = Math.max(100, Math.min(300, item.zoom ?? 100)) / 100;
  const fx = Math.max(0, Math.min(100, item.focusX ?? 50));
  const fy = Math.max(0, Math.min(100, item.focusY ?? 50));
  const testo = alt ?? item.descrizione ?? item.titolo ?? "";

  // Un PDF, un video o un audio non si disegnano in un <img>: si dice che cosa sono.
  // (Correzione del 29/09/2026: un PDF in uno spazio foto lasciava un riquadro bianco.)
  if (!eImmagine({ url: item.url, tipo: item.tipo, mime: item.mime })) {
    return (
      <div
        className={`${RAPPORTO[uso]} ${arrotonda} ${sfondo} overflow-hidden grid place-items-center ${className}`}
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)] px-3 text-center">
          {/\.pdf($|\?)/i.test(item.url) ? "Documento PDF" : "Materiale non visualizzabile"}
          {item.titolo ? (
            <span className="block normal-case tracking-normal mt-1 opacity-70">
              {item.titolo}
            </span>
          ) : null}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${RAPPORTO[uso]} ${arrotonda} ${sfondo} overflow-hidden ${className}`}
    >
      <img
        src={item.url}
        alt={testo}
        loading="lazy"
        className="w-full h-full"
        style={{
          objectFit: fit,
          objectPosition: `${fx}% ${fy}%`,
          transform: zoom === 1 ? undefined : `scale(${zoom})`,
          transformOrigin: `${fx}% ${fy}%`,
        }}
      />
    </div>
  );
}

/**
 * QUANDO L'IMMAGINE NON C'È ANCORA. Non un riquadro muto e non un'immagine finta:
 * il riquadro tiene la misura giusta (così l'impaginazione non salta) e dice che cosa
 * serve per quel contenuto.
 */
export function SegnapostoImmagine({
  tipo = "immagine",
  uso = "card",
  nota,
  className = "",
  arrotonda = "rounded-2xl",
}: {
  tipo?: TipoVisuale;
  uso?: UsoImmagine;
  /** Riga aggiuntiva: di solito il nome del contenuto a cui serve l'immagine. */
  nota?: string;
  className?: string;
  arrotonda?: string;
}) {
  return (
    <div
      className={`${RAPPORTO[uso]} ${arrotonda} border border-dashed border-white/15 bg-black/30 grid place-items-center overflow-hidden ${className}`}
    >
      <span className="px-3 text-center">
        <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
          {ATTESA[tipo]}
        </span>
        {nota ? (
          <span className="block text-[11px] text-[var(--tbh-muted)]/70 mt-1 truncate max-w-[220px]">
            {nota}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/**
 * COPERTINA DI UNO SPAZIO — è questo che rende vera la frase di Claudio:
 * «ogni contenuto del sito deve poter passare da semplice testo/link a vera anteprima
 *  visuale senza dover modificare il codice della pagina».
 *
 * La pagina dichiara una volta lo spazio (`prodotto:kit-beauty-base`) e il tipo di
 * immagine che quel contenuto vuole. Finché non è stata caricata niente si vede la
 * scritta di attesa giusta; appena Claudio carica la foto dal pannello, la stessa card
 * mostra la foto — senza toccare il codice, senza ricaricare copie per ogni misura.
 */
export function CopertinaTBH({
  slot,
  tipo = "immagine",
  uso = "card",
  alt,
  nota,
  ripiego,
  className = "",
  sfondo = "bg-black/40",
  arrotonda = "rounded-2xl",
}: {
  slot: string;
  tipo?: TipoVisuale;
  uso?: UsoImmagine;
  alt?: string;
  nota?: string;
  /** Immagine già presente nei dati (es. quella del listino): vale se l'archivio è vuoto. */
  ripiego?: string | null;
  className?: string;
  sfondo?: string;
  arrotonda?: string;
}) {
  const q = useMediaSlot(slot);
  const items = q.data?.items ?? [];
  // La prima immagine vera dello spazio è l'IMMAGINE PRINCIPALE; i documenti non contano.
  const scelta =
    items.find((i) => i.tipo === tipo && eImmagine(i)) ??
    items.find((i) => eImmagine(i)) ??
    // Il ripiego è l'immagine già nei dati del sito: si mostra intera (materialeDaListino).
    (ripiego ? materialeDaListino(ripiego, alt ?? nota) : undefined);

  // La scelta di che cosa disegnare sta in un posto solo: `Copertina`.
  return (
    <Copertina
      item={scelta}
      tipo={tipo}
      uso={uso}
      alt={alt}
      nota={nota}
      className={className}
      sfondo={sfondo}
      arrotonda={arrotonda}
    />
  );
}

/**
 * COPERTINA GIÀ RISOLTA — la stessa resa di `CopertinaTBH`, ma su un materiale che
 * chi chiama ha già in mano. Serve alle GRIGLIE: una griglia di venti prodotti non deve
 * fare venti chiamate all'archivio, ne fa UNA sola con `useCopertine` e poi disegna.
 *
 * Se il materiale non c'è ancora (`undefined`), compare la scritta di attesa giusta per
 * il tipo: il riquadro tiene la stessa misura, quindi l'impaginazione non salta mai.
 */
export function Copertina({
  item,
  tipo = "immagine",
  uso = "card",
  alt,
  nota,
  className = "",
  sfondo = "bg-black/40",
  arrotonda = "rounded-2xl",
}: {
  item?: MaterialeVisuale | null;
  tipo?: TipoVisuale;
  uso?: UsoImmagine;
  alt?: string;
  nota?: string;
  className?: string;
  sfondo?: string;
  arrotonda?: string;
}) {
  if (!item || !item.url) {
    return (
      <SegnapostoImmagine
        tipo={tipo}
        uso={uso}
        nota={nota}
        className={className}
        arrotonda={arrotonda}
      />
    );
  }
  return (
    <ImmagineTBH
      item={item}
      uso={uso}
      alt={alt}
      className={className}
      sfondo={sfondo}
      arrotonda={arrotonda}
    />
  );
}

/**
 * LE COPERTINE DI UN GRUPPO, con una sola chiamata.
 *
 * Esempio: `useCopertine("prodotto:")` prende in un colpo le immagini di tutti i prodotti
 * del negozio; poi per ogni card si chiede `trova("prodotto:kit-beauty-base", "prodotto")`.
 * È la regola di Claudio «NON richiedere di caricare manualmente copie differenti della
 * stessa immagine» applicata anche al traffico: un'immagine, una chiamata, tante misure.
 */
export function useCopertine(prefisso: string, codice?: string) {
  const q = useMediaPrefisso(prefisso, codice);
  const items = q.data?.items ?? [];

  /** L'immagine principale di uno spazio: prima quella del tipo giusto, poi qualunque foto. */
  function trova(slot: string, tipo?: TipoVisuale): MaterialeVisuale | undefined {
    const dello = items.filter((i) => i.slot === slot && eImmagine(i));
    if (tipo) {
      const esatta = dello.find((i) => i.tipo === tipo);
      if (esatta) return esatta;
    }
    return dello[0];
  }

  return { trova, caricamento: q.isLoading, totale: items.length };
}

/** L'elenco dei tipi, per i pannelli: un posto solo anche per le etichette. */
export const TIPI_VISUALI: { id: TipoVisuale; nome: string; attesa: string }[] = [
  { id: "prodotto", nome: "Foto prodotto", attesa: ATTESA.prodotto },
  { id: "logo", nome: "Logo (solo se il marchio esiste)", attesa: ATTESA.logo },
  { id: "locandina", nome: "Locandina", attesa: ATTESA.locandina },
  { id: "copertina", nome: "Copertina", attesa: ATTESA.copertina },
  { id: "thumbnail", nome: "Anteprima video", attesa: ATTESA.thumbnail },
  { id: "servizio", nome: "Immagine servizio", attesa: ATTESA.servizio },
  { id: "immagine", nome: "Foto generica", attesa: ATTESA.immagine },
];

export { ATTESA as SCRITTE_DI_ATTESA };
