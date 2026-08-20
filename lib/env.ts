import "server-only";

import { z } from "zod";

/**
 * Runtime environment contract, validated once at boot so a misconfigured
 * deploy fails fast instead of erroring on the first request.
 *
 * Everything here is server-side only — there are intentionally no
 * NEXT_PUBLIC_ variables in this app.
 */
const EnvSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
});

export const env = EnvSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
});
