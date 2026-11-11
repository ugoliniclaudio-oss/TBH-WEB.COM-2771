import { like, eq } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../src/api/database";
import * as schema from "../src/api/database/schema";
import { s3, BUCKET } from "../src/api/lib/s3";
const righe = await db.select().from(schema.lavoroCandidature).where(eq(schema.lavoroCandidature.cognome, "VERIFICA"));
for (const r of righe) {
  const files = await db.select().from(schema.media).where(like(schema.media.slot, `lavoro:candidatura:${r.id}:%`));
  for (const f of files) { try { await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: f.chiave })); } catch {} await db.delete(schema.media).where(eq(schema.media.id, f.id)); }
  await db.delete(schema.lavoroCandidature).where(eq(schema.lavoroCandidature.id, r.id));
  console.log("rimossa", r.id, files.length, "file");
}
console.log("restanti", (await db.select().from(schema.lavoroCandidature)).length);
