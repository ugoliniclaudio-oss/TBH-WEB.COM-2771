CREATE TABLE IF NOT EXISTS `adv_addon` (
	`codice` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`descrizione` text,
	`prezzo_cents` integer NOT NULL,
	`attivo` integer DEFAULT 1 NOT NULL,
	`stripe_product_id` text,
	`stripe_price_id` text,
	`aggiornato_il` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `adv_eventi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pratica_id` integer NOT NULL,
	`stato` text NOT NULL,
	`nota` text,
	`origine` text DEFAULT 'sistema' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `adv_fidelity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codice_tbh` text,
	`email` text,
	`codice_fiscale` text,
	`partita_iva` text,
	`intestatario` text NOT NULL,
	`livello` text,
	`cashback` integer DEFAULT 1 NOT NULL,
	`attivo` integer DEFAULT 1 NOT NULL,
	`scadenza` text,
	`note` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `adv_listino` (
	`slug` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`titolo` text,
	`descrizione` text,
	`immagine_url` text,
	`pieno_cents` integer NOT NULL,
	`promo_cents` integer,
	`promo_dal` text,
	`promo_al` text,
	`fidelity_cents` integer,
	`iva_aliquota` integer DEFAULT 22 NOT NULL,
	`disponibile` integer DEFAULT 1 NOT NULL,
	`cashback_percento` integer DEFAULT 100 NOT NULL,
	`stripe_product_id` text,
	`stripe_price_pieno` text,
	`stripe_price_promo` text,
	`stripe_price_fidelity` text,
	`aggiornato_il` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `adv_pratiche` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numero_ordine` text NOT NULL,
	`protocollo` text NOT NULL,
	`pacchetto_slug` text NOT NULL,
	`pacchetto_titolo` text NOT NULL,
	`sku` text NOT NULL,
	`fascia` text NOT NULL,
	`netto_cents` integer NOT NULL,
	`iva_cents` integer NOT NULL,
	`lordo_cents` integer NOT NULL,
	`iva_aliquota` integer DEFAULT 22 NOT NULL,
	`addon_json` text,
	`configurazione_json` text,
	`materiali` text,
	`durata_spot` integer,
	`stato` text DEFAULT 'in-attesa-pagamento' NOT NULL,
	`cliente_nome` text NOT NULL,
	`cliente_email` text NOT NULL,
	`cliente_telefono` text,
	`cliente_riferimento_fiscale` text,
	`fidelity_verificata` integer DEFAULT 0 NOT NULL,
	`fidelity_id` integer,
	`fidelity_riferimento` text,
	`cashback_cents` integer DEFAULT 0 NOT NULL,
	`cashback_stato` text DEFAULT 'non-eleggibile' NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent` text,
	`pagato_il` integer,
	`report_json` text,
	`report_url` text,
	`note_interne` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `apparizioni` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`giocatore` text NOT NULL,
	`caccia_id` integer NOT NULL,
	`pagina` text NOT NULL,
	`giorno` text NOT NULL,
	`cliccata` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cacce` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`attiva` integer DEFAULT 1 NOT NULL,
	`dal` text,
	`al` text,
	`ora_da` integer,
	`ora_a` integer,
	`probabilita` integer DEFAULT 35 NOT NULL,
	`max_al_giorno` integer DEFAULT 3 NOT NULL,
	`sponsor` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `contenuti` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titolo` text NOT NULL,
	`slug` text NOT NULL,
	`tipo` text DEFAULT 'altro' NOT NULL,
	`canale` text,
	`categoria` text,
	`url_pagina` text,
	`sito_url` text,
	`logo_url` text,
	`immagine_url` text,
	`video_url` text,
	`documento_url` text,
	`documento_nome` text,
	`pulsanti` text,
	`testo_breve` text,
	`note` text,
	`appartenenza` text,
	`stato` text DEFAULT 'bozza' NOT NULL,
	`sorgente` text DEFAULT 'pannello' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slot` text NOT NULL,
	`tipo` text DEFAULT 'immagine' NOT NULL,
	`chiave` text NOT NULL,
	`titolo` text,
	`indirizzo` text,
	`maps_url` text,
	`link_url` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `monitor_campagne` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stato` text DEFAULT 'pubblicita_temporanea' NOT NULL,
	`categoria` text,
	`canale` integer,
	`etichetta` text DEFAULT 'SPAZIO PUBBLICITARIO' NOT NULL,
	`titolo` text NOT NULL,
	`descrizione` text,
	`sponsor` text,
	`logo_url` text,
	`contenuto_url` text,
	`tipo_contenuto` text DEFAULT 'nessuno' NOT NULL,
	`immagine_url` text,
	`video_url` text,
	`pulsante_url` text,
	`link_interno` text,
	`link_esterno` text,
	`pulsante` text,
	`temi` text,
	`spazi` text,
	`dispositivo` text DEFAULT 'tutti' NOT NULL,
	`priorita` integer DEFAULT 50 NOT NULL,
	`durata_sec` integer DEFAULT 14 NOT NULL,
	`loop` integer DEFAULT 1 NOT NULL,
	`rotazione` text DEFAULT 'ordine' NOT NULL,
	`frequenza_max` integer DEFAULT 0 NOT NULL,
	`dal` text,
	`al` text,
	`colore` text,
	`ordine` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `monitor_eventi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`campagna_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`spazio` text,
	`dispositivo` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_slug` text NOT NULL,
	`product_title` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`stripe_session_id` text,
	`customer_email` text,
	`codice` text,
	`variante` text,
	`personalizzazione` text,
	`prodotto_id` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `posizioni` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`caccia_id` integer NOT NULL,
	`pagina` text NOT NULL,
	`etichetta` text NOT NULL,
	`peso` integer DEFAULT 1 NOT NULL,
	`attiva` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `premi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`caccia_id` integer NOT NULL,
	`neurone` text DEFAULT 'comune' NOT NULL,
	`titolo` text NOT NULL,
	`descrizione` text,
	`disponibili` integer DEFAULT 0 NOT NULL,
	`assegnati` integer DEFAULT 0 NOT NULL,
	`azione` text,
	`link_url` text,
	`attivita` text,
	`attivo` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `prodotti` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`nome` text NOT NULL,
	`codice` text,
	`categoria` text,
	`stato` text DEFAULT 'bozza' NOT NULL,
	`logo_url` text,
	`descrizione` text,
	`galleria_url` text,
	`prezzo_cents` integer,
	`prezzo_promo_cents` integer,
	`prezzo_fidelity_cents` integer,
	`disponibilita` text DEFAULT 'in_allestimento' NOT NULL,
	`tempi_consegna` text,
	`personalizzabile` integer DEFAULT 0 NOT NULL,
	`etichetta_personalizzazione` text,
	`carica_logo_cliente` integer DEFAULT 0 NOT NULL,
	`stripe_link` text,
	`stripe_price_id` text,
	`whatsapp_numero` text,
	`quantita_min` integer DEFAULT 1 NOT NULL,
	`quantita_max` integer DEFAULT 20 NOT NULL,
	`dal` text,
	`al` text,
	`ordine` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `prodotto_eventi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prodotto_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`variante_id` integer,
	`dispositivo` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `prodotto_varianti` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prodotto_id` integer NOT NULL,
	`colore` text,
	`taglia` text,
	`codice` text,
	`prezzo_cents` integer,
	`prezzo_promo_cents` integer,
	`prezzo_fidelity_cents` integer,
	`stripe_link` text,
	`stripe_price_id` text,
	`immagine_url` text,
	`disponibilita` text DEFAULT 'in_allestimento' NOT NULL,
	`ordine` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `ritrovamenti` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`giocatore` text NOT NULL,
	`caccia_id` integer NOT NULL,
	`premio_id` integer,
	`neurone` text NOT NULL,
	`titolo` text NOT NULL,
	`pagina` text NOT NULL,
	`giorno` text NOT NULL,
	`usato` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
