import "server-only";

import { cookies } from "next/headers";
import { type Locale, parseLocale } from "@/lib/i18n/locales";

/**
 * Locale source of truth: a first-party cookie, written by the language
 * switcher (POST /api/locale). There is no locale in the URL — a guest gets a
 * single link (/FLN001) and switching language must not change it.
 */
export const LOCALE_COOKIE = "locale";

/** One year: the guest keeps the language they picked for the whole stay. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(LOCALE_COOKIE)?.value);
}
