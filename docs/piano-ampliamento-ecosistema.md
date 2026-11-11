# TBH-WEB.COM — Piano di ampliamento dell'ecosistema

> **AGGIORNAMENTO 05/09/2026 — ordine di Claudio: «Tibihacca bocciato, TBH-WEB promosso».**
> Il portale ufficiale è **TBH-WEB** (`tbh-web.com`). I riferimenti a `tibihacca.com` qui sotto
> sono **archivio storico** della raccolta contenuti: restano per non perdere il materiale, ma il
> nome del sito, la testata, il footer e i metadati dicono **TBH-WEB**.
> Unica eccezione: le email `@tibihacca.com` sono recapiti REALI del materiale ufficiale e restano
> valide finché Claudio non comunica i nuovi indirizzi.


Fonte: MASTER BRIEF 30 punti + mockup IMG_8801 / IMG_8802 · 29 agosto 2026

## Regole che restano sopra tutto
1. **Si amplia, non si ricostruisce.** Nessuna sezione già online viene rimossa o sostituita. Verifica rotta per rotta prima di ogni consegna.
2. **Nessun logo inventato o reinterpretato.** Logo mancante → nome per esteso + pulsante al sito/scheda + nota «Logo ufficiale da ricevere» (già attivo).
3. **Nessun contatto, URL, social, prezzo o QR inventato.** Campo assente = campo non mostrato (punto 27–28).
4. **Un'entità = una sola scheda** (punto 01). Compare in più punti solo per relazione, mai duplicata.
5. **Un'attività presente nel portale NON è automaticamente cliente o aderente al Circuito** (punto 04). Il badge Circuito compare solo con vantaggi realmente attivi.
6. **Nessuna promessa di guadagno o ritorno garantito** (punto 11).
7. **QR solo dove espressamente richiesto** (accrediti/pass), mai nelle pagine e promozioni normali.

## Palette funzionale (dal brief)
Sfondo nero/dark, testi bianchi, TBH giallo fluo come identità madre. Il colore del mondo entra solo come bordo luminoso, icona, titolo, pulsante, linea o glow — mai come sfondo.

| Mondo | Colore |
|---|---|
| TBH / Circuito | giallo fluo |
| DM Comunicazioni | rosso fluo + nero |
| Touch Plaza | arancio fluo |
| Hospitality | azzurro/ciano fluo |
| Fan Club / Community | fucsia/viola fluo |
| News / Influencity | verde lime |
| Sport | blu elettrico |
| Eventi / Entertainment | fucsia fluo |
| Music | viola elettrico |
| Offerte / Promo | arancio-giallo acceso |

Card **FEATURED** più grande e luminosa per ciò che si vuole spingere nel periodo (Speciale Estate, Hospitality, DM Sport, Fan Club, Offerta della settimana): cambia la priorità senza cambiare il design.

## Situazione di partenza
Già online: Home, Shop (17 prodotti), TBH (società 25, attività, livelli 25, pagine brand 12, servizi, produzioni), Registro (129 entità), Sport hub, Media + DM, Network, Territori, Circuiti, Community, Streaming, Eventi, Lavoro & Casting, Crew & Academy, Business Desk, Pagamenti (13 metodi), Ricerca globale, Brand & Personalizzazioni + «Brand in intervista · studio · diretta» (70 posizioni).

Manca rispetto al brief: registro unico con slug e pagina per ogni entità, pagine prodotto/servizio singole, Hospitality, TBH Assist, Club/Adesioni, pagina per singolo livello, edicola digitale Influencity, Speciali annuali, News editoriali proprie, motore banner programmabile, offerte periodiche, codici promozionali, ricerca con filtri, gerarchia a 5 livelli, back office.

---

## FASE 1 — Fondamenta: registro unico e pagine dedicate (punti 01, 05, 26, 27)
Il pezzo più importante: senza questo, tutto il resto duplica dati.
- `api/data/registro-unico.ts`: tipo `Entita` unico (id, slug, tipo, nome esteso, categoria, mondo, località, logo, hero, gallery, video, descrizione, orari, servizi, contatti, social, mappa, sito ufficiale, badge Circuito, vantaggi attivi, relazioni, stato dato) — tutti i campi opzionali, nessuno inventato.
- Adattatori che leggono le fonti esistenti (`catalog.ts`, `rete.ts`, `tbh.ts`, `registro.ts`) e le proiettano nell'entità unica: **nessun dato riscritto a mano, nessuna duplicazione**.
- Rotta `/e/:slug` (pagina dedicata «piccola home page» dell'entità) + alias parlanti `/mondo/categoria/slug`.
- Gerarchia 5 livelli: HOME → MONDO → CATEGORIA → ENTITÀ → AZIONE (sito, prenota, WhatsApp, gallery, offerta, assistenza).
- Regola click del brief: logo/nome/foto/SCOPRI aprono **la pagina interna**, non il sito esterno. Il sito esterno resta un'azione dentro la scheda.

## FASE 2 — Home vetrina (punti 02, 03, 04, 29 + mockup)
Aggiornamento della home esistente, blocchi aggiunti nell'ordine del mockup:
hero con 3 CTA (SCOPRI TBH · ESPLORA · TOUCH PLAZA) → **I NOSTRI MONDI** (13 card colorate) → banner pubblicitario → **IN EVIDENZA** (Hotel/Locali/Ristoranti/Negozi/Servizi/Eventi a rotazione) → **OFFERTE E PROMOZIONI** → **CLIENTI CIRCUITO TBH (random)** → News & Sport + Influencity → Hospitality & Assistenza → banner CTA → footer. Barra finale «L'unico ecosistema».

## FASE 3 — Touch Plaza: prodotto e servizio (punti 06, 07, 08)
16 categorie marketplace; `/shop/p/:slug` pagina prodotto (prezzo, prezzo promo, prezzo Circuito, gallery, caratteristiche, disponibilità, condizioni, correlati) e `/shop/s/:slug` pagina servizio (a chi è rivolto, cosa comprende, come funziona, tempi, documenti, FAQ, preventivo, assistenza). Prezzi solo dove esistono.

## FASE 4 — Club, Circuito e Piani (punti 11, 12)
`/club`: TBH Club €72/anno rinnovabile · P.IVA/Ambulante €91,50 una tantum (con memoria del primo ingresso) · Circuito TBH €915 una tantum. Pagina Circuito con vantaggi, convenzioni, network, visibilità, referral — senza promesse di guadagno. `/tbh/livelli/:slug`: pagina per ognuno dei 25 livelli, contenuti comuni condivisi, prezzi «da definire» finché non arrivano.

## FASE 5 — Hospitality e TBH Assist (punti 09, 10)
`/hospitality` (hotel, ristoranti, locali, esperienze, eventi, transfer, servizi, prenotazioni) con doppia azione: VAI AL SITO UFFICIALE / RICHIEDI PRENOTAZIONE ASSISTITA, aperta anche ai non aderenti. `/tbh-assist` con assistenza digitale separata in modo netto dalle attività regolamentate.

## FASE 6 — Motore banner, offerte, codici (punti 19, 20, 21, 22)
Banner programmabili (data inizio/fine, immagine, titolo, testo, CTA, URL, priorità, posizione, target, attivo) nelle 10 categorie del brief; rotazione random dei clienti Circuito reali; offerte periodiche (giorno/settimana/weekend/mese/stagione/evento/ricorrenze); codici promozionali con validità, ambito e limiti, mostrabili via banner senza pagina nuova.

## FASE 7 — Contenuti (punti 14, 15, 16, 17, 18)
Edicola digitale Influencity dal N°0 Giugno/Luglio 2022 a oggi, per anno, copertina cliccabile, pagina numero + URL per articolo; Speciali annuali 2022→2026; News con 14 categorie e articolo completo; Sport (squadre, campionati, calendari, risultati, classifiche, archivio) solo con stemmi ufficiali; Eventi con locandina, programma, ospiti, partner, mappa, prenota/acquista.

## FASE 8 — Navigazione e ricerca (punti 23, 24, 25)
Menu principale sintetico a 10 voci + menu esteso su tutti i livelli; ricerca universale su tutte le entità con filtri categoria/località/tipologia.

## FASE 9 — Back office (punto 47 della Master List)
Pannello per inserire progressivamente loghi, URL, foto, gallery, video, prezzi, promozioni, codici e testi senza passare da me. Lavoro a sé, da pianificare dopo le fasi contenuto.

---

## Cosa serve da Claudio per riempire i campi (finché non arriva: campo nascosto, mai inventato)
Loghi ufficiali società/attività e logo DM · foto e gallery reali (incluse foto studio/interviste DM) · copertine e PDF Influencity · prezzi/benefit dei 25 Livelli · condizioni definitive Circuito · indirizzi delle sedi e dei partner per le mappe · link ufficiali radio e metodi di pagamento · social ufficiali TBH · `STRIPE_SECRET_KEY`.
