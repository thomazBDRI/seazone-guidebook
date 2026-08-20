CREATE TYPE "public"."guide_status" AS ENUM('pending', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "experience_guides" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"status" "guide_status" NOT NULL,
	"content" jsonb,
	"model" text,
	"error" text,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience_guides" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"property_type" text NOT NULL,
	"bedroom_quantity" integer NOT NULL,
	"bathroom_quantity" integer NOT NULL,
	"guest_capacity" integer NOT NULL,
	"street" text NOT NULL,
	"number" text NOT NULL,
	"complement" text,
	"neighborhood" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"wifi_network" text,
	"wifi_password" text,
	"is_self_checkin" boolean DEFAULT false NOT NULL,
	"property_access_type" text,
	"property_access_instructions" text,
	"property_password" text,
	"has_parking_spot" boolean DEFAULT false NOT NULL,
	"parking_spot_identifier" text,
	"parking_spot_instructions" text,
	"check_in_time" time NOT NULL,
	"check_out_time" time NOT NULL,
	"allow_pet" boolean NOT NULL,
	"smoking_permitted" boolean NOT NULL,
	"suitable_for_children" boolean NOT NULL,
	"suitable_for_babies" boolean NOT NULL,
	"events_permitted" boolean NOT NULL,
	"amenities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"host_name" text NOT NULL,
	"host_phone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "experience_guides" ADD CONSTRAINT "experience_guides_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;