# CAPITAN TOUCH — A CACCIA DEI NEURONI PERDUTI

Modulo interattivo del portale TBH. Specifica tecnica ricevuta da Claudio il 04/09/2026,
con la sua modifica finale: **3 ritrovamenti al giorno per utente** (non 3 apparizioni totali
sul sito) + **premi a disponibilità globale limitata**.

## Regole applicate

1. **Limite giornaliero per utente**: massimo 3 ritrovamenti al giorno a testa. Il contatore è
   tenuto dal server, non dal browser. Le 3 occasioni possono capitare sulla stessa pagina o su
   pagine diverse; mai due Capitan Touch contemporaneamente (l'overlay è unico).
2. **Scarsità reale dei premi**: ogni premio ha un numero di pezzi disponibili. Quando finiscono,
   non viene più assegnato. I 5 Neuroni d'Oro sono 5 in tutto il sito: 2.000 persone possono
   giocare, ma i Neuroni d'Oro restano 5.
3. **Comparsa a tempo**: Capitan Touch resta in pagina 5–10 secondi, fa la sua gag e scappa fuori
   dallo schermo. Se l'utente non è abbastanza veloce, l'occasione è persa (e NON consuma un
   ritrovamento: consuma solo l'apparizione).
4. **Posizioni autorizzate**: la pagina in cui appare è scelta a caso da un elenco deciso
   dall'amministratore. Niente comparse fuori elenco.
5. **Nessun premio inventato**: i neuroni sono gettoni di gioco. Il contenuto reale del premio
   (sconto, omaggio, coupon, buono) lo scrive Claudio dal pannello. Finché non lo scrive, la
   finestra mostra il neurone trovato e "premio da definire", non una promessa.

## Categorie di neuroni

| Categoria | Note |
|---|---|
| Neurone Comune | accumulabile |
| Neurone Speciale | accumulabile |
| Neurone Premio | accumulabile, sblocca un premio |
| Neurone d'Oro | pezzo unico, si esaurisce |

## Dove può apparire (posizioni autorizzate iniziali)

Home, Pagine TBH, Media/DM, Sport, Eventi, Shop, Community, schede delle attività commerciali,
area Cercami · Seguimi · Trovami, mappa TBH.

## Comportamento

Le tre pose ufficiali 3D (sfondo trasparente, nessuna parte tagliata):

- `/capitan-touch/capitan-saluta.png` — entra, saluta, indica
- `/capitan-touch/capitan-cerca.png` — si guarda intorno cercando il neurone
- `/capitan-touch/capitan-scappa.png` — spaventato, scappa fuori dallo schermo

Animazioni: entra dal bordo, cammina/corre, si guarda intorno, indica, saluta, scappa.
Al click si apre la finestra "HAI TROVATO CAPITAN TOUCH!" con il neurone o l'indizio.

Sulla scheda di un'attività aderente la finestra dice "CAPITAN TOUCH È PASSATO DA QUI" e il
premio può chiedere un'azione: aprire la scheda, aprire il sito dell'attività, vedere un'offerta,
andare sul posto, riscattare un coupon.

Sulla mappa può comparire sopra un marker: "MI HAI TROVATO! Guarda dove sono finito questa
volta…" e si apre la scheda dell'attività. Google Maps non viene modificato: si usano i
collegamenti alle schede Google Maps.

## Pannello amministratore

`TBH → Capitan Touch` (dentro l'area riservata, stesso codice di allestimento):
Nuova caccia · Posizioni · Premi · Neuroni · Utenti · Vincitori · Sponsor · Statistiche ·
Attiva/Disattiva. Statistiche: apparizioni, click, utenti partecipanti, pagine visitate,
attività raggiunte, premi assegnati, conversioni.

## Limite tecnico da dire a Claudio

Il portale non ha ancora il login utente. L'identità del giocatore è quindi un codice anonimo
salvato sul dispositivo: il limite di 3 al giorno vale per dispositivo/browser e un utente
smaliziato può azzerarlo svuotando i dati del browser.
**La scarsità dei premi invece è al sicuro**: è contata dal server, quindi i 5 Neuroni d'Oro
restano 5 comunque. Per rendere blindato anche il limite giornaliero serve l'area utente con
registrazione.
