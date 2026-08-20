import { z } from "zod";

/**
 * Property row as returned by Supabase REST (database column names).
 * Parsed at the repository boundary so the rest of the app can trust the
 * shape instead of trusting the network.
 */
export const PropertySchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  property_type: z.string(),
  bedroom_quantity: z.number().int(),
  bathroom_quantity: z.number().int(),
  guest_capacity: z.number().int(),

  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),

  wifi_network: z.string().nullable(),
  wifi_password: z.string().nullable(),
  is_self_checkin: z.boolean(),
  property_access_type: z.string().nullable(),
  property_access_instructions: z.string().nullable(),
  property_password: z.string().nullable(),
  has_parking_spot: z.boolean(),
  parking_spot_identifier: z.string().nullable(),
  parking_spot_instructions: z.string().nullable(),

  check_in_time: z.string(), // "15:00:00"
  check_out_time: z.string(),
  allow_pet: z.boolean(),
  smoking_permitted: z.boolean(),
  suitable_for_children: z.boolean(),
  suitable_for_babies: z.boolean(),
  events_permitted: z.boolean(),

  amenities: z.record(z.string(), z.boolean()),
  images: z.array(z.string()),

  host_name: z.string(),
  host_phone: z.string(),
});

export type Property = z.infer<typeof PropertySchema>;

/**
 * What a listing needs from a property, nothing more: the index on `/` shows
 * one card per unit and links to the full guide. `images` collapses to the
 * single cover photo here — the slideshow belongs to the guide page.
 */
export const PropertySummarySchema = PropertySchema.pick({
  code: true,
  name: true,
  property_type: true,
  city: true,
  state: true,
  bedroom_quantity: true,
  bathroom_quantity: true,
  guest_capacity: true,
  images: true,
}).transform(({ images, ...rest }) => ({
  ...rest,
  image: images.at(0) ?? null,
}));

export type PropertySummary = z.infer<typeof PropertySummarySchema>;
