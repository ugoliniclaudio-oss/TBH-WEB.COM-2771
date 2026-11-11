CREATE TABLE `schede` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chiave` text NOT NULL,
	`sezione` text NOT NULL,
	`slug` text NOT NULL,
	`titolo` text NOT NULL,
	`sottotitolo` text,
	`descrizione` text,
	`testo` text,
	`data` text,
	`categoria` text,
	`contatti` text,
	`telefono` text,
	`email` text,
	`luogo` text,
	`indirizzo` text,
	`maps_url` text,
	`link_url` text,
	`pulsanti` text,
	`campi` text,
	`stato` text DEFAULT 'bozza' NOT NULL,
	`riservato` integer DEFAULT 0 NOT NULL,
	`nota_interna` text,
	`ordine` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `schede_chiave_unique` ON `schede` (`chiave`);