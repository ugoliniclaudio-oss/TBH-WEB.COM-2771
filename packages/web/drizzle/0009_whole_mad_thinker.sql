CREATE TABLE `brani_video` (
	`brano_id` text PRIMARY KEY NOT NULL,
	`stato_video` text DEFAULT 'da-realizzare' NOT NULL,
	`stato_produzione` text,
	`video_url` text,
	`thumbnail_video` text,
	`anno_video_previsto` text,
	`genere` text,
	`nota` text,
	`updated_at` integer NOT NULL
);
