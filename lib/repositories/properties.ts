import "server-only";

import { z } from "zod";
import { type GuideRow, GuideRowSchema } from "@/lib/domain/guide";
import {
  type Property,
  PropertySchema,
  type PropertySummary,
  PropertySummarySchema,
} from "@/lib/domain/property";
import type { Locale } from "@/lib/i18n/locales";
import { supabase } from "@/lib/supabase/server";

/** Case-insensitive lookup by public code (/FLN001, /fln001). */
export async function getPropertyByCode(
  code: string,
): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (error) {
    throw new Error(`properties lookup failed: ${error.message}`);
  }
  return data ? PropertySchema.parse(data) : null;
}

/**
 * Property + its guide for one locale in a single round trip (PostgREST
 * resource embedding) — the guide page is fully dynamic, so every network
 * hop happens between click and first byte.
 */
export async function getPropertyWithGuideByCode(
  code: string,
  locale: Locale,
): Promise<{ property: Property; guide: GuideRow | null } | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "*, experience_guides(property_id, locale, status, content, model, error, generated_at)",
    )
    .ilike("code", code)
    .eq("experience_guides.locale", locale)
    .maybeSingle();

  if (error) {
    throw new Error(`property+guide lookup failed: ${error.message}`);
  }
  if (!data) return null;

  const { experience_guides, ...propertyRow } = data as {
    experience_guides: unknown[];
  } & Record<string, unknown>;
  const embedded = experience_guides?.[0];
  return {
    property: PropertySchema.parse(propertyRow),
    guide: embedded ? GuideRowSchema.parse(embedded) : null,
  };
}

/** Only the columns the index cards render — no guide data is touched. */
const SUMMARY_COLUMNS =
  "code, name, property_type, city, state, bedroom_quantity, bathroom_quantity, guest_capacity, images";

/**
 * Every property, ordered by code, for the reviewer index on `/`. A guest
 * never lists properties — they arrive on /CODE straight from the booking
 * confirmation.
 */
export async function listProperties(): Promise<PropertySummary[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(SUMMARY_COLUMNS)
    .order("code");

  if (error) {
    throw new Error(`properties listing failed: ${error.message}`);
  }
  return z.array(PropertySummarySchema).parse(data ?? []);
}
