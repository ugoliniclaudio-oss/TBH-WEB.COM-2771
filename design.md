# TBH-WEB — Design System

## Direzione (richiesta Claudio, 28/08/2026)
- **Layout tipo negozio**: griglia prodotti pulita, ordinata, respiro fra le card. Il commerciale viene prima dell'effetto.
- **Loghi grandi e in evidenza**: ogni riferimento (società, attività, squadra, prodotto) ha logo grande + titolo per esteso + spazio sufficiente. Mai loghi micro.
- Niente zoom necessario: tipografia fluida (`clamp()`), tutto leggibile su TV, desktop, tablet, smartphone.
- Niente contenuti finti: dove manca il dato reale si scrive "In allestimento".

## Colori
| Token | Valore | Uso |
|---|---|---|
| `--tbh-black` | `#0a0a0b` | fondo primario |
| `--tbh-surface` | `#141417` | card, superfici |
| `--tbh-line` | `#26262b` | bordi |
| `--tbh-neon` | `#e8ff00` | accento primario (CTA, prezzi) |
| `--tbh-gold` | `#d4af37` | didascalie, premium |
| `--tbh-platinum` | `#dfe3e8` | testo forte |
| `--tbh-muted` | `#8b8b96` | testo secondario |

Fondo nero dominante, accenti neon giallo usati con parsimonia (CTA e prezzi), oro/platino per le didascalie.

## Tipografia
- Display: **Anton** (titoli, numeri, prezzi) — condensato, impatto da insegna.
- Body: **Poppins** (400/500/600).
- Scala fluida: `clamp()` su tutti i titoli. Line-height generosa (1.6) sul corpo.

## Componenti
- `ProductCard`: immagine/monogramma 1:1, titolo per esteso su 2 righe, prezzo neon grande, CTA "Acquista".
- `LogoTile`: logo grande su fondo chiaro (i loghi sono spesso su bianco), titolo completo sotto, click → pagina/sito.
- `Ticker`: testo scorrevole "gobbo" con offerte e novità.
- Griglie: `2 → 3 → 4` colonne (mobile → desktop), gap 20-28px.

## Anti-pattern
Nessun gradiente viola, nessuna griglia di card tutte identiche senza gerarchia, nessun logo compresso o tagliato.

## Restyling (richiesta Claudio, 05/09/2026) — questa sezione vince sulle precedenti

**Identità in un solo file**: `packages/web/src/web/lib/identita-tbh.ts`. Payoff, palette e
navigazione si modificano lì, mai nelle singole pagine.

- **Payoff ufficiale** (parole sue, non riscrivibili): «VISIBILITÀ SENZA CONFINI» +
  «Business. Media. Sport. Eventi. Territorio. Sempre presenti. Ovunque conta.»
- **Vietati**: «MORE THAN VISIBILITY», «MORE THAN A NETWORK», «PLAY DIFFERENT»,
  «Un ecosistema. Infinite opportunità.», «8+ AREE · 1 NETWORK · ∞ OPPORTUNITÀ», «© 2024».
- **Colori**: nero + giallo fluo `#d7ff00` (`COLORE_TBH`). Il rosso `#ff2b2b` (`COLORE_DM`) è il
  colore del **solo** mondo DM Comunicazioni: non usarlo altrove.
- **Numeri in vetrina**: solo quelli reali dell'anagrafica. Nessuna stima, nessun numero tondo
  inventato.
- **Foto**: per ora loghi e materiali d'archivio. Le foto vere entrano da sole dagli slot
  `hero:<area>` del pannello `/allestimento`. Niente foto di stock, niente immagini dei mockup.

### Struttura: un sito, tante homepage
La home è il portale; **ogni pagina interna è una mini-homepage autonoma**, comunque la si
raggiunga (menù, banner, Google, social, link diretto). Ogni pagina: hero → blocchi grafici
grandi → multimedia prima del testo → contenuti correlati. Mai una pagina fatta di solo testo.

### Menù: 16 voci fisse, identiche su tutte le pagine
HOME · TBH · DM · SPORT · RADIO · FASHION · SHOP · EVENTI · TURISMO · COMMUNITY · LAVORO ·
MOTORSPORT · SQUADRE · PRODUZIONI · DJ HUGÒ · CONTATTI (+ gruppo «Altro»).
**Regola madre**: le modifiche aggiornano la struttura, non la sostituiscono. Nessuna
destinazione del menù va persa.

### Componenti dell'impianto (`web/components/hero-sezione.tsx`)
- `HeroSezione`: occhiello + titolo con parola in evidenza + sottotitolo + fino a 4 pulsanti +
  logo + slot immagine.
- `SfondoHero`: immagine caricata se esiste, altrimenti skyline in codice + logo in filigrana.
- `BloccoSchede`: 2/3/4 colonne, swipe orizzontale su mobile (`tbh-scroll-x`), modo `compatto`
  quando l'immagine non aggiunge nulla.
- `SchedaBlocco`: logo + titolo per esteso + testo + una CTA sempre attiva.

### Linguaggio visivo per area
SPORT stadi · RADIO onde sonore · FASHION editoriale · EVENTI palchi · TURISMO mappe ·
SHOP prodotti · LAVORO annunci · MEDIA video · SOCIETÀ corporate.

### Pulsanti
Mai un URL come testo, mai un bottone morto: `APRI IL SITO` · `GUARDA IL VIDEO` ·
`ASCOLTA LIVE` · `VEDI IL PALINSESTO` · `ACQUISTA` · `SCOPRI` · `CONTATTACI` · `CANDIDATI` ·
`VEDI SU MAPS` · `ENTRA NELLO SHOP`. Senza destinazione reale: pagina di cortesia
`/in-allestimento`, oppure etichetta non cliccabile «Link da incollare».

### Mobile prioritario
Schede grandi, caroselli, swipe orizzontale. Il payoff deve restare leggibile a 420px.

### TBH Lavoro — bacheca compatta e directory (06/10/2026)
- H1 fisso «TBH Lavoro — Bacheca annunci». Sotto il titolo, nella prima schermata: barra filtri
  e righe annuncio compatte (niente locandine giganti in elenco). La scheda completa con
  locandine originali vive su `/lavoro-casting/bacheca/:slug`.
- Riga annuncio: bordo sinistro neon per «Opportunità TBH», bordo grigio per fonte esterna;
  titolo Anton 20–24px, meta in Poppins 12–13px su una o due righe (azienda · località ·
  contratto · orario · alloggio · pubblicato · scadenza · fonte). Un solo CTA principale.
- Dati mancanti: non si scrive nulla al posto loro — il campo semplicemente non compare,
  oppure «non indicato» in grigio nella scheda dettaglio.
- Filtri: chip neri con bordo `--tbh-line`, attivi in neon su nero. Select nativi scuri.
  Contatore risultati + «Azzera filtri» sempre visibili. Su mobile i filtri avanzati si aprono
  in un pannello a scomparsa.
- Archivio: righe opache, etichetta «In archivio · candidature chiuse», mai pulsante candidati.
- Directory (CPI, Federalberghi, referenti istituzionali): tabelle-schede dense, ricerca testuale
  in alto, data di verifica e fonte su ogni voce, avviso di copertura progressiva sempre visibile.
- Telecomando / scheda TBH Lavoro: prima proposta solo su `/check-web`; la home live resta com'è
  finché non viene approvata.
