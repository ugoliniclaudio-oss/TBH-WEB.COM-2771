# Piano — J.C. HUGÒ RADIO (web radio 24/7)

Sezione esistente `/musica` (+ `/musica/jc-hugo`, `/dj-hugo`): niente sito separato. Il catalogo resta quello di oggi (`brani_master` + `brani_sorgenti`), la futura app userà le stesse API.

## Cosa ho verificato oggi (14/10/2026)

| Fonte | Cosa c'è | Si può trasmettere dal sito? |
|---|---|---|
| Suno `@hugoveejay` («TOUCH MUSIC») | **398 brani** (quasi tutti in 2 versioni), 3 playlist: NEW ALBUM 2026 (3), INNO SQUADRE (16), New Production (48). Titoli, copertine e durate leggibili. | **No, non direttamente.** Suno blocca l'audio fuori da suno.com: link `cdn1.suno.ai` → 403, l'API risponde `forbidden`, e il player usa uno stream protetto. Aggirare il blocco non lo faccio. |
| YouTube `@touchmusicradiotv` | 91 video + 24 shorts + 6 dirette. Circa 50 sono brani di DJ Hugo / Touch Music, il resto sono spot, sigle, servizi ed eventi. | **Sì**, con il player ufficiale YouTube (embed), che può partire dal secondo giusto. |
| Secondo profilo Suno | Non l'ho trovato nei dati del sito né nelle chat. | Mi serve il link. |
| Palinsesto DM (già sul sito, confermato da DM Sport Live il 15/09) | Lun 19:45 Calcio di Rigore · Mar 18:45 TG Sport · Mar 19:45 Il Calcio D Tutti · Ven 19:45 AnteprimaSport | Le dirette sono su YouTube DM. |

**Nota sul palinsesto DM:** ti ricordi lun/mar/mer alle 19:00. Il dato confermato che il sito usa già dice lun e mar alle 19:45 e ven alle 19:45, e niente il mercoledì. Uso il dato confermato finché non mi dici altro. Repliche sul canale 88 Bologna (Made in Bo): nessun orario confermato, per ora le scrivo senza orario.

## Come funziona la radio

1. **Importazione catalogo (dati reali, niente di inventato)**
   - Suno: importo i 398 brani nel catalogo (titolo, copertina, durata, link `suno.com/song/…`), le versioni doppie vanno raggruppate sotto un solo brano come «versione 1/2». Lo stato è «da verificare» e il controllo duplicati usa le chiavi che ci sono già.
   - YouTube: importo i video musicali come sorgente `youtube`. Spot, sigle, servizi ed eventi li classifico a parte (sigle e spot vanno nella libreria spot/jingle, non in rotazione).
2. **Palinsesto automatico sincronizzato**: la API `radio` calcola la scaletta del giorno con un ordine casuale fisso per data (ora di Roma), quindi tutti sentono lo stesso brano nello stesso secondo. La scaletta è uguale per sito, app e TV.
   - Va in rotazione solo un brano che abbia una sorgente trasmissibile: un file audio caricato (meglio) oppure un video YouTube.
   - **Pausa pubblicitaria** al primo cambio brano dopo 12 minuti, e comunque mai oltre i 15. Finché non carichi gli spot, la pausa resta indicata come «SPOT — IN ALLESTIMENTO» e la musica va avanti.
   - **Fasce DM**: negli orari del palinsesto DM la radio passa al format DM, con la diretta dal canale YouTube ufficiale e il titolo del programma. Finita la puntata riprende la musica.
3. **Player «IN ONDA — RADIO 24/7»** fisso nella pagina: copertina, titolo, «prossimo brano», barra di avanzamento e link al brano (Suno/YouTube). I file audio partono con il lettore audio, i brani YouTube con il player ufficiale.
4. **Pagina** con la struttura che hai chiesto: occhiello TOUCH MUSIC RADIO TV, H1 J.C. HUGÒ RADIO, «MUSIC • RADIO • DJ SET • STREAMING» e i 7 riquadri (Musica originale · Palinsesto oggi/settimana · Brani catalogo/playlist · Pubblicità · DM Live · DJ Set · App «prossimo lancio»). DJ Set e App restano «IN ALLESTIMENTO» finché non ci sono contenuti veri.
5. **Pannello** (`/allestimento/musica`): caricamento di più MP3 insieme, abbinati al brano Suno per titolo, più una sezione Spot (file, inserzionista, periodo, attivo sì/no).

## Per avere l'audio Suno vero in radio

Sei il proprietario, quindi da suno.com puoi scaricare gli MP3 (anche una playlist intera) e caricarli nel pannello. Ognuno si aggancia da solo al suo brano e va in rotazione. **Attenzione:** con gli spot la radio diventa uso commerciale. Su Suno è permesso solo per i brani creati con un piano Pro/Premier attivo.

## File toccati

- API: `src/api/routes/radio.ts` (nuovo: palinsesto, in onda, settimana, spot) e `catalogo-musicale.ts` (import Suno/YouTube, upload audio); in `index.ts` aggiungo solo il collegamento della nuova route.
- DB: `radio_spot` (nuova tabella). `brani_sorgenti` riceve anche `durata_sec` e `in_rotazione`.
- Web: `pages/musica.tsx` (nuova testata + riquadri), `components/radio-player.tsx`, `queries/radio.ts`, `pages/pannello-musica.tsx` (upload + spot).
- Script di import: `_ricerca-radio/` (rieseguibile per i brani nuovi).

## Fasi

1. Import catalogo + radio funzionante con i brani YouTube + struttura pagina → anteprima e test.
2. Upload MP3 Suno + spot + fasce DM.
3. Test desktop/tablet/mobile → pubblicazione → l'app usa le stesse API.
