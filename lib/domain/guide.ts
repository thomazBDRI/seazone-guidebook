import { z } from "zod";

export const GuideStatusSchema = z.enum(["pending", "ready", "failed"]);
export type GuideStatus = z.infer<typeof GuideStatusSchema>;

/**
 * Experience guide row (content is refined by the generation pipeline's
 * output schema in lib/ai; at the storage boundary it is opaque json).
 */
export const GuideRowSchema = z.object({
  property_id: z.uuid(),
  status: GuideStatusSchema,
  content: z.unknown().nullable(),
  model: z.string().nullable(),
  error: z.string().nullable(),
  generated_at: z.string().nullable(),
});

export type GuideRow = z.infer<typeof GuideRowSchema>;
