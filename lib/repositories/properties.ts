import "server-only";

import { type Property, PropertySchema } from "@/lib/domain/property";
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
