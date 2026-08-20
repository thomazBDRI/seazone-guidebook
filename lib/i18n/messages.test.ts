import { describe, expect, it } from "vitest";
import { getMessages } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n/locales";

/**
 * Completeness is a compile-time property (en.ts and es.ts are typed against
 * the pt-BR catalog), so these tests cover what the type cannot: that no entry
 * was left as a copy of the reference language, and that the parameterized
 * ones actually interpolate.
 */

type Path = string;

/** Every leaf of a catalog, as "a.b.c" → "string" | "function". */
function shape(value: unknown, prefix = ""): Map<Path, string> {
  const leaves = new Map<Path, string>();
  if (typeof value !== "object" || value === null) {
    leaves.set(prefix, typeof value);
    return leaves;
  }
  for (const [key, child] of Object.entries(value)) {
    for (const [path, kind] of shape(
      child,
      prefix ? `${prefix}.${key}` : key,
    )) {
      leaves.set(path, kind);
    }
  }
  return leaves;
}

describe("message catalogs", () => {
  const reference = shape(getMessages("pt-BR"));

  it("has the same leaves, of the same kind, in every locale", () => {
    for (const locale of LOCALES) {
      expect([...shape(getMessages(locale))].sort()).toEqual(
        [...reference].sort(),
      );
    }
  });

  it("translates the guest-facing copy, not just the keys", () => {
    const en = getMessages("en");
    expect(en.hero.askAi).toBe("Ask the AI assistant");
    expect(en.arrival.wifi.qrCaption).toContain("connect automatically");
    expect(en.rules.duringStay).toBe("During your stay");
    expect(en.toc.sections.experiencias).toBe("Explore the area");
    expect(en.experience.failure.retry).toBe("Try again");

    const es = getMessages("es");
    expect(es.hero.askAi).toBe("Pregunta a la IA");
    expect(es.host.title).toBe("Habla con tu anfitrión");
    expect(es.amenities.title).toBe("Capacidad y comodidades");
    expect(es.notFound.badge).toBe("ALOJAMIENTO NO ENCONTRADO");
  });

  it("gives the amenities and services sections labels of their own", () => {
    // es once translated "comodidades" as "Servicios", colliding with the
    // section that now owns that word
    for (const locale of LOCALES) {
      const { sections } = getMessages(locale).toc;
      expect(sections.servicos).not.toBe(sections.comodidades);
    }
  });

  it("pitches the next booking in every locale", () => {
    for (const locale of LOCALES) {
      const { directBooking } = getMessages(locale).services;
      // the closing card is always rendered, so a locale without its own copy
      // would sell the next stay in Portuguese
      expect(directBooking.cta).toContain("Seazone");
      expect(directBooking.body.length).toBeGreaterThan(20);
    }
    expect(getMessages("en").services.directBooking.title).toBe(
      "Already thinking about the next trip?",
    );
  });

  it("interpolates and pluralizes per language", () => {
    expect(getMessages("pt-BR").experience.suggestions(1)).toBe("1 sugestão");
    expect(getMessages("pt-BR").experience.suggestions(4)).toBe("4 sugestões");
    expect(getMessages("en").experience.suggestions(1)).toBe("1 suggestion");
    expect(getMessages("en").amenities.bedrooms(2)).toBe("bedrooms");
    expect(getMessages("es").amenities.bathrooms(1)).toBe("baño");
    expect(getMessages("en").hero.propertyBadge("FLN001")).toBe(
      "PROPERTY FLN001",
    );
    expect(getMessages("es").experience.title("Planalto", "Gramado")).toBe(
      "Explora Planalto y Gramado",
    );
  });

  it("offers the same number of chat suggestions everywhere", () => {
    for (const locale of LOCALES) {
      expect(getMessages(locale).chat.suggestions).toHaveLength(4);
    }
  });
});
