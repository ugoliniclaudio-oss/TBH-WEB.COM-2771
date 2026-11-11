CREATE UNIQUE INDEX `edicola_contenuti_slug_unique` ON `edicola_contenuti` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `edicola_contenuti_dedup_key_unique` ON `edicola_contenuti` (`dedup_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `edicola_fonti_slug_unique` ON `edicola_fonti` (`slug`);