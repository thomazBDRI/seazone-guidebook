import { describe, expect, it } from "vitest";
import {
  accessTypeDisplay,
  addressLine,
  amenityDisplay,
  amenityList,
  essentialTypeLabel,
  formatPhone,
  formatTime,
  hostInitials,
  locationLine,
  mapAddress,
  phoneDigits,
  ruleLines,
  serviceLines,
} from "@/lib/domain/display";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { fln001, grm001 } from "@/test/fixtures/property";

describe("formatTime", () => {
  it("trims postgres seconds", () => {
    expect(formatTime("15:00:00")).toBe("15:00");
    expect(formatTime("09:30:00")).toBe("09:30");
  });

  it("passes through unexpected values untouched", () => {
    expect(formatTime("tarde")).toBe("tarde");
  });
});

describe("ruleLines", () => {
  it("writes the FLN001 sentences (pets/smoking/events forbidden)", () => {
    const sentences = ruleLines(fln001, "pt-BR").map((r) => r.sentence);
    expect(sentences).toEqual([
      "Máximo de 4 hóspedes",
      "Não é permitido animais de estimação",
      "Proibido fumar no imóvel",
      "Crianças são bem-vindas",
      "Adequado para bebês",
      "Festas e eventos não são permitidos",
    ]);
  });

  it("flips sentences for GRM001 (pets ok, no babies)", () => {
    const byKey = Object.fromEntries(
      ruleLines(grm001, "pt-BR").map((r) => [r.key, r]),
    );
    expect(byKey.guests.sentence).toBe("Máximo de 6 hóspedes");
    expect(byKey.pets.sentence).toBe("Animais de estimação são bem-vindos");
    expect(byKey.pets.allowed).toBe(true);
    expect(byKey.babies.sentence).toBe("Não adequado para bebês");
    expect(byKey.babies.allowed).toBe(false);
  });

  it("marks forbidden plain icons for the slash, except cigarette-off", () => {
    const byKey = Object.fromEntries(
      ruleLines(fln001, "pt-BR").map((r) => [r.key, r]),
    );
    expect(byKey.pets.allowed).toBe(false);
    expect(byKey.events.allowed).toBe(false);
    // lucide's cigarette-off already draws its own slash
    expect(byKey.smoking.icon).toBe("cigarette-off");
    expect(byKey.smoking.allowed).toBe(true);
  });
});

describe("amenityDisplay", () => {
  it("translates known keys", () => {
    expect(amenityDisplay("air_conditioning", "pt-BR")).toEqual({
      icon: "snowflake",
      label: "Ar-condicionado",
    });
    expect(amenityDisplay("bbq_grill", "pt-BR").label).toBe("Churrasqueira");
  });

  it("humanizes unknown keys instead of breaking", () => {
    expect(amenityDisplay("heated_pool", "pt-BR")).toEqual({
      icon: "check",
      label: "Heated pool",
    });
  });
});

describe("amenityList", () => {
  it("keeps only truthy amenities", () => {
    const list = amenityList({ wifi: true, tv: false, kitchen: true }, "pt-BR");
    expect(list.map((a) => a.key)).toEqual(["wifi", "kitchen"]);
  });

  it("puts known amenities before unknown ones", () => {
    const list = amenityList({ zzz_custom: true, wifi: true }, "pt-BR");
    expect(list[0].key).toBe("wifi");
    expect(list[1].label).toBe("Zzz custom");
  });
});

describe("serviceLines", () => {
  const host = { hostName: "Ana Paula", checkIn: "15:00:00" };
  const lines = (
    services: Record<string, boolean | string>,
    locale = "pt-BR",
  ) => serviceLines(services, host, locale as Locale);

  it("writes the default sentence for a service flagged true", () => {
    expect(lines({ early_checkin: true })).toEqual([
      {
        key: "early_checkin",
        icon: "clock",
        sentence:
          "Quer entrar antes das 15:00? Fale com Ana Paula — sujeito à disponibilidade.",
        note: null,
      },
    ]);
  });

  it("keeps the sentence and carries the row's text as the note", () => {
    const [transfer] = lines({
      airport_transfer: "Buscamos no aeroporto de Navegantes",
    });
    expect(transfer.sentence).toBe(
      "Transfer do aeroporto: consulte Ana Paula sobre valores e horários.",
    );
    // host-authored text is data: shown exactly as it was written
    expect(transfer.note).toBe("Buscamos no aeroporto de Navegantes");
    expect(transfer.icon).toBe("plane");
  });

  it("covers every known key with its own icon", () => {
    const all = lines({
      early_checkin: true,
      late_checkout: true,
      extend_stay: true,
      midstay_cleaning: true,
      luggage_storage: true,
      airport_transfer: true,
    });

    expect(all.map((line) => line.icon)).toEqual([
      "clock",
      "log-out",
      "calendar-plus",
      "brush-cleaning",
      "luggage",
      "plane",
    ]);
    expect(all.map((line) => line.sentence)).toEqual([
      "Quer entrar antes das 15:00? Fale com Ana Paula — sujeito à disponibilidade.",
      "Precisa sair mais tarde? Combine com Ana Paula — sujeito à disponibilidade.",
      "Quer ficar mais dias? Fale com o time Seazone e ganhe desconto nas diárias adicionais.",
      "Limpeza extra durante a estadia? Peça a Ana Paula.",
      "Check-out cedo demais? Pergunte a Ana Paula sobre guarda de bagagem.",
      "Transfer do aeroporto: consulte Ana Paula sobre valores e horários.",
    ]);
  });

  it("humanizes a service the catalog does not know", () => {
    expect(
      lines({ pet_sitting: "Combinamos com a Bia, R$ 80 a diária" }),
    ).toEqual([
      {
        key: "pet_sitting",
        icon: "concierge-bell",
        sentence: "Pet sitting",
        note: "Combinamos com a Bia, R$ 80 a diária",
      },
    ]);
    expect(lines({ pet_sitting: true })[0].note).toBeNull();
  });

  it("drops services that are not offered", () => {
    expect(
      lines({ early_checkin: false, late_checkout: "", extend_stay: true }).map(
        (line) => line.key,
      ),
    ).toEqual(["extend_stay"]);
    expect(lines({})).toEqual([]);
  });

  it("orders known services first, whatever order the row spelled them", () => {
    const keys = lines({
      zzz_custom: true,
      airport_transfer: true,
      early_checkin: true,
    }).map((line) => line.key);
    expect(keys).toEqual(["early_checkin", "airport_transfer", "zzz_custom"]);
  });

  it("interpolates the check-in time already trimmed of its seconds", () => {
    expect(lines({ early_checkin: true })[0].sentence).toContain(
      "antes das 15:00",
    );
    expect(
      serviceLines(
        { early_checkin: true },
        { hostName: "Carlos", checkIn: "14:00" },
        "pt-BR",
      )[0].sentence,
    ).toContain("antes das 14:00");
  });

  it("translates the sentences while leaving the note as authored", () => {
    const english = lines(
      { early_checkin: true, airport_transfer: "Van até Jurerê" },
      "en",
    );
    expect(english[0].sentence).toBe(
      "Want to get in before 15:00? Ask Ana Paula — subject to availability.",
    );
    expect(english[1].note).toBe("Van até Jurerê");

    const spanish = lines({ late_checkout: true, extend_stay: true }, "es");
    expect(spanish[0].sentence).toBe(
      "¿Necesitas salir más tarde? Acuérdalo con Ana Paula — sujeto a disponibilidad.",
    );
    expect(spanish[1].sentence).toContain("descuento en las noches extra");
  });

  it("humanizes an unknown service the same way in every locale", () => {
    for (const locale of LOCALES) {
      expect(lines({ pet_sitting: true }, locale)[0]).toEqual({
        key: "pet_sitting",
        icon: "concierge-bell",
        sentence: "Pet sitting",
        note: null,
      });
    }
  });
});

describe("accessTypeDisplay", () => {
  it("translates known access types", () => {
    expect(accessTypeDisplay("smart_lock", "pt-BR").label).toBe(
      "Fechadura eletrônica",
    );
    expect(accessTypeDisplay("keybox", "pt-BR").label).toBe("Cofre de chaves");
  });

  it("falls back for unknown or missing types", () => {
    expect(accessTypeDisplay("retina_scanner", "pt-BR").label).toBe(
      "Retina scanner",
    );
    expect(accessTypeDisplay(null, "pt-BR").label).toBe("Acesso ao imóvel");
  });
});

describe("localized dictionaries", () => {
  it("writes the rule sentences in english and spanish", () => {
    const english = Object.fromEntries(
      ruleLines(fln001, "en").map((r) => [r.key, r.sentence]),
    );
    expect(english.guests).toBe("Up to 4 guests");
    expect(english.pets).toBe("Pets are not allowed");
    expect(english.smoking).toBe("No smoking indoors");
    expect(english.babies).toBe("Suitable for babies");

    const spanish = Object.fromEntries(
      ruleLines(grm001, "es").map((r) => [r.key, r.sentence]),
    );
    expect(spanish.guests).toBe("Máximo de 6 huéspedes");
    expect(spanish.pets).toBe("Se admiten mascotas");
    expect(spanish.babies).toBe("No apto para bebés");
  });

  it("keeps the icon while translating the label", () => {
    expect(amenityDisplay("air_conditioning", "en")).toEqual({
      icon: "snowflake",
      label: "Air conditioning",
    });
    expect(amenityDisplay("air_conditioning", "es").label).toBe(
      "Aire acondicionado",
    );
  });

  it("humanizes an unknown amenity in every locale, without inventing words", () => {
    for (const locale of LOCALES) {
      expect(amenityDisplay("heated_pool", locale)).toEqual({
        icon: "check",
        label: "Heated pool",
      });
    }
  });

  it("orders known amenities first whatever the locale", () => {
    const list = amenityList({ zzz_custom: true, wifi: true }, "es");
    expect(list.map((a) => a.key)).toEqual(["wifi", "zzz_custom"]);
    expect(list[0].label).toBe("Wifi");
  });

  it("translates access types and their fallback", () => {
    expect(accessTypeDisplay("smart_lock", "en").label).toBe("Smart lock");
    expect(accessTypeDisplay("keybox", "es").label).toBe("Caja de llaves");
    expect(accessTypeDisplay(null, "en").label).toBe("Property access");
  });

  it("translates the essentials type literals, accents and case aside", () => {
    expect(essentialTypeLabel("farmácia", "pt-BR")).toBe("Farmácia");
    expect(essentialTypeLabel("Farmácia", "en")).toBe("Pharmacy");
    expect(essentialTypeLabel("farmacia", "es")).toBe("Farmacia");
    expect(essentialTypeLabel("supermercado", "en")).toBe("Supermarket");
    // anything the model made up survives instead of disappearing
    expect(essentialTypeLabel("padaria", "en")).toBe("padaria");
  });
});

describe("addressLine", () => {
  it("includes the complement when present", () => {
    expect(addressLine(fln001)).toBe("Rua Lauro Linhares, 589 — Apto 301");
  });

  it("omits the complement when null", () => {
    expect(addressLine(grm001)).toBe("Rua das Hortênsias, 220");
  });
});

describe("locationLine", () => {
  it("joins neighborhood, city and state", () => {
    expect(locationLine(fln001)).toBe("Trindade, Florianópolis — SC");
  });
});

describe("mapAddress", () => {
  it("drops the complement so geocoders find the building", () => {
    expect(mapAddress(fln001)).toBe(
      "Rua Lauro Linhares, 589, Trindade, Florianópolis - SC",
    );
  });
});

describe("phoneDigits", () => {
  it("strips everything but digits", () => {
    expect(phoneDigits("+55 48 99123-4567")).toBe("5548991234567");
  });
});

describe("formatPhone", () => {
  it("formats mobile and landline numbers", () => {
    expect(formatPhone("+5548991234567")).toBe("+55 48 99123-4567");
    expect(formatPhone("+554832234567")).toBe("+55 48 3223-4567");
  });

  it("passes through unexpected shapes", () => {
    expect(formatPhone("ligue para a anfitriã")).toBe("ligue para a anfitriã");
  });
});

describe("hostInitials", () => {
  it("takes the first and last name initials", () => {
    expect(hostInitials("Ana Paula")).toBe("AP");
    expect(hostInitials("Carlos Eduardo Nunes")).toBe("CN");
  });

  it("handles a single name", () => {
    expect(hostInitials("Ana")).toBe("A");
  });
});
