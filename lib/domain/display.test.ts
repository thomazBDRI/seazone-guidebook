import { describe, expect, it } from "vitest";
import {
  accessTypeDisplay,
  addressLine,
  amenityDisplay,
  amenityList,
  formatPhone,
  formatTime,
  hostInitials,
  locationLine,
  mapAddress,
  phoneDigits,
  ruleLines,
} from "@/lib/domain/display";
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
    const sentences = ruleLines(fln001).map((r) => r.sentence);
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
    const byKey = Object.fromEntries(ruleLines(grm001).map((r) => [r.key, r]));
    expect(byKey.guests.sentence).toBe("Máximo de 6 hóspedes");
    expect(byKey.pets.sentence).toBe("Animais de estimação são bem-vindos");
    expect(byKey.pets.allowed).toBe(true);
    expect(byKey.babies.sentence).toBe("Não adequado para bebês");
    expect(byKey.babies.allowed).toBe(false);
  });

  it("marks forbidden plain icons for the slash, except cigarette-off", () => {
    const byKey = Object.fromEntries(ruleLines(fln001).map((r) => [r.key, r]));
    expect(byKey.pets.allowed).toBe(false);
    expect(byKey.events.allowed).toBe(false);
    // lucide's cigarette-off already draws its own slash
    expect(byKey.smoking.icon).toBe("cigarette-off");
    expect(byKey.smoking.allowed).toBe(true);
  });
});

describe("amenityDisplay", () => {
  it("translates known keys", () => {
    expect(amenityDisplay("air_conditioning")).toEqual({
      icon: "snowflake",
      label: "Ar-condicionado",
    });
    expect(amenityDisplay("bbq_grill").label).toBe("Churrasqueira");
  });

  it("humanizes unknown keys instead of breaking", () => {
    expect(amenityDisplay("heated_pool")).toEqual({
      icon: "check",
      label: "Heated pool",
    });
  });
});

describe("amenityList", () => {
  it("keeps only truthy amenities", () => {
    const list = amenityList({ wifi: true, tv: false, kitchen: true });
    expect(list.map((a) => a.key)).toEqual(["wifi", "kitchen"]);
  });

  it("puts known amenities before unknown ones", () => {
    const list = amenityList({ zzz_custom: true, wifi: true });
    expect(list[0].key).toBe("wifi");
    expect(list[1].label).toBe("Zzz custom");
  });
});

describe("accessTypeDisplay", () => {
  it("translates known access types", () => {
    expect(accessTypeDisplay("smart_lock").label).toBe("Fechadura eletrônica");
    expect(accessTypeDisplay("keybox").label).toBe("Cofre de chaves");
  });

  it("falls back for unknown or missing types", () => {
    expect(accessTypeDisplay("retina_scanner").label).toBe("Retina scanner");
    expect(accessTypeDisplay(null).label).toBe("Acesso ao imóvel");
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
