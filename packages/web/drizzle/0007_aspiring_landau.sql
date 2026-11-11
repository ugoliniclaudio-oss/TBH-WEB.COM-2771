CREATE TABLE `pratiche_caricamento` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ambito` text NOT NULL,
	`token` text NOT NULL,
	`scadenza` integer NOT NULL,
	`chiusa` integer DEFAULT 0 NOT NULL,
	`riferimento` text,
	`slot_finale` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pratiche_caricamento_token_unique` ON `pratiche_caricamento` (`token`);--> statement-breakpoint
ALTER TABLE `media` ADD `riservato` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `miss_cool_candidature` ADD `pratica` text;