# AGGIORNAMENTO GLOBALE — UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE (17/09/2026)

Snapshot un passo indietro: /home/user/backup-tbh-web/un-passo-indietro_20260917-*_pre-record-master

## Cosa c'era già (verificato nel codice, non da rifare)
- `api/data/registro.ts` — registro unico che fonde le anagrafiche e riconosce la stessa
  entità con più qualifiche invece di duplicarla («crea una volta, collega ovunque»).
- `api/data/medialibrary.ts` — archivio con fonte e stato di verifica per ogni record.
- `web/components/tessera-logo.tsx` — regola misura standard: il riquadro decide, mai l'immagine,
  `object-contain`, mai `object-cover` su uno stemma.
- `LogoBox` dentro `tiles.tsx` — esisteva ma locale, con solo 3 misure (sm/md/lg).
- `api/index.ts` → `/api/media/<chiave>` — indirizzo stabile dei file caricati.
- Pannelli di caricamento: `media-slot.tsx`, `pannello-monitor`, `pannello-prodotti`.
- Stato IN ALLESTIMENTO: `api/data/allestimento-vuoto.ts` + `components/in-allestimento.tsx`.

## Da costruire
1. [x] `api/data/formati-logo.ts` — i 13 formati del punto 3, area di rispetto 10%, regole contain
2. [x] `web/components/logo-box.tsx` — LogoBox GLOBALE unico (punto 3 + 5), fallback nome per esteso
3. [x] motore varianti automatiche: `/api/logo/<formato>/<chiave>` (punto 3) — file reali per
       favicon, OG e stampa, generati dal master, mai deformati
4. [x] tabelle `marchi` + `marchio_media` — record master unico + kit ufficiale (punti 1 e 4)
5. [x] `api/routes/marchi.ts` — lettura pubblica + caricamento admin che aggiorna il MASTER (punto 6)
6. [x] `ContentCard` unica che consuma il record master (punto 5)
       — `web/components/content-card.tsx` + preset CompanyCard / TeamCard / EntitaCard;
         `LinkTile` (tiles.tsx) è diventata un adattatore su ContentCard, firma invariata;
         `EntitaTile` (vetrina.tsx), `CircuitoBanner`, `/mappa` e `/prospect` non hanno più
         box logo scritti a mano: usano LogoBox / RiquadroLogo;
         `RiquadroLogo`, `loghi-brand` e `network-loghi` scaricano la variante dal master;
         elenco dei componenti globali unici scritto in testa a `content-card.tsx`.
7. [x] scansione di tutto il sito + elenco amministrativo dei difetti (punto 8)
       — `api/data/scansione.ts` + `api/routes/scansione.ts` (controlli su disco: file assente,
         indirizzo scritto male, logo troppo piccolo) + pannello `/allestimento/scansione`
         con filtri, riepilogo e copia dell'elenco. 151 difetti reali rilevati.
8. [x] verifica reale col browser + typecheck
       — typecheck fermo a 21 errori preesistenti (nessuno nuovo);
         pagine controllate a video: /, /network, /tbh/societa, /sport/societa-seguite,
         /sport/squadre, /design, /mappa, /mappa-sito, /allestimento/scansione.

## Difetto grosso chiuso in questo giro (punto 9)
`A.C. San Marino Calcio` (e le altre società seguite) avevano lo stemma in `sport.ts` ma
`logo: null` in `catalog.ts`: completo in /sport/squadre, vuoto in /sport/societa-seguite —
esattamente il caso segnalato da Claudio sul Verucchio. `api/routes/catalog.ts` ora risolve
squadre e società dall'identità unica: nessun file copiato in una seconda anagrafica.
Verificato a video: tutte e 9 le società seguite mostrano lo stesso originale del master.

## Pulizia nomi e loghi delle società di calcio — 17/09/2026 (giro approvato da Claudio)
Chiusi i due difetti che si potevano chiudere senza file nuovi. La scansione scende da 151 a 137.

1. **7 entità scritte in più modi → 0.** `dm-video.ts` scriveva le società in forma abbreviata
   («Verucchio», «Victoria 1968», «San Marino Calcio»), l'area sport per esteso: la stessa
   società risultava scritta in due o tre modi. Ora `dm-video.ts` porta il nome per esteso
   ufficiale, identico a `sport.ts` e `catalog.ts`. Anche `catalog.ts` allineato:
   «A.S.D. Verucchio Calcio» → «A.S.D. Verucchio Calcio 1957».
   Nessun nome inventato: fra le forme già presenti nel sito è stata scelta quella completa.
   I titoli dei video restano alla lettera come li ha pubblicati Daniele Manuelli.
   La ricerca dei video è per `slug`, quindi la rinomina non ha rotto nessun abbinamento.
2. **7 loghi «recuperati» → 0.** Le 7 società seguite in `catalog.ts` avevano `logo: null` e lo
   stemma arrivava dal recupero automatico. Ora il percorso del file originale è scritto anche
   nell'anagrafica d'origine (file verificati su disco in `public/teams/`): la scheda non
   dipende più dal recupero. Il risolutore resta come rete di sicurezza.
3. `highlights-dm.tsx`: i due `<img>` scritti a mano (logo DM e stemmi) ora scaricano la
   variante dal master via `urlVariante`, come vuole il punto 5.

## Elenco dei difetti aperti (dalla scansione reale, /allestimento/scansione)
Totale 137 · bloccanti 0 · da sistemare 9 · da completare 128
- 118 loghi originali mancanti → servono i file da Claudio, non si inventano
- 9 stemmi troppo piccoli per i formati grandi (es. san-marino-calcio.png 136×186)
- 10 monitor senza contenuto → serve la tabella dei numeri di canale
- 0 bloccanti
- CHIUSI in questo giro: 7 entità scritte in più modi, 7 loghi recuperati

## Regole ferree
- nessun dato/prezzo/logo/data inventato → dove manca: IN ALLESTIMENTO / Contenuto disponibile prossimamente
- solo loghi originali caricati: mai loghi AI, ridisegnati, deformati o placeholder
- l'originale non si sovrascrive mai: le varianti sono derivate
- il logo mantiene le sue proporzioni: cambia il contenitore, non il marchio
