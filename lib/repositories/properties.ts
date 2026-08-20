import "server-only";

import { z } from "zod";
import {
  type Property,
  PropertySchema,
  type PropertySummary,
  PropertySummarySchema,
} from "@/lib/domain/property";
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
