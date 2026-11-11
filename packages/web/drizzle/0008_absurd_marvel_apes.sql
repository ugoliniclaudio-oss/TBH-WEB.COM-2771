ALTER TABLE `media` ADD `adattamento` text DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `focus_x` integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `focus_y` integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `zoom` integer DEFAULT 100 NOT NULL;