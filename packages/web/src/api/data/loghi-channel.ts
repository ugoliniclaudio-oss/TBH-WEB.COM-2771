/**
 * LOGHI ORIGINALI DEI CHANNEL — fonte unica (Claudio, 18/10/2026, «LOGHI CHANNEL DM E SQUADRE»).
 *
 * I 10 file consegnati dall'editore e approvati sono copiati BYTE PER BYTE (stesso md5,
 * nessuna conversione, ritaglio, ridimensionamento o ricolorazione) in
 * `public/channel/loghi/<slug Channel>.<estensione>`.
 *
 * ESTENSIONI `.jpe` (= JPEG) e `.apng` (= PNG): il plugin di build del template
 * (vite/__plugins/asset-optimizer-plugin.ts, non modificabile) ricomprime in dist/ ogni
 * .jpg/.jpeg (qualità 80) e .png. Con queste estensioni standard — servite come image/jpeg
 * e image/apng — il file pubblicato resta IDENTICO all'originale (stesso md5 anche in dist/).
 *
 * Tutto il sito legge da qui: telecomando, anteprime (tessere della home «Canale 0»,
 * stemmi, vetrine) e pagine Channel / pagine società. Così ogni Channel mostra UN SOLO
 * logo, sempre lo stesso. I vecchi file (`/teams/*.png`, `/brand/dm-comunicazioni.jpg`)
 * NON sono stati cancellati: restano in archivio, ma non sono più usati da questi Channel.
 *
 * 19/10/2026 — altri 3 originali confermati: Touch TV (01), Touch Plaza (05, slug
 * «touch-plaza-shop») e Touch R.F.A. Totale: 13 loghi confermati.
 * Touch R.F.A. è un'AGGIUNTA rispetto ai 28 Channel: registrato qui con `fuoriElenco`,
 * senza numero, senza posto in home e senza toccare lo stemma della società RFA
 * (/societa/rfa/stemma.png), finché Claudio non decide dove va.
 *
 * 19/10/2026 (registrati il 21/10) — altri 10 approvati (Direzione TBH, «INTEGRAZIONE DEI 10 CHANNEL APPROVATI»).
 * Sono PNG da 1,4–2,3 MB: l'ORIGINALE è archiviato byte per byte in
 * `public/channel/loghi/originali/<slug>.apng` (campo `originale`, md5 = allegato); il sito usa
 * una COPIA OTTIMIZZATA `<slug>.jpe` (JPEG q88, stesse dimensioni in pixel, nessun ritaglio,
 * 0,22–0,42 MB; campi `md5Copia` / `byteCopia`).
 *  · Touch Reality Show esisteva già fra i 28 (stesso slug): aggiornata solo la grafica.
 *  · Gli altri 9 NON esistevano: `inPreparazione` = nessun numero, nessun posto in home né nei
 *    caroselli, solo scheda di anteprima /check-web/channel/<slug> (channel-in-preparazione.ts).
 *  · «Touch ACI TV» non risulta in nessun file né nel database: nulla da rinominare, Touch ACI
 *    Sport è registrato come Channel nuovo.
 *  · Il «logo TBH compatto» citato nelle istruzioni NON era fra gli allegati.
 * Totale: 23 loghi.
 *
 * 28/10/2026 — LOGHI DM TV (Claudio, «modifiche con i canali DM TV»): 9 banner co-firmati
 * (DM TV + 8 squadre: Bellaria Igea Marina, Vis Novafeltria, Pietracuta, Gabicce Gradara,
 * Verucchio, San Marino, Victoria, Tropical Coriano). Campo `dmTv`: originale byte per byte in
 * `public/channel/loghi/originali/dm-tv/<slug>.apng`, copia JPEG q88 senza ritagli in
 * `public/channel/loghi/dm-tv/<slug>.jpe`. Usati SOLO come logo del Channel; gli stemmi delle
 * società e il logo DM Comunicazioni (pagine società, /dm, marquee stemmi) NON cambiano.
 * Rimini Calcio e Junior Gambettola: nessun banner DM TV consegnato → invariati.
 *
 * 28/10/2026 — CHANNEL TBH DELLE SOCIETÀ (Claudio, 9 card co-firmate TBH): nuovi Channel in HOME TBH
 * Touch Music Channel (primo, unico sopra le società), Touch Village, Touch Be Proud, Touch Hello,
 * Touch Home Consulia, Touch R.F.A. (già esistente: variante `tbh`, spostato da «Altri» a HOME TBH),
 * Touch Metropolitan Media, Touch Production, Touch Business Holding. Originali byte per byte in
 * `public/channel/loghi/originali/tbh/<slug>.apng`, copie JPEG q88 senza ritagli in
 * `public/channel/loghi/tbh/<slug>.jpe`. Loghi delle società (kit-societa, /brand/loghi) invariati.
 *
 * 28/10/2026 (round 14) — 10 BANNER TBH 2172×724: Touch Village e Touch Be Proud aggiornati (variante
 * `tbh`, card precedenti conservate), #4 Hugò e #24 Touch Lavoro/Human Resources con logo, 6 Channel
 * nuovi (Fit & Wellness, Pay, Rent, Care Assistance, Booking Host, Security) `fuoriElenco`.
 *
 * 29/10/2026 (round 15) — BANNER 11–20: Hugoland, Motorsport, Travels, Casting, Giovanile Rimini Show (scudetto
 * senza TBH, invariato), Touch Lavoro (#24, banner «Touch Lavoro Channel»; HR conservato), Touch Reality Show
 * (#26, variante `tbh`; promo del 19/10 conservato), Touch Miss Cool Web (primo logo), Touch Project e Touch
 * Spotlight (Channel nuovi `fuoriElenco`).
 *
 * ESCLUSO per ora: Junior Gambettola (nessun logo, resta solo testo).
 * Numerazione, slug e palinsesti dei Channel NON cambiano.
 */

export type LogoChannel = {
  /** Percorso pubblico del file originale. */
  src: string;
  /** Nome del file come è stato consegnato (allegato), per la tracciabilità. */
  fileOriginale: string;
  /** md5 del file: identico all'allegato consegnato. */
  md5: string;
  /** Slug della società in sport.ts / catalog.ts, per i Channel squadra. */
  squadra?: string;
  /** Dimensioni reali del file in pixel (lette dal file, non modificate). */
  larghezza: number;
  altezza: number;
  /** Data di approvazione di Claudio. */
  approvato: string;
  /**
   * Channel NON presente nell'elenco ufficiale dei 28 (CHANNEL_HOME): il logo è registrato
   * ma non riceve numero, non entra nella home e non sostituisce nessun altro Channel
   * finché Claudio non lo autorizza.
   */
  fuoriElenco?: boolean;
  /** Nome a schermo, solo per i loghi fuori elenco (gli altri usano il titolo del Channel). */
  nome?: string;
  /**
   * Channel NUOVO in preparazione (approvato il 19/10/2026): ha una scheda di anteprima ma nessun numero,
   * nessuna posizione definitiva e non entra in home / caroselli senza autorizzazione TBH.
   */
  inPreparazione?: boolean;
  /** Originale archiviato byte per byte, quando `src` è una copia ottimizzata. */
  originale?: string;
  /** md5 e peso della copia ottimizzata usata dal sito (solo se esiste `originale`). */
  md5Copia?: string;
  byteCopia?: number;
  /**
   * 28/10/2026 — logo del CHANNEL nella versione co-firmata DM TV (banner 1672×941, fondo bianco).
   * Vale solo dove si mostra il Channel (tessere, schede, telecomando, monitor); lo stemma della
   * società (`src`, letto da logoSquadra) e il logo aziendale DM Comunicazioni restano invariati.
   */
  dmTv?: VarianteLogoChannel;
  /**
   * 28/10/2026 — logo del CHANNEL nella versione co-firmata TBH (card «… Channel + Touch Business
   * Holding»). Come `dmTv`: vale solo dove si mostra il Channel; il logo/stemma della società
   * (es. /societa/rfa/stemma.png) e il logo registrato in `src` restano invariati.
   */
  tbh?: VarianteLogoChannel;
};

export type VarianteLogoChannel = {
  src: string;
  fileOriginale: string;
  md5: string;
  originale: string;
  md5Copia: string;
  byteCopia: number;
  larghezza: number;
  altezza: number;
  approvato: string;
};

export const notaApprovazione = (slug: string) =>
  `Originale consegnato dall'editore, approvato il ${(LOGHI_CHANNEL[slug]?.dmTv ?? LOGHI_CHANNEL[slug]?.tbh ?? LOGHI_CHANNEL[slug])?.approvato ?? "—"}.`;

/** Chiave = slug del Channel in CHANNEL_HOME (channel-home.ts). */
export const LOGHI_CHANNEL: Record<string, LogoChannel> = {
  "touch-tv": {
    src: "/channel/loghi/touch-tv.apng",
    fileOriginale: "25A571A7-D157-414A-99D1-D6849AD8E96C_uh1m7g.png",
    md5: "f785308763e99cc3542619693d5569e1",
    larghezza: 2168,
    altezza: 725,
    approvato: "19/10/2026",
    /* 28/10/2026 — «Scheda canale TOUCH TV con emblema TBH» (card nero e oro 1672×941): logo del
       CHANNEL co-firmato TBH. Il logo del 19/10 in `src` resta registrato e non viene cancellato. */
    tbh: {
      src: "/channel/loghi/tbh/touch-tv.jpe",
      fileOriginale: "Scheda_canale_TOUCH_TV_con_emblema_TBH_Z-Mddu.png",
      md5: "6b8e7b46a47342e3f817de73c7744069",
      originale: "/channel/loghi/originali/tbh/touch-tv.apng",
      md5Copia: "d34376aa6fd0c25b470f84ffab07c382",
      byteCopia: 228917,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  /* 28/10/2026 — card canale nero e oro consegnate da Claudio con la struttura Home → Canale → Attività.
     Channel già fra i 28 (numeri, file, slug e pagine invariati): fino a oggi erano solo testo.
     Originale byte per byte in originali/tbh/, copia web JPEG q88 senza ritagli in tbh/. */
  "touch-fashion": {
    src: "/channel/loghi/tbh/touch-fashion.jpe",
    fileOriginale: "TOUCH_FASHION__card_canale_nero_e_oro_HEt8zC.png",
    md5: "13f49c90ef8073d95cd3e47ded55e1f0",
    originale: "/channel/loghi/originali/tbh/touch-fashion.apng",
    md5Copia: "4ac968482735e98d0eac9591729df9db",
    byteCopia: 207070,
    larghezza: 1672,
    altezza: 941,
    approvato: "28/10/2026",
  },
  /* La card si intitola «Touch Cinema Studios»: il nome del Channel (27 · «Touch Cinema») non cambia. */
  "touch-cinema": {
    src: "/channel/loghi/tbh/touch-cinema.jpe",
    fileOriginale: "Identità_canale_Touch_Cinema_Studios_f9n9mI.png",
    md5: "ca4056f3ef362ad3b016932699d2b97b",
    originale: "/channel/loghi/originali/tbh/touch-cinema.apng",
    md5Copia: "9a1b5d0c97cddd00b29f6b3dd538b95b",
    byteCopia: 270334,
    larghezza: 1672,
    altezza: 941,
    approvato: "28/10/2026",
  },
  /* La card si intitola «Touch Music Radio» ed è stata consegnata come «Scheda canale»: diventa il logo
     del Channel 3 · Touch Radio (nome del Channel invariato). Il vecchio candidato
     /brand/loghi/touch-music-radio.png resta dov'era. */
  "touch-radio": {
    src: "/channel/loghi/tbh/touch-radio.jpe",
    fileOriginale: "Scheda_canale_Touch_Music_Radio_oXwkWS.png",
    md5: "5e64639cdcee890dcf2038740632b1e1",
    originale: "/channel/loghi/originali/tbh/touch-radio.apng",
    md5Copia: "41b85c4e7d1820376554174a954b8513",
    byteCopia: 211256,
    larghezza: 1672,
    altezza: 941,
    approvato: "28/10/2026",
  },
  "touch-plaza-shop": {
    src: "/channel/loghi/touch-plaza-shop.jpe",
    fileOriginale: "1e1a104b-8560-44a3-aa45-e20dba3e80bd_vLVmLR.jpeg",
    md5: "f3217f9b9195940c95effb40c83d2de1",
    larghezza: 1254,
    altezza: 1254,
    approvato: "19/10/2026",
  },
  "touch-rfa": {
    src: "/channel/loghi/touch-rfa.jpe",
    fileOriginale: "ebd427b8-6d80-43f7-b55f-dabd02ef8c0c_BQ98mV.jpeg",
    md5: "2b821237d9412597f60b701ea1a55605",
    larghezza: 1986,
    altezza: 792,
    approvato: "19/10/2026",
    fuoriElenco: true,
    nome: "Touch R.F.A. Channel",
    tbh: {
      src: "/channel/loghi/tbh/touch-rfa.jpe",
      fileOriginale: "Card_canale_R.F.A._con_endorsement_TBH-5_2rdjqZ.png",
      md5: "332fdea3c578d5e3721f86abd5786221",
      originale: "/channel/loghi/originali/tbh/touch-rfa.apng",
      md5Copia: "711784510196cc407c10da9e10b01cb1",
      byteCopia: 231268,
      larghezza: 1983,
      altezza: 793,
      approvato: "28/10/2026",
    },
  },
  /* 28/10/2026 (round 8, canali tematici) — loghi ufficiali consegnati da Claudio per due Channel che ne erano privi.
     Originali byte per byte in /channel/loghi/originali/tematici/; copie senza ritagli in /channel/loghi/tematici/.
     Arm Wrestling è uno stemma TRASPARENTE: la copia resta PNG (640×640, canale alfa conservato), mai JPEG su bianco. */
  "touch-influencity": {
    src: "/channel/loghi/tematici/touch-influencity.jpe",
    fileOriginale: "Logo_Touch_Influencity_con_scritta_CHANNEL_tHQvDS.png",
    md5: "97979991a094d09c24162d78bc706acc",
    originale: "/channel/loghi/originali/tematici/touch-influencity.apng",
    md5Copia: "213607ce374f71f2daf42f07a03f59d7",
    byteCopia: 288675,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
  },
  "touch-arm-wrestling": {
    src: "/channel/loghi/tematici/touch-arm-wrestling.apng",
    fileOriginale: "TBH_Arm_Wrestling_TRASPARENTE_REALE_B_mIkD.png",
    md5: "a549de89a52bf61342460b0d9e888a8b",
    originale: "/channel/loghi/originali/tematici/touch-arm-wrestling.apng",
    md5Copia: "e49a048e3af42fc20d2c8717b392a555",
    byteCopia: 372358,
    larghezza: 1254,
    altezza: 1254,
    approvato: "28/10/2026",
  },
  /* 28/10/2026 — Channel TBH delle società del gruppo (+ Touch Music Channel): card co-firmate TBH. */
  "touch-music-channel": {
    src: "/channel/loghi/tbh/touch-music-channel.jpe",
    fileOriginale: "Banner_con_loghi_Touch_Music_e_Business_Holding_M-ZEMo.png",
    md5: "cb8ed125d5592bb17605a8bfe440d299",
    originale: "/channel/loghi/originali/tbh/touch-music-channel.apng",
    md5Copia: "dc590a9e5abe6ee85e8c5d64eae52ab3",
    byteCopia: 200843,
    larghezza: 2168,
    altezza: 725,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Music Channel",
  },
  /* 04/11/2026 (round 16) — Touch Music Records Channel: banner co-firmato Touch Business Holding
     (JPEG 1600×900 consegnato da Claudio, copiato byte per byte: nessuna ricompressione). */
  "touch-music-records": {
    src: "/channel/loghi/tbh/touch-music-records.jpe",
    fileOriginale: "f3016c84-753b-4c37-a20e-3a2c52fd56dd_mT3Z0f.jpg",
    md5: "0689f96609adb18306883fee13f37d39",
    larghezza: 1600,
    altezza: 900,
    approvato: "04/11/2026",
    fuoriElenco: true,
    nome: "Touch Music Records Channel",
  },
  /* 28/10/2026 — Channel TOUCH TALENT & PROFESSIONALS: logo abbinato TBH (sinistra) + Touch Talent (destra).
     Originale PNG con trasparenza archiviato byte per byte; copia web JPEG q88 su fondo nero, stesse
     dimensioni, nessun ritaglio (proporzioni e distanza fra i due marchi invariate). */
  "touch-talent-professionals": {
    src: "/channel/loghi/tbh/touch-talent-professionals.jpe",
    fileOriginale: "Logo_TBH_Channel_in_oro_e_neon_Podylm.png",
    md5: "b01da30fb0d17969cfdaa9180ddd0046",
    originale: "/channel/loghi/originali/tbh/touch-talent-professionals.apng",
    md5Copia: "1a222b3a3d54b35745f4f696fdfd3667",
    byteCopia: 261009,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Talent & Professionals Channel",
  },
  "touch-village": {
    src: "/channel/loghi/tbh/touch-village.jpe",
    fileOriginale: "Scheda_canale_Touch_Village_e_TBH-1_mqtbVi.png",
    md5: "6d4c11cd07bb804b95aa4ae14ef4e864",
    originale: "/channel/loghi/originali/tbh/touch-village.apng",
    md5Copia: "64482d20c905d30478edda3edd4306d9",
    byteCopia: 163363,
    larghezza: 2168,
    altezza: 725,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Village Channel",
    /* 28/10/2026 (round 14) — nuovo BANNER «Touch Village Channel con monogramma TBH»: diventa il logo
       del Channel. La card precedente (sopra, src/originale) resta registrata e non viene cancellata. */
    tbh: {
      src: "/channel/loghi/tbh/touch-village-banner.jpe",
      fileOriginale: "Banner_Touch_Village_Channel_con_monogramma_TBH_OQbkNt.png",
      md5: "8765b150111c061ce06309aa7c250ad7",
      originale: "/channel/loghi/originali/tbh/touch-village-banner.apng",
      md5Copia: "c5f82e162b08034fa075fa92a2328794",
      byteCopia: 199350,
      larghezza: 2172,
      altezza: 724,
      approvato: "28/10/2026",
    },
  },
  "touch-be-proud": {
    src: "/channel/loghi/tbh/touch-be-proud.jpe",
    fileOriginale: "Scheda_canale_Touch_Be_Proud-2_BMib9f.png",
    md5: "2d5f02fdbd6946c5fd71250aee12c59b",
    originale: "/channel/loghi/originali/tbh/touch-be-proud.apng",
    md5Copia: "fdcdd58e187798ce21628e00b8ba1db7",
    byteCopia: 211424,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Be Proud Channel",
    /* 28/10/2026 (round 14) — nuovo BANNER «TV Touch Be Proud Channel»: logo del Channel; la card
       precedente resta registrata. */
    tbh: {
      src: "/channel/loghi/tbh/touch-be-proud-banner.jpe",
      fileOriginale: "Banner_TV_Touch_Be_Proud_Channel_Vz6Lcy.png",
      md5: "2e96f19d84062e8310e2c2590ff6a158",
      originale: "/channel/loghi/originali/tbh/touch-be-proud-banner.apng",
      md5Copia: "d450f03aa281e2077039f2635abbe979",
      byteCopia: 237719,
      larghezza: 2172,
      altezza: 724,
      approvato: "28/10/2026",
    },
  },
  /* 28/10/2026 (round 14) — 10 BANNER TBH 2172×724 (nero, logo + CHANNEL + «Touch Business Holding»).
     Originali byte per byte in originali/tbh/, copie JPEG q88 senza ritagli in tbh/.
     Channel dei 28 aggiornati SOLO nella grafica (numero, slug, pagina invariati):
     #4 Touch Deejay J.C. Hugò (banner «Deejay Hugo») e #24 Touch Lavoro (= Touch Human Resources). */
  "touch-deejay-jc-hugo": {
    src: "/channel/loghi/tbh/touch-deejay-jc-hugo.jpe",
    fileOriginale: "Banner_del_canale_Deejay_Hugo_e_TBH-2_qZq9Re.png",
    md5: "9a3f4a33890b9ee29bb0fb05f4ff66dc",
    originale: "/channel/loghi/originali/tbh/touch-deejay-jc-hugo.apng",
    md5Copia: "3762635befc2b611a212d698d8b7f8ed",
    byteCopia: 200809,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
  },
  "touch-lavoro": {
    src: "/channel/loghi/tbh/touch-lavoro.jpe",
    fileOriginale: "Banner_nero_con_Touch_HR_e_TBH-14_Ztn9Ou.png",
    md5: "e46169ccfa8f661c055e54ef5478da8f",
    originale: "/channel/loghi/originali/tbh/touch-lavoro.apng",
    md5Copia: "0516a7b2911efc7a8ce42196954557f3",
    byteCopia: 171430,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    /* 29/10/2026 (round 15) — banner «Touch Lavoro Channel» (lavoratori e skyline, fondo bianco): diventa il
       logo del Channel #24. Il banner HR del 28/10 resta registrato qui sopra (non cancellato). */
    tbh: {
      src: "/channel/loghi/tbh/touch-lavoro-banner.jpe",
      fileOriginale: "Canale_Touch_Lavoro__Opportunità_e_Futuro_Xb3Ulq.png",
      md5: "e66010ddbd55fec40655e8969c5ec5d4",
      originale: "/channel/loghi/originali/tbh/touch-lavoro-banner.apng",
      md5Copia: "51b7ecf1ec35875e537a603f80e777de",
      byteCopia: 310372,
      larghezza: 2172,
      altezza: 724,
      approvato: "29/10/2026",
    },
  },
  /* Channel NUOVI (non esistevano): fuori dai 28, in HOME TBH. */
  "touch-fit-wellness": {
    src: "/channel/loghi/tbh/touch-fit-wellness.jpe",
    fileOriginale: "Banner_Touch_Fit_e_Wellness_cClIzH.png",
    md5: "356b72b7333df8920a9b3f5973a0f1ef",
    originale: "/channel/loghi/originali/tbh/touch-fit-wellness.apng",
    md5Copia: "8fd2b2eb48ab426cef3cbb875a63c1da",
    byteCopia: 228111,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Fit & Wellness Channel",
  },
  "touch-pay": {
    src: "/channel/loghi/tbh/touch-pay.jpe",
    fileOriginale: "Banner_nero_Touch_Pay_e_TBH-2_(1)__rSo7D.png",
    md5: "8fe0e675b6e9a8b96cbe7bce9dd8163d",
    originale: "/channel/loghi/originali/tbh/touch-pay.apng",
    md5Copia: "2703b806100b7d483807f8a4711b24f1",
    byteCopia: 169138,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Pay Channel",
  },
  "touch-rent": {
    src: "/channel/loghi/tbh/touch-rent.jpe",
    fileOriginale: "Banner_nero_Touch_Rent_e_TBH-4_5yz3sf.png",
    md5: "f33259a6cd06c03f826408426018b037",
    originale: "/channel/loghi/originali/tbh/touch-rent.apng",
    md5Copia: "c4669fc64efc53c4ea9693347483d493",
    byteCopia: 227182,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Rent Channel",
  },
  "touch-care-assistance": {
    src: "/channel/loghi/tbh/touch-care-assistance.jpe",
    fileOriginale: "Banner_Touch_Care_Assistance_con_monogramma_TBH-4_Cs2orU.png",
    md5: "e95467920b9b6745e9b9eebfc8375397",
    originale: "/channel/loghi/originali/tbh/touch-care-assistance.apng",
    md5Copia: "07d0b05ef488617167819414fee9d778",
    byteCopia: 183732,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Care Assistance Channel",
  },
  "touch-booking-host": {
    src: "/channel/loghi/tbh/touch-booking-host.jpe",
    fileOriginale: "Banner_Touch_Booking_con_monogramma_dorato-8_hVsRR8.png",
    md5: "09cf88f3cd21419889191d65d6f71074",
    originale: "/channel/loghi/originali/tbh/touch-booking-host.apng",
    md5Copia: "5b1db39a13895139d2a86d882bd767a3",
    byteCopia: 219802,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Booking Host Channel",
  },
  "touch-security": {
    src: "/channel/loghi/tbh/touch-security.jpe",
    fileOriginale: "Banner_Touch_Security_e_monogramma_TBH-10_g3uDJ_.png",
    md5: "74555484c03ff4e07519264ffe5b37ec",
    originale: "/channel/loghi/originali/tbh/touch-security.apng",
    md5Copia: "f0c567645ed0acf6e605aaafd3e2c267",
    byteCopia: 195935,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Security Channel",
  },
  "touch-hello": {
    src: "/channel/loghi/tbh/touch-hello.jpe",
    fileOriginale: "Scheda_canale_Touch_Hello_con_doppio_logo-3_89VAYb.png",
    md5: "7b59a4b8fc9f2a68fe11ce552e3b0e97",
    originale: "/channel/loghi/originali/tbh/touch-hello.apng",
    md5Copia: "00f36e6b3af02a45bc170a745c42ebd5",
    byteCopia: 168908,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Hello Channel",
  },
  "touch-home-consulia": {
    src: "/channel/loghi/tbh/touch-home-consulia.jpe",
    fileOriginale: "Scheda_canale_Touch_Home_Consulia-4_yoLv_e.png",
    md5: "c2f38ac812fed828fb3ecaec5dca2927",
    originale: "/channel/loghi/originali/tbh/touch-home-consulia.apng",
    md5Copia: "58047672fd462ec1d6c1645de1555a87",
    byteCopia: 201032,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Home Consulia Channel",
  },
  "touch-metropolitan-media": {
    src: "/channel/loghi/tbh/touch-metropolitan-media.jpe",
    fileOriginale: "Card_canale_Touch_Metropolitan_Media-6_74xROP.png",
    md5: "f967c3332732c309be93e0dec2f88878",
    originale: "/channel/loghi/originali/tbh/touch-metropolitan-media.apng",
    md5Copia: "02434e89ad909c4a964d7112cccf4d34",
    byteCopia: 191907,
    larghezza: 2170,
    altezza: 725,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Metropolitan Media Channel",
  },
  "touch-production": {
    src: "/channel/loghi/tbh/touch-production.jpe",
    fileOriginale: "Card_canale_Touch_Production_con_logo_TBH-7_LvY1Gn.png",
    md5: "2917e092311df2c7d40f127238775977",
    originale: "/channel/loghi/originali/tbh/touch-production.apng",
    md5Copia: "e20977b5590b4e04a1ad056bcd268221",
    byteCopia: 193993,
    larghezza: 1774,
    altezza: 887,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Production Channel",
  },
  "touch-business-holding": {
    src: "/channel/loghi/tbh/touch-business-holding.jpe",
    fileOriginale: "Scheda_canale_Touch_Business_RphAeE.png",
    md5: "750142e9e191fb518ad6737984c90d98",
    originale: "/channel/loghi/originali/tbh/touch-business-holding.apng",
    md5Copia: "64e29ebd6d815b152e7f12bfa2bbe011",
    byteCopia: 156122,
    larghezza: 2172,
    altezza: 724,
    approvato: "28/10/2026",
    fuoriElenco: true,
    nome: "Touch Business Holding Channel",
  },
  /* 29/10/2026 (round 15) — BANNER 11–20 di Claudio (associati per CONTENUTO, non per numero del file).
     Originali byte per byte in originali/tbh/, copie JPEG q88 senza ritagli in tbh/ (sfondi originali:
     nero per Miss Cool Web e Project, bianco per gli altri). Mostrati interi con object-fit: contain.
     Channel dei 28 (Hugoland #6, Motorsport #18, Travels #21, Casting #23, Giovanile Rimini Show #25):
     cambia SOLO la grafica; numero, slug, pagina e palinsesto invariati.
     #25: scudetto blu «Giovanile Rimini Channel» SENZA marchio TBH — usato così com'è, nulla aggiunto
     (la cartella tbh/ è solo il deposito dei banner di questo giro). */
  "touch-hugoland": {
    src: "/channel/loghi/tbh/touch-hugoland.jpe",
    fileOriginale: "Hugoland_Channel__Portale_d’Oro_Fantastico_mICuMg.png",
    md5: "80105fd3045c7af2029e7ce787fe2b9f",
    originale: "/channel/loghi/originali/tbh/touch-hugoland.apng",
    md5Copia: "56be3b044a3f6eb8fcdc8eaf33ab59ff",
    byteCopia: 510851,
    larghezza: 1983,
    altezza: 793,
    approvato: "29/10/2026",
  },
  "touch-motorsport": {
    src: "/channel/loghi/tbh/touch-motorsport.jpe",
    fileOriginale: "Touch_Motorsport__auto_e_moto_da_corsa_4EnlWp.png",
    md5: "fd70b5f7ae1772e1d604ea5fb4ec2af2",
    originale: "/channel/loghi/originali/tbh/touch-motorsport.apng",
    md5Copia: "0dce89ed4fd20338ce14965c65185832",
    byteCopia: 250523,
    larghezza: 1672,
    altezza: 941,
    approvato: "29/10/2026",
  },
  "touch-travels": {
    src: "/channel/loghi/tbh/touch-travels.jpe",
    fileOriginale: "Logo_di_viaggio_Touch_Travels_e_TBH_9-96Zg.png",
    md5: "87fb4952ad4ff6fe347fc31724183d68",
    originale: "/channel/loghi/originali/tbh/touch-travels.apng",
    md5Copia: "7108e5fa9fa52fb6bb189c567e218bf0",
    byteCopia: 397828,
    larghezza: 2172,
    altezza: 724,
    approvato: "29/10/2026",
  },
  "touch-casting": {
    src: "/channel/loghi/tbh/touch-casting.jpe",
    fileOriginale: "Banner_Touch_Casting_e_Holding_XVC9lg.png",
    md5: "4e4f57e1b7b016411b1b890cba31d712",
    originale: "/channel/loghi/originali/tbh/touch-casting.apng",
    md5Copia: "1f7b0a964e0cdb66e36f820ed9063a19",
    byteCopia: 302370,
    larghezza: 2172,
    altezza: 724,
    approvato: "29/10/2026",
  },
  "giovanile-rimini-show": {
    src: "/channel/loghi/tbh/giovanile-rimini-show.jpe",
    fileOriginale: "Logo_calcistico_Giovanile_Rimini_Channel_efg8qL.png",
    md5: "ad85d59e6589a4108c63d3b82134d022",
    originale: "/channel/loghi/originali/tbh/giovanile-rimini-show.apng",
    md5Copia: "9338c93d8bec6ff0fcee3f3fedd1c23c",
    byteCopia: 214156,
    larghezza: 1536,
    altezza: 1024,
    approvato: "29/10/2026",
  },
  /* Channel NUOVI fuori dai 28 (HOME TBH): Touch Project e Touch Spotlight non esistevano come Channel;
     Touch Miss Cool (registro, /eventi/miss-cool) riceve il suo primo logo approvato. */
  "touch-miss-cool": {
    src: "/channel/loghi/tbh/touch-miss-cool.jpe",
    fileOriginale: "Banner_Touch_Miss_Cool_Web_e_TBH-16__ZjKdQ.png",
    md5: "7a4e8be38ebb086148a6ed196b538cab",
    originale: "/channel/loghi/originali/tbh/touch-miss-cool.apng",
    md5Copia: "a7e306814d2658386483efbcf79f213e",
    byteCopia: 251683,
    larghezza: 2172,
    altezza: 724,
    approvato: "29/10/2026",
    fuoriElenco: true,
    nome: "Touch Miss Cool Web Channel",
  },
  "touch-project": {
    src: "/channel/loghi/tbh/touch-project.jpe",
    fileOriginale: "Banner_nero_Touch_Project_e_TBH-12_EWOj2i.png",
    md5: "6e8d1f3b849ce9320eebc5f6cf157a71",
    originale: "/channel/loghi/originali/tbh/touch-project.apng",
    md5Copia: "d84c7ed66194dc7e82a8afc253d8f9c5",
    byteCopia: 206274,
    larghezza: 2172,
    altezza: 724,
    approvato: "29/10/2026",
    fuoriElenco: true,
    nome: "Touch Project Channel",
  },
  "touch-spotlight": {
    src: "/channel/loghi/tbh/touch-spotlight.jpe",
    fileOriginale: "Banner_bianco_TOUCH_SPOTLIGHT_CHANNEL_Efmi8K.png",
    md5: "7b90f60c16776474d912da1bc262c958",
    originale: "/channel/loghi/originali/tbh/touch-spotlight.apng",
    md5Copia: "2963abebfebe04c2e59814e875700dfc",
    byteCopia: 234118,
    larghezza: 1672,
    altezza: 941,
    approvato: "29/10/2026",
    fuoriElenco: true,
    nome: "Touch Spotlight Channel",
  },
  /* 19/10/2026 — 10 approvati: originale in archivio, copia ottimizzata sul sito. */
  "touch-backstage-experience": {
    src: "/channel/loghi/touch-backstage-experience.jpe",
    fileOriginale: "Poster_Cinematico_Touch_Backstage_Experience_QqD1_S.png",
    md5: "676a14e0fe4997261c1b26ea36c033b0",
    originale: "/channel/loghi/originali/touch-backstage-experience.apng",
    md5Copia: "2fa5758dd395e72cbd2223156a503e6a",
    byteCopia: 297342,
    larghezza: 1254,
    altezza: 1254,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch Backstage Experience Channel",
  },
  "touch-reality-show": {
    src: "/channel/loghi/touch-reality-show.jpe",
    fileOriginale: "Promo_Neon_di_Touch_Reality_Show_YaXZae.png",
    md5: "67589f1b6031b72ff498f17045fb8844",
    originale: "/channel/loghi/originali/touch-reality-show.apng",
    md5Copia: "ff7fa368601103061039c7d1721959b0",
    byteCopia: 374904,
    larghezza: 1536,
    altezza: 1024,
    approvato: "19/10/2026",
    /* 29/10/2026 (round 15) — banner TBH «TR Touch Reality Show Channel» (fondo bianco): logo del Channel #26
       (stesso Channel, nessun terzo «Touch Reality Show»). Il promo neon del 19/10 resta registrato in `src`. */
    tbh: {
      src: "/channel/loghi/tbh/touch-reality-show-tbh.jpe",
      fileOriginale: "Logo_TBH_TR_Touch_Reality_Show_Channel_my3WK4.png",
      md5: "c89310f9b81ef82bd41f491672ef0118",
      originale: "/channel/loghi/originali/tbh/touch-reality-show-tbh.apng",
      md5Copia: "55ee24d9dc8c23e47440d0af69cfd1b1",
      byteCopia: 229337,
      larghezza: 2171,
      altezza: 724,
      approvato: "29/10/2026",
    },
  },
  "touch-sbk": {
    src: "/channel/loghi/touch-sbk.jpe",
    fileOriginale: "Logo_TBH_SBK_Channel_con_Superbikers_Iwqae5.png",
    md5: "1b59e1e1f86e6394c5f7ce732d8c95d5",
    originale: "/channel/loghi/originali/touch-sbk.apng",
    md5Copia: "dbffccb4b6a830200fbaa0846a117017",
    byteCopia: 355302,
    larghezza: 1254,
    altezza: 1254,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch SBK Channel",
  },
  "touch-motogp": {
    src: "/channel/loghi/touch-motogp.jpe",
    fileOriginale: "Logo_cinematico_Touch_MotoGP_(2)_dA6t5B.png",
    md5: "dc2c51a60598633b10d6fa32b4f5bdee",
    originale: "/channel/loghi/originali/touch-motogp.apng",
    md5Copia: "bccc28b62aa8d3f9b5482587253148f5",
    byteCopia: 224042,
    larghezza: 1254,
    altezza: 1254,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch MotoGP Channel",
  },
  "touch-events": {
    src: "/channel/loghi/touch-events.jpe",
    fileOriginale: "Branding_Touch_Events_Channel_in_stile_neon_f-Un-8.png",
    md5: "6bda9cce8da40acfdb435c0b4cff4dbc",
    originale: "/channel/loghi/originali/touch-events.apng",
    md5Copia: "d635f5920c4e072b52ed353ae5a4962c",
    byteCopia: 376424,
    larghezza: 1536,
    altezza: 1024,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch Events Channel",
  },
  "touch-gourmet-cuisines": {
    src: "/channel/loghi/touch-gourmet-cuisines.jpe",
    fileOriginale: "Canale_Gourmet_Italiano_TBH_(1)_60WKF4.png",
    md5: "ba12d7fecaeba19b70cda7cf988afba3",
    originale: "/channel/loghi/originali/touch-gourmet-cuisines.apng",
    md5Copia: "735197d6a0583bbbc83983174c27ebd0",
    byteCopia: 340369,
    larghezza: 1536,
    altezza: 1024,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch Gourmet Cuisines Channel",
  },
  "touch-beach": {
    src: "/channel/loghi/touch-beach.jpe",
    fileOriginale: "Branding_TV_Touch_Beach_Channel_al_tramonto_tropicale_WXQ2rC.png",
    md5: "7e06f75fe133c099391bdb9538afcffd",
    originale: "/channel/loghi/originali/touch-beach.apng",
    md5Copia: "634beea499077dcd7ca932ec358e122a",
    byteCopia: 415143,
    larghezza: 1536,
    altezza: 1024,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch Beach Channel",
  },
  "touch-f4": {
    src: "/channel/loghi/touch-f4.jpe",
    fileOriginale: "TouchF4__Velocità_Italiana_in_Pista_w3dsVo.png",
    md5: "730d364a04f0c9c13de22780a04f23e6",
    originale: "/channel/loghi/originali/touch-f4.apng",
    md5Copia: "435e80b3db6e4146ebb055902fba7d47",
    byteCopia: 348924,
    larghezza: 1672,
    altezza: 941,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch F4 Channel",
  },
  "touch-aci-sport": {
    src: "/channel/loghi/touch-aci-sport.jpe",
    fileOriginale: "Touch_ACI_Sport_Channel_in_Corsa_7MewPe.png",
    md5: "583ddb15c2a3d21937c6e7a1a83f8349",
    originale: "/channel/loghi/originali/touch-aci-sport.apng",
    md5Copia: "a1904eefcf1f41f0e94a85cba55d79ca",
    byteCopia: 340888,
    larghezza: 1536,
    altezza: 1024,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch ACI Sport Channel",
  },
  "touch-civ": {
    src: "/channel/loghi/touch-civ.jpe",
    fileOriginale: "Emblema_CIV_Channel_TBH_Racing_QXWHk-.png",
    md5: "43239e97c027edb76fb64ccba16b0906",
    originale: "/channel/loghi/originali/touch-civ.apng",
    md5Copia: "0e4a6e35fadefac388bb7cdf6d2aee7a",
    byteCopia: 330244,
    larghezza: 1254,
    altezza: 1254,
    approvato: "19/10/2026",
    inPreparazione: true,
    nome: "Touch CIV Channel",
  },
  dm: {
    src: "/channel/loghi/dm.jpe",
    fileOriginale: "IMG_7544_hOmKVr.jpeg",
    md5: "b67e0a6887663c9102ffe7916bf672bd",
    larghezza: 460,
    altezza: 360,
    approvato: "18/10/2026",
    dmTv: {
      src: "/channel/loghi/dm-tv/dm.jpe",
      fileOriginale: "Logo_DM_TV_con_diavolo_lucido_bLbn5N.png",
      md5: "dec33c204d1cc4953671bce97952e00e",
      originale: "/channel/loghi/originali/dm-tv/dm.apng",
      md5Copia: "b95f633e5ff304235c320e64c17a99e9",
      byteCopia: 134908,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  "vis-novafeltria": {
    src: "/channel/loghi/vis-novafeltria.apng",
    fileOriginale: "E4FAC710-1D6C-4955-A064-42881A9B4855_zR-uuH.png",
    md5: "0dbfbbb7894dde4ef094de2d4c892833",
    larghezza: 1254,
    altezza: 1254,
    approvato: "18/10/2026",
    squadra: "vis-novafeltria",
    dmTv: {
      src: "/channel/loghi/dm-tv/vis-novafeltria.jpe",
      fileOriginale: "Vis_Novafeltria_Channel_e_DM_TV-2_nAWiU9.png",
      md5: "2b79e4592c27dda4b9f25dc54c7d1fb7",
      originale: "/channel/loghi/originali/dm-tv/vis-novafeltria.apng",
      md5Copia: "c9f3d4885ee46c36c2949cbc120af467",
      byteCopia: 179709,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  pietracuta: {
    src: "/channel/loghi/pietracuta.jpe",
    fileOriginale: "2a7c4f66-1e89-48ce-8c5b-9b4272ee4820_hXCVzw.jpeg",
    md5: "805c6946d3c3303dc483d5a3c202363a",
    larghezza: 381,
    altezza: 524,
    approvato: "18/10/2026",
    squadra: "pietracuta",
    dmTv: {
      src: "/channel/loghi/dm-tv/pietracuta.jpe",
      fileOriginale: "Banner_Pietracuta_Channel_e_DM_TV-3_TVxm8r.png",
      md5: "1bba957c8ec68096a64bd2534b313b5e",
      originale: "/channel/loghi/originali/dm-tv/pietracuta.apng",
      md5Copia: "51d5f2c3ea9a30d1804919ea502e9e69",
      byteCopia: 160751,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  verucchio: {
    src: "/channel/loghi/verucchio.jpe",
    fileOriginale: "26a2ccf0-d543-4931-ac8e-647699b505a7_ekxL3D.jpeg",
    md5: "ee30837e23e44953c2cfe64ea8470fe5",
    larghezza: 1024,
    altezza: 1536,
    approvato: "18/10/2026",
    squadra: "verucchio",
    dmTv: {
      src: "/channel/loghi/dm-tv/verucchio.jpe",
      fileOriginale: "Banner_calcistico_Verucchio_Channel_e_DM_TV-5_tHZBtq.png",
      md5: "f202eabed454e21c8be08da6ef330617",
      originale: "/channel/loghi/originali/dm-tv/verucchio.apng",
      md5Copia: "6829dd85fc45dd436a1e03f07cde246b",
      byteCopia: 194044,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  victoria: {
    src: "/channel/loghi/victoria.jpe",
    fileOriginale: "0805d1f5-0479-4ef0-b96e-5b27aa8c2135_bZ1gSQ.jpeg",
    md5: "db3c7dda7cf87879583f2cb36a7dc4a2",
    larghezza: 387,
    altezza: 471,
    approvato: "18/10/2026",
    squadra: "victoria-1968",
    dmTv: {
      src: "/channel/loghi/dm-tv/victoria.jpe",
      fileOriginale: "Victoria_Channel_e_logo_DM_TV-7_QMCfdO.png",
      md5: "c0950c7ef80d6776433ea5687d68cf82",
      originale: "/channel/loghi/originali/dm-tv/victoria.apng",
      md5Copia: "d09e1156f6963cd45bc099127348da69",
      byteCopia: 152112,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  "san-marino": {
    src: "/channel/loghi/san-marino.jpe",
    fileOriginale: "bdbcfcd0-0c32-4123-93e2-86c631b385ff_F8AzvD.jpeg",
    md5: "919b5bbe0bcea714c64699cb4632b9a9",
    larghezza: 451,
    altezza: 443,
    approvato: "18/10/2026",
    squadra: "san-marino-calcio",
    dmTv: {
      src: "/channel/loghi/dm-tv/san-marino.jpe",
      fileOriginale: "San_Marino_Channel_con_DM_TV-6_PLl_6b.png",
      md5: "e63aa4568d61840da5391fdd8a9ed884",
      originale: "/channel/loghi/originali/dm-tv/san-marino.apng",
      md5Copia: "8d7268de4ba54e1d609819386af98c2f",
      byteCopia: 172281,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  "gabicce-gradara": {
    src: "/channel/loghi/gabicce-gradara.jpe",
    fileOriginale: "874a50ef-1856-41f2-8ee3-f06fa62ae518_sN6WHQ.jpeg",
    md5: "fedfd3d127f70586535b0f4db9f6fa09",
    larghezza: 1193,
    altezza: 1500,
    approvato: "18/10/2026",
    squadra: "gabicce-gradara",
    dmTv: {
      src: "/channel/loghi/dm-tv/gabicce-gradara.jpe",
      fileOriginale: "Banner_Gabicce_Gradara_Channel_con_DM_TV-4_cFopzF.png",
      md5: "3fb88b936f35a8f3626a914b7020f260",
      originale: "/channel/loghi/originali/dm-tv/gabicce-gradara.apng",
      md5Copia: "0abb61dd1bb20e83ad0c016eaf665841",
      byteCopia: 167800,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  "bellaria-igea-marina": {
    src: "/channel/loghi/bellaria-igea-marina.jpe",
    fileOriginale: "7d932a1e-dad0-4476-87e5-f61e4c88a784_OVB0C3.jpeg",
    md5: "7f2d2a6f9888f28b928c190678d49b10",
    larghezza: 1047,
    altezza: 1500,
    approvato: "18/10/2026",
    squadra: "bellaria-igea-marina",
    dmTv: {
      src: "/channel/loghi/dm-tv/bellaria-igea-marina.jpe",
      fileOriginale: "Bellaria_Igea_Marina_Channel_e_DM_TV-1_DpE6Yn.png",
      md5: "b581fe6d89140b58743790f588bc9328",
      originale: "/channel/loghi/originali/dm-tv/bellaria-igea-marina.apng",
      md5Copia: "c4bccac8295642d80b81f1bbabcca3d4",
      byteCopia: 164316,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  "tropical-coriano": {
    src: "/channel/loghi/tropical-coriano.jpe",
    fileOriginale: "813fe70a-5617-42d9-9c38-003cb3c27492_lmO-r7.jpeg",
    md5: "3d8ce4b25ca28968afa03c8cd1377842",
    larghezza: 447,
    altezza: 447,
    approvato: "18/10/2026",
    squadra: "tropical-coriano",
    dmTv: {
      src: "/channel/loghi/dm-tv/tropical-coriano.jpe",
      fileOriginale: "Tropical_Coriano_Channel_accanto_a_DM_TV-8_pKjTEs.png",
      md5: "5e1cf3b6bac716df90101bb139d1fb9e",
      originale: "/channel/loghi/originali/dm-tv/tropical-coriano.apng",
      md5Copia: "abb315190d27e062f7890c92d7609b3c",
      byteCopia: 169029,
      larghezza: 1672,
      altezza: 941,
      approvato: "28/10/2026",
    },
  },
  "rimini-calcio": {
    src: "/channel/loghi/rimini-calcio.jpe",
    fileOriginale: "d949091e-0960-4439-9dbe-1bc7786f50e5_AQhsjF.jpeg",
    md5: "af2ef1bd2c7da692b57e55b0cdfd874f",
    larghezza: 201,
    altezza: 248,
    approvato: "18/10/2026",
    squadra: "rimini",
  },
};

/**
 * Logo del Channel (slug di CHANNEL_HOME); null = nessun logo approvato (es. Junior Gambettola).
 * I loghi `fuoriElenco` non escono da qui: non hanno un Channel nell'elenco dei 28.
 */
export const logoChannel = (slug: string): string | null => {
  const l = LOGHI_CHANNEL[slug];
  return l && !l.fuoriElenco && !l.inPreparazione ? (l.dmTv?.src ?? l.tbh?.src ?? l.src) : null;
};

/**
 * Logo da mostrare per il CHANNEL (anche fuori elenco / in preparazione): la versione DM TV
 * quando esiste, altrimenti il logo registrato. Stemmi società e logo DM aziendale non passano da qui.
 */
export const logoDelChannel = (slug: string): LogoChannel | undefined => {
  const l = LOGHI_CHANNEL[slug];
  const v = l?.dmTv ?? l?.tbh;
  return l && v ? { ...l, ...v } : l;
};

/** Solo il percorso del logo del Channel (versione DM TV se esiste). */
export const srcLogoChannel = (slug: string): string => logoDelChannel(slug)!.src;

/** Logo dello stesso Channel cercato con lo slug della società (sport.ts / catalog.ts). */
export const logoSquadra = (squadra: string): string | null =>
  Object.values(LOGHI_CHANNEL).find((l) => l.squadra === squadra)?.src ?? null;

/** Dati completi del logo di un Channel dell'elenco (null se manca o è fuori elenco). */
export const datiLogoChannel = (slug: string): LogoChannel | null => {
  const l = logoDelChannel(slug);
  return l && !l.fuoriElenco && !l.inPreparazione ? l : null;
};

/** Logo DM Comunicazioni (media partner esterno). */
export const LOGO_DM = LOGHI_CHANNEL.dm!.src;

/* ────────────────────────────────────────────────────────────────────────────
   04/11/2026 (round 18) — TUTTE le immagini consegnate per un Channel, per la galleria «Immagini ufficiali»
   della scheda /channel/scheda/<slug>. Prima la scheda mostrava UN solo logo: le altre immagini consegnate
   (card precedente, banner HR, stemma della squadra, logo «Produzioni interne», logo musicale) erano nel sito
   ma non nella scheda. Nessun file nuovo, nessun ritaglio: solo i file già registrati, interi.
   ──────────────────────────────────────────────────────────────────────────── */

export type ImmagineChannel = { src: string; originale: string | null; titolo: string; larghezza: number | null; altezza: number | null; approvato: string | null };

/** Immagini consegnate fuori da LOGHI_CHANNEL (stesse cartelle, file già pubblicati). */
const IMMAGINI_AGGIUNTIVE: Record<string, ImmagineChannel[]> = {
  "touch-music-records": [
    { src: "/musica/records/touch-music-records-channel.jpe", originale: null, titolo: "Logo Touch Music Records Channel · Produzioni interne", larghezza: 1600, altezza: 900, approvato: "04/11/2026" },
    { src: "/musica/records/touch-music-records.jpe", originale: null, titolo: "Logo Touch Music Records (fondo chiaro, come consegnato)", larghezza: 1600, altezza: 819, approvato: "04/11/2026" },
  ],
  "touch-music-channel": [
    { src: "/channel/loghi/tematici/touch-music.jpe", originale: "/channel/loghi/originali/tematici/touch-music.apng", titolo: "Logo musicale Touch Music Channel", larghezza: 1774, altezza: 887, approvato: "28/10/2026" },
  ],
};

export function immaginiDelChannel(slug: string): ImmagineChannel[] {
  const l = LOGHI_CHANNEL[slug];
  const out: ImmagineChannel[] = [];
  const da = (v: { src: string; originale?: string; larghezza: number; altezza: number; approvato: string }, titolo: string) => {
    if (!out.some((x) => x.src === v.src)) out.push({ src: v.src, originale: v.originale ?? null, titolo, larghezza: v.larghezza, altezza: v.altezza, approvato: v.approvato });
  };
  if (l) {
    if (l.dmTv) da(l.dmTv, "Logo del Channel · versione DM TV");
    if (l.tbh) da(l.tbh, "Logo del Channel · versione Touch Business Holding");
    da(l, l.dmTv ? (l.squadra ? "Stemma della società" : "Logo registrato") : l.tbh ? "Immagine consegnata in precedenza" : "Logo del Channel");
  }
  for (const x of IMMAGINI_AGGIUNTIVE[slug] ?? []) if (!out.some((y) => y.src === x.src)) out.push(x);
  return out;
}
