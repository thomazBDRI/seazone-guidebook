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
  /** Swappable so a rate-limited free model can be replaced without a deploy. */
  OPENROUTER_GUIDE_MODEL: z
    .string()
    .min(1)
    .default("nvidia/nemotron-3-ultra-550b-a55b:free"),
  /**
   * Chat needs a different profile from guide generation: first token in under
   * a second and no reasoning preamble, since the guest watches it type. The
   * guide model composes long JSON and is far too slow here, hence a separate
   * default. An empty value in a .env file counts as unset.
   */
  OPENROUTER_CHAT_MODEL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).default("nvidia/nemotron-3-nano-30b-a3b:free"),
  ),
});

export const env = EnvSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_GUIDE_MODEL: process.env.OPENROUTER_GUIDE_MODEL,
  OPENROUTER_CHAT_MODEL: process.env.OPENROUTER_CHAT_MODEL,
});
