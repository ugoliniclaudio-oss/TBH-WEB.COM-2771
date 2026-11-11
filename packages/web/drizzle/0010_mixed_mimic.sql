CREATE TABLE `casting_candidature` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`casting_id` integer NOT NULL,
	`ruolo` text NOT NULL,
	`categoria` text,
	`nome` text NOT NULL,
	`cognome` text NOT NULL,
	`data_nascita` text,
	`citta` text,
	`telefono` text,
	`email` text,
	`esperienze` text,
	`presentazione` text,
	`social` text,
	`allegati` text DEFAULT '[]' NOT NULL,
	`link_showreel` text,
	`consensi` text DEFAULT '{}' NOT NULL,
	`stato` text DEFAULT 'ricevuta' NOT NULL,
	`note_interne` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `castings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`brano_id` text,
	`ambito` text DEFAULT 'videoclip' NOT NULL,
	`titolo` text NOT NULL,
	`titolo_progetto` text,
	`descrizione` text,
	`requisiti` text,
	`location` text,
	`periodo` text,
	`scadenza` text,
	`produzione` text,
	`compenso` text,
	`stato` text DEFAULT 'aperto' NOT NULL,
	`locandina` text,
	`ruoli` text DEFAULT '[]' NOT NULL,
	`nota` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `castings_slug_unique` ON `castings` (`slug`);--> statement-breakpoint
ALTER TABLE `brani_video` ADD `anno` text;