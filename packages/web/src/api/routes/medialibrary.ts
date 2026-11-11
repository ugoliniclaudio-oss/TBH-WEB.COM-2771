import { os } from "@orpc/server";
import {
  CATEGORIE_MEDIA,
  MEDIA_RECORDS,
  MEDIA_DA_RICEVERE,
  MEDIA_NOTA,
  TRACCIATO_IMPORT,
  FILE_IMPORT,
} from "../data/medialibrary";
import { TBH_CONTACTS } from "../data/catalog";

const base = os;

/** MEDIA LIBRARY TBH — archivio loghi/immagini/collegamenti e tracciato di importazione massiva. */
export const medialibrary = {
  libreria: base.handler(() => {
    const categorie = CATEGORIE_MEDIA.map((c) => ({
      ...c,
      records: MEDIA_RECORDS.filter((r) => r.categoria === c.slug),
    }));
    return {
      categorie,
      records: MEDIA_RECORDS,
      totale: MEDIA_RECORDS.length,
      verificati: MEDIA_RECORDS.filter((r) => r.stato === "verificato").length,
      daVerificare: MEDIA_RECORDS.filter((r) => r.stato !== "verificato").length,
      conLogo: MEDIA_RECORDS.filter((r) => r.logoUrl).length,
      tracciato: TRACCIATO_IMPORT,
      file: FILE_IMPORT,
      daRicevere: MEDIA_DA_RICEVERE,
      nota: MEDIA_NOTA,
      contatti: TBH_CONTACTS,
    };
  }),
};
