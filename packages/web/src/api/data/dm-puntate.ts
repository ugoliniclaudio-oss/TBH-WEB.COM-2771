/**
 * ARCHIVIO PUNTATE DM — edizione 2026-2027 (da agosto 2026 a oggi).
 *
 * Fonte unica: scheda «Live» del canale ufficiale YouTube «Daniele Manuelli -DM Comunicazione-»
 * (https://www.youtube.com/@DanieleManuelli1981/streams), letta il 16/10/2026 e il 17/10/2026. Tutte le voci
 * sono dirette concluse (was_live). Titoli e durate copiati ALLA LETTERA dal canale; le copie
 * verticali «📱» dello stesso programma non sono ripetute.
 *
 * `pubblicata` è valorizzata SOLO dove il feed RSS ufficiale del canale riporta l'istante
 * esatto; per le altre puntate la data resta null (nessuna data stimata o inventata).
 *
 * Regola di messa in onda (16/10/2026): all'orario ufficiale del palinsesto il programma è
 * SOLO in DIRETTA; in tutti gli altri orari DM Channel trasmette le REPLICHE di queste puntate.
 */

export type PuntataArchivioDm = {
  videoId: string;
  /** Titolo esatto del canale YouTube. */
  titolo: string;
  /** Numero della puntata nell'edizione 26-27; null per gli speciali. */
  numero: number | null;
  durataSec: number;
  /** ISO dal feed RSS ufficiale, altrimenti null. */
  pubblicata: string | null;
};

/** Puntate per programma (chiave = slug di PROGRAMMI_DM), dalla più recente. */
export const PUNTATE_DM: Record<string, PuntataArchivioDm[]> = {
  "calcio-di-rigore": [
    { videoId: "3z2ahIdF60s", titolo: "Calcio di Rigore 7a puntata -edizione 26-27", numero: 7, durataSec: 8865, pubblicata: "2026-10-12T20:20:23Z" },
    { videoId: "dEHSGgGt3EY", titolo: "Calcio di Rigore 6a puntata - edizione 26-27-", numero: 6, durataSec: 8854, pubblicata: null },
    { videoId: "UMZ9IjPFybo", titolo: "Calcio di Rigore 5a puntata -edizione 2026-2027-", numero: 5, durataSec: 8483, pubblicata: null },
    { videoId: "uxPJLHp2Zlc", titolo: "Calcio di Rigore 4a puntata -edizione 2026-2027-", numero: 4, durataSec: 8621, pubblicata: null },
    { videoId: "JUafSBbcYBA", titolo: "Calcio di Rigore  3a puntata -edizione 2026-27-", numero: 3, durataSec: 8765, pubblicata: null },
    { videoId: "axbvauv456w", titolo: "Calcio di Rigore 2a puntata -edizione 2026-27-", numero: 2, durataSec: 7518, pubblicata: null },
    { videoId: "up1qNVL45gw", titolo: "Calcio di Rigore 1a puntata - edizione 2026-27-", numero: 1, durataSec: 7415, pubblicata: null },
    { videoId: "4LOmbR9JrOc", titolo: "Calcio di Rigore. Speciale Campionati", numero: null, durataSec: 5876, pubblicata: null },
    {
      videoId: "OMwEgvj5ep8",
      titolo: "Calcio di Rigore. Puntata dedicata alle iscrizioni dei campionati dilettantistici",
      numero: null,
      durataSec: 3219,
      pubblicata: null,
    },
  ],
  "tg-sport": [
    { videoId: "zxjtDgjPKlk", titolo: "TgSport 6a puntata -edizione 26-27-", numero: 6, durataSec: 2605, pubblicata: "2026-10-14T06:05:44Z" },
    { videoId: "_fDAfm94wDk", titolo: "TgSport 5a puntata -edizione 2026-2027-", numero: 5, durataSec: 3044, pubblicata: null },
    { videoId: "6opVD08Z6go", titolo: "TgSport 4a puntata edizione 2026-2027", numero: 4, durataSec: 2828, pubblicata: null },
    { videoId: "GvdH8HHPVdQ", titolo: "TgSport 3a puntata -edizione 202627-", numero: 3, durataSec: 2587, pubblicata: null },
    { videoId: "OC3T0DLvT4o", titolo: "TgSport 2a puntata -edizione 2026-2027-", numero: 2, durataSec: 3082, pubblicata: null },
    { videoId: "fmNhLe7Xt-M", titolo: "TgSport 1a  puntata", numero: 1, durataSec: 3039, pubblicata: null },
  ],
  "il-calcio-di-tutti": [
    { videoId: "zYiThU_s3TE", titolo: "il calcio D tutti 7a puntata -edizione 26-27-", numero: 7, durataSec: 5823, pubblicata: "2026-10-14T07:41:53Z" },
    { videoId: "pWSH1doTV_w", titolo: "Il calcio D tutti 6a puntata -edizione 26-27-", numero: 6, durataSec: 5523, pubblicata: "2026-10-07T07:37:01Z" },
    { videoId: "E42SxxugMQ0", titolo: "il calcio D tutti 5a puntata -edizione 26-27-", numero: 5, durataSec: 5418, pubblicata: null },
    { videoId: "HrJFCpFpTks", titolo: "il calcio D tutti 4a puntata -edizione 2026-27-", numero: 4, durataSec: 5737, pubblicata: null },
    { videoId: "kjk5vz78CwA", titolo: "Il calcio D tutti 3a puntata -edizione 2026-27-", numero: 3, durataSec: 6050, pubblicata: null },
    { videoId: "eWee8EvSY3A", titolo: "il Calcio D tutti 2a puntata -edizione 26-27-", numero: 2, durataSec: 5563, pubblicata: null },
    /* 1ª puntata: è il link ufficiale fornito da Claudio a settembre. */
    { videoId: "Ft9hDwhjQUo", titolo: "il calcio D tutti 1a puntata - edizione 2026-2027-", numero: 1, durataSec: 5871, pubblicata: null },
  ],
  "anteprima-sport": [
    /* aggiunta il 17/10/2026: in onda venerdì 16/10, nel feed RSS ufficiale */
    { videoId: "sU-o9NBTvjk", titolo: "Anteprima SportUp 7a puntata - edizione26-27-", numero: 7, durataSec: 2612, pubblicata: "2026-10-17T06:38:29Z" },
    { videoId: "vMvxiZPuFPY", titolo: "Anteprima SportUp 6a puntata -edizione 26-27-", numero: 6, durataSec: 2292, pubblicata: "2026-10-10T06:31:46Z" },
    { videoId: "-nFKdK0AQwg", titolo: "Anteprima SportUp 5a puntata  -edizione 26-27-", numero: 5, durataSec: 2951, pubblicata: null },
    { videoId: "KwTzi5z7FWw", titolo: "Anteprima SportUp 4a puntata -edizione 2026-2027-", numero: 4, durataSec: 2660, pubblicata: null },
    { videoId: "V-BvVFG5-9w", titolo: "AnteprimaSport 3a puntata", numero: 3, durataSec: 2275, pubblicata: null },
    { videoId: "c050b9Rm45A", titolo: "Anteprima SportUp 2a puntata -edizione 26-27-", numero: 2, durataSec: 2662, pubblicata: null },
    { videoId: "gfRn5ywv9bo", titolo: "Anteprima SportUp 1a puntata edizione 26-27", numero: 1, durataSec: 2807, pubblicata: null },
  ],
};

/** Altre dirette DM dello stesso periodo, fuori dai quattro programmi. */
export const ALTRE_DIRETTE_DM: PuntataArchivioDm[] = [
  { videoId: "SG3ZhFnVKxk", titolo: "LIVE AMICHEVOLE VERUCCHIO VS Rimini", numero: null, durataSec: 6531, pubblicata: null },
];

export function durataTesto(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h ? `${h}h ` : ""}${m}m ${s}s`;
}

/** Ultima puntata pubblicata del programma, nel formato PuntataDM di tbh.ts. */
export function ultimaPuntataDa(slug: string, nome: string) {
  const p = PUNTATE_DM[slug]?.[0];
  if (!p) return null;
  return {
    titolo: p.numero ? `${nome} – ${p.numero}ª puntata` : p.titolo,
    edizione: "2026–2027",
    durata: durataTesto(p.durataSec),
    canale: "Daniele Manuelli – DM Comunicazione",
    video: `https://www.youtube.com/watch?v=${p.videoId}`,
    videoId: p.videoId,
  };
}
