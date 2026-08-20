import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_LABELS,
  LOCALES,
  parseLocale,
} from "@/lib/i18n/locales";

describe("parseLocale", () => {
  it("accepts every supported locale", () => {
    for (const locale of LOCALES) {
      expect(parseLocale(locale)).toBe(locale);
    }
  });

  it("falls back to pt-BR for anything else", () => {
    // a missing cookie, a stale value, a hand-edited one, a case mismatch
    for (const value of [undefined, null, "", "de", "pt", "PT-BR", "en-US"]) {
      expect(parseLocale(value)).toBe(DEFAULT_LOCALE);
    }
  });
});

describe("isLocale", () => {
  it("narrows only exact matches", () => {
    expect(isLocale("es")).toBe(true);
    expect(isLocale("es-AR")).toBe(false);
    expect(isLocale(42)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("LOCALE_LABELS", () => {
  it("names every locale in its own language", () => {
    expect(LOCALES.map((locale) => LOCALE_LABELS[locale].short)).toEqual([
      "PT",
      "EN",
      "ES",
    ]);
    expect(LOCALE_LABELS.es.name).toBe("Español");
  });
});
