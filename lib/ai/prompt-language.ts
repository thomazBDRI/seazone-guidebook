import type { Locale } from "@/lib/i18n/locales";

/**
 * How the prompts name the language the model has to write in.
 *
 * The prompts themselves stay in Portuguese: they are internal instructions,
 * and keeping one authored version means one set of guardrails to review
 * instead of three drifting translations. Only the target language is
 * parameterized — that is what the guest actually sees.
 */
export const PROMPT_LANGUAGE: Record<Locale, string> = {
  "pt-BR": "português do Brasil",
  en: "inglês",
  es: "espanhol",
};
