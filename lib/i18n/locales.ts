/**
 * Supported locales. pt-BR is the reference: its catalog defines the `Messages`
 * type every other locale has to satisfy, so a missing translation is a
 * compile error rather than a hole in the page.
 */
export const LOCALES = ["pt-BR", "en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";

/** Native names, deliberately not translated (a switcher reads best that way). */
export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  "pt-BR": { short: "PT", name: "Português" },
  en: { short: "EN", name: "English" },
  es: { short: "ES", name: "Español" },
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Anything unrecognized (missing cookie, stale value, hand-edited) → default. */
export function parseLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
