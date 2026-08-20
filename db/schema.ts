import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Properties: one row per managed unit, addressed publicly by `code`
 * (/FLN001). Scalars are flattened into typed columns; open-ended boolean
 * sets (amenities) stay jsonb and are humanized by frontend dictionaries.
 *
 * RLS is enabled with no policies (deny-all) on purpose: the app reaches the
 * database exclusively through server-side code using the secret key.
 */
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
  propertyType: text("property_type").notNull(),
  bedroomQuantity: integer("bedroom_quantity").notNull(),
  bathroomQuantity: integer("bathroom_quantity").notNull(),
  guestCapacity: integer("guest_capacity").notNull(),

  // address (individual columns: displayed piecemeal and geocoded)
  street: text("street").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),

  // operational / access
  wifiNetwork: text("wifi_network"),
  wifiPassword: text("wifi_password"),
  isSelfCheckin: boolean("is_self_checkin").notNull().default(false),
  propertyAccessType: text("property_access_type"),
  propertyAccessInstructions: text("property_access_instructions"),
  propertyPassword: text("property_password"),
  hasParkingSpot: boolean("has_parking_spot").notNull().default(false),
  parkingSpotIdentifier: text("parking_spot_identifier"),
  parkingSpotInstructions: text("parking_spot_instructions"),

  // stay rules
  checkInTime: time("check_in_time").notNull(),
  checkOutTime: time("check_out_time").notNull(),
  allowPet: boolean("allow_pet").notNull(),
  smokingPermitted: boolean("smoking_permitted").notNull(),
  suitableForChildren: boolean("suitable_for_children").notNull(),
  suitableForBabies: boolean("suitable_for_babies").notNull(),
  eventsPermitted: boolean("events_permitted").notNull(),

  amenities: jsonb("amenities")
    .$type<Record<string, boolean>>()
    .notNull()
    .default({}),
  /**
   * Guest services the host offers on request (early check-in, late check-out,
   * transfer…). `true` takes the dictionary's default sentence; a string is a
   * host-authored note shown as-is, so an unusual arrangement needs no deploy.
   */
  services: jsonb("services")
    .$type<Record<string, boolean | string>>()
    .notNull()
    .default({}),
  images: text("images").array().notNull().default([]),

  hostName: text("host_name").notNull(),
  hostPhone: text("host_phone").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const guideStatus = pgEnum("guide_status", [
  "pending",
  "ready",
  "failed",
]);

/**
 * AI experiences guide: generated once per property and locale on first
 * access, then persisted. The composite primary key is what makes each
 * language a guide of its own while keeping "generate only once" true — the
 * `pending` row doubles as the generation lock (insert ... on conflict do
 * nothing — only the winner runs the pipeline).
 */
export const experienceGuides = pgTable(
  "experience_guides",
  {
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    /** One of lib/i18n LOCALES; rows written before i18n are pt-BR. */
    locale: text("locale").notNull().default("pt-BR"),
    status: guideStatus("status").notNull(),
    content: jsonb("content"),
    model: text("model"),
    error: text("error"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.propertyId, table.locale] })],
).enableRLS();
