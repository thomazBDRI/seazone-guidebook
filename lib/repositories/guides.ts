import "server-only";

import { type GuideRow, GuideRowSchema } from "@/lib/domain/guide";
import { supabase } from "@/lib/supabase/server";

const COLUMNS = "property_id, status, content, model, error, generated_at";

export async function getGuideByPropertyId(
  propertyId: string,
): Promise<GuideRow | null> {
  const { data, error } = await supabase
    .from("experience_guides")
    .select(COLUMNS)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) {
    throw new Error(`guide lookup failed: ${error.message}`);
  }
  return data ? GuideRowSchema.parse(data) : null;
}

/**
 * Generation lock: inserts the `pending` row; returns true only for the
 * caller that actually inserted it (concurrent callers get false and should
 * poll). Backed by the primary key on property_id.
 */
export async function tryAcquireGenerationLock(
  propertyId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("experience_guides")
    .upsert(
      { property_id: propertyId, status: "pending" },
      { onConflict: "property_id", ignoreDuplicates: true },
    )
    .select("property_id");

  if (error) {
    throw new Error(`guide lock failed: ${error.message}`);
  }
  return (data?.length ?? 0) > 0;
}

export async function markGuideReady(
  propertyId: string,
  content: unknown,
  model: string,
): Promise<void> {
  const { error } = await supabase
    .from("experience_guides")
    .update({
      status: "ready",
      content,
      model,
      error: null,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("property_id", propertyId);

  if (error) {
    throw new Error(`guide save failed: ${error.message}`);
  }
}

export async function markGuideFailed(
  propertyId: string,
  message: string,
): Promise<void> {
  const { error } = await supabase
    .from("experience_guides")
    .update({
      status: "failed",
      error: message,
      updated_at: new Date().toISOString(),
    })
    .eq("property_id", propertyId);

  if (error) {
    throw new Error(`guide fail-mark failed: ${error.message}`);
  }
}

/** Allows a retry after a failed generation (deletes only failed rows). */
export async function clearFailedGuide(propertyId: string): Promise<void> {
  const { error } = await supabase
    .from("experience_guides")
    .delete()
    .eq("property_id", propertyId)
    .eq("status", "failed");

  if (error) {
    throw new Error(`guide clear failed: ${error.message}`);
  }
}
