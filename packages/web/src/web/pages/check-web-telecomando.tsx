import { BandaAnteprimaTelecomando, TelecomandoCanali } from "../components/telecomando-pannello";
import { PalinsestoCanaliSquadra } from "../components/palinsesto-partite";

/** /check-web/telecomando — TELECOMANDO CANALI TBH, anteprima non pubblicata. */
export default function CheckWebTelecomandoPage() {
  return (
    <div>
      <BandaAnteprimaTelecomando />
      <TelecomandoCanali />
      {/* 17/10/2026: palinsesto partite dei canali squadra (Romagna Sport). */}
      <PalinsestoCanaliSquadra />
    </div>
  );
}
