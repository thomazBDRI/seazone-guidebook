/*
    Hand-ordered: drizzle-kit emitted the composite PK before the column it
    references and left the old constraint drop commented out (it cannot read
    the primary key name), which would fail on the way in. The column is added
    first with its default, so the guides already persisted keep their content
    and become the pt-BR row of their property.
*/

ALTER TABLE "experience_guides" ADD COLUMN "locale" text DEFAULT 'pt-BR' NOT NULL;--> statement-breakpoint
ALTER TABLE "experience_guides" DROP CONSTRAINT "experience_guides_pkey";--> statement-breakpoint
ALTER TABLE "experience_guides" ADD CONSTRAINT "experience_guides_property_id_locale_pk" PRIMARY KEY("property_id","locale");
