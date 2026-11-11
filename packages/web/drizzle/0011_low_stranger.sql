CREATE TABLE `brani_master` (
	`id` text PRIMARY KEY NOT NULL,
	`titolo` text DEFAULT '' NOT NULL,
	`chiave_titolo` text DEFAULT '' NOT NULL,
	`artista` text,
	`cover` text,
	`genere` text,
	`anno` text,
	`descrizione` text,
	`nota_interna` text,
	`stato` text DEFAULT 'da-verificare' NOT NULL,
	`tornata` text,
	`nascosto` integer DEFAULT false NOT NULL,
	`ordine` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brani_sorgenti` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brano_id` text NOT NULL,
	`tipo` text DEFAULT 'audio' NOT NULL,
	`piattaforma` text DEFAULT 'altro' NOT NULL,
	`url` text NOT NULL,
	`url_originale` text,
	`id_esterno` text,
	`versione` text,
	`cover` text,
	`principale` integer DEFAULT false NOT NULL,
	`nota` text,
	`ordine` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
