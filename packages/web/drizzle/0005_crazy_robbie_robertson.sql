ALTER TABLE `media` ADD `chiave_originale` text;--> statement-breakpoint
ALTER TABLE `media` ADD `mime` text;--> statement-breakpoint
ALTER TABLE `media` ADD `peso` integer;--> statement-breakpoint
ALTER TABLE `media` ADD `larghezza` integer;--> statement-breakpoint
ALTER TABLE `media` ADD `altezza` integer;--> statement-breakpoint
ALTER TABLE `media` ADD `descrizione` text;--> statement-breakpoint
ALTER TABLE `media` ADD `tag` text;--> statement-breakpoint
ALTER TABLE `media` ADD `stato` text DEFAULT 'pubblicato' NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `ordine` integer DEFAULT 0 NOT NULL;