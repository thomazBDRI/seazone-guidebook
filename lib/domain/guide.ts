import { z } from "zod";

export const GuideStatusSchema = z.enum(["pending", "ready", "failed"]);
export type GuideStatus = z.infer<typeof GuideStatusSchema>;

/**
 * Experience guide row (content is refined by the generation pipeline's
 * output schema in lib/ai; at the storage boundary it is opaque json).
 */
export const GuideRowSchema = z.object({
  property_id: z.uuid(),
  locale: z.string(),
  status: GuideStatusSchema,
  content: z.unknown().nullable(),
  model: z.string().nullable(),
  error: z.string().nullable(),
  generated_at: z.string().nullable(),
});

export type GuideRow = z.infer<typeof GuideRowSchema>;

const PlaceSchema = z.object({
  name: z.string(),
  distance: z.string(),
  description: z.string(),
});

/** Guide payload the experiences section renders (parsed, never trusted). */
export const GuideContentSchema = z.object({
  welcome_message: z.string(),
  restaurants: z.array(PlaceSchema),
  attractions: z.array(PlaceSchema),
  essentials: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      distance: z.string(),
      description: z.string(),
    }),
  ),
  seasonal_tip: z.string(),
});

export type GuideContent = z.infer<typeof GuideContentSchema>;
export type GuidePlace = z.infer<typeof PlaceSchema>;
