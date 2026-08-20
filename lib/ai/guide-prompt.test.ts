import { describe, expect, it } from "vitest";
import { emptyPois, type NearbyPois } from "@/lib/ai/geo";
import {
  buildCorrectionMessages,
  buildGuideMessages,
  JSON_CONTRACT,
  monthName,
  seasonName,
} from "@/lib/ai/guide-prompt";
import { fln001, grm001 } from "@/test/fixtures/property";

function poisFixture(): NearbyPois {
  return {
    ...emptyPois(),
    restaurants: [
      { name: "Box 32", distance: "≈ 1,2 km", meters: 1200 },
      { name: "Café Cultura", distance: "≈ 850 m", meters: 850 },
    ],
    attractions: [
      { name: "Morro da Cruz", distance: "≈ 2,1 km", meters: 2100 },
    ],
    pharmacies: [{ name: "Farmácia Panvel", distance: "≈ 300 m", meters: 300 }],
    supermarkets: [{ name: "Angeloni", distance: "≈ 700 m", meters: 700 }],
    hospitals: [
      { name: "Hospital Universitário", distance: "≈ 950 m", meters: 950 },
    ],
  };
}

/** Everything the model is told lives in these two messages. */
function promptText(messages: { content: string }[]): string {
  return messages.map((message) => message.content).join("\n");
}

describe("buildGuideMessages", () => {
  it("puts the instructions in the system message and the data in the user one", () => {
    const messages = buildGuideMessages({
      property: fln001,
      pois: poisFixture(),
      locale: "pt-BR",
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
  });

  it("describes the property and its location", () => {
    const text = promptText(
      buildGuideMessages({
        property: fln001,
        pois: poisFixture(),
        locale: "pt-BR",
      }),
    );

    expect(text).toContain("Apartamento Beira-Mar Florianópolis");
    expect(text).toContain("Apartamento");
    expect(text).toContain("Trindade");
    expect(text).toContain("Florianópolis - SC");
  });

  it("states the current month and season for the seasonal tip", () => {
    const text = promptText(
      buildGuideMessages({
        property: fln001,
        pois: poisFixture(),
        locale: "pt-BR",
        now: new Date("2026-08-19T12:00:00Z"),
      }),
    );

    expect(text).toContain("Mês atual: agosto (inverno no hemisfério sul)");
  });

  it("defaults to the actual current month", () => {
    const text = promptText(
      buildGuideMessages({
        property: fln001,
        pois: poisFixture(),
        locale: "pt-BR",
      }),
    );

    expect(text).toContain(`Mês atual: ${monthName(new Date())}`);
  });

  it("always spells out the json contract", () => {
    for (const pois of [poisFixture(), null]) {
      const text = promptText(
        buildGuideMessages({ property: fln001, pois, locale: "pt-BR" }),
      );

      expect(text).toContain(JSON_CONTRACT);
      expect(text).toContain("welcome_message");
      expect(text).toContain("seasonal_tip");
      expect(text).toContain("farmácia | supermercado | hospital");
    }
  });

  describe("grounded on OSM candidates", () => {
    it("lists every candidate with its pre-computed distance", () => {
      const text = promptText(
        buildGuideMessages({
          property: fln001,
          pois: poisFixture(),
          locale: "pt-BR",
        }),
      );

      expect(text).toContain("- Box 32 | ≈ 1,2 km");
      expect(text).toContain("- Café Cultura | ≈ 850 m");
      expect(text).toContain("- Morro da Cruz | ≈ 2,1 km");
      expect(text).toContain("- Farmácia Panvel | ≈ 300 m");
      expect(text).toContain("- Angeloni | ≈ 700 m");
      expect(text).toContain("- Hospital Universitário | ≈ 950 m");
    });

    it("forbids inventing places outside the list and rewriting distances", () => {
      const text = promptText(
        buildGuideMessages({
          property: fln001,
          pois: poisFixture(),
          locale: "pt-BR",
        }),
      );

      expect(text).toContain("Use SOMENTE nomes que aparecem na lista acima");
      expect(text).toContain("Copie a distância de cada lugar EXATAMENTE");
      expect(text).not.toContain("apenas o seu conhecimento");
    });

    it("omits categories OSM found nothing for", () => {
      const pois = { ...poisFixture(), hospitals: [] };
      const text = promptText(
        buildGuideMessages({ property: fln001, pois, locale: "pt-BR" }),
      );

      expect(text).not.toContain("Hospitais e clínicas");
      expect(text).toContain("Farmácias");
    });

    it("asks for the counts the experiences section renders", () => {
      const text = promptText(
        buildGuideMessages({
          property: fln001,
          pois: poisFixture(),
          locale: "pt-BR",
        }),
      );

      expect(text).toContain("4 a 5 opções DA LISTA");
      expect(text).toContain("3 a 4 opções DA LISTA");
    });
  });

  describe("fallback without OSM grounding", () => {
    it("treats an empty candidate set as no grounding at all", () => {
      const text = promptText(
        buildGuideMessages({
          property: fln001,
          pois: emptyPois(),
          locale: "pt-BR",
        }),
      );

      expect(text).toContain("Não há lista de lugares mapeados");
    });

    it("restricts the model to famous, verifiable places in that city", () => {
      const text = promptText(
        buildGuideMessages({ property: grm001, pois: null, locale: "pt-BR" }),
      );

      expect(text).toContain("apenas o seu conhecimento sobre Gramado");
      expect(text).toContain("FAMOSOS e consolidados de Gramado");
      expect(text).toContain("atrações reconhecidas de Gramado");
      expect(text).toContain("Nada de estabelecimentos incertos");
    });

    it("asks for honest approximate distances from the neighbourhood", () => {
      const text = promptText(
        buildGuideMessages({ property: grm001, pois: null, locale: "pt-BR" }),
      );

      expect(text).toContain(
        "As distâncias são aproximadas a partir do bairro Planalto",
      );
      expect(text).toContain("nunca precise mais do que sabe");
    });

    it("carries no candidate list", () => {
      const text = promptText(
        buildGuideMessages({ property: fln001, pois: null, locale: "pt-BR" }),
      );

      expect(text).not.toContain("Lugares reais mapeados");
      expect(text).not.toContain("OpenStreetMap");
    });
  });
});

describe("locale", () => {
  it("asks for the guide in the language it will be stored under", () => {
    const english = promptText(
      buildGuideMessages({ property: fln001, pois: null, locale: "en" }),
    );
    expect(english).toContain("Escreva sempre em inglês");
    expect(english).toContain(
      "Todo o texto dentro do JSON deve estar em inglês",
    );

    const spanish = promptText(
      buildGuideMessages({ property: fln001, pois: null, locale: "es" }),
    );
    expect(spanish).toContain("Escreva sempre em espanhol");
  });

  it("keeps the pt-BR wording as the reference", () => {
    const text = promptText(
      buildGuideMessages({ property: fln001, pois: null, locale: "pt-BR" }),
    );
    expect(text).toContain("Escreva sempre em português do Brasil");
  });

  it("pins the essentials type to its portuguese literals in every locale", () => {
    for (const locale of ["pt-BR", "en", "es"] as const) {
      const text = promptText(
        buildGuideMessages({ property: fln001, pois: null, locale }),
      );
      expect(text).toContain("farmácia | supermercado | hospital");
      expect(text).toContain(
        'o campo "type" de essentials: ele é um dado do sistema e usa sempre os valores em português',
      );
    }
  });
});

describe("buildCorrectionMessages", () => {
  const base = buildGuideMessages({
    property: fln001,
    pois: poisFixture(),
    locale: "pt-BR",
  });
  const corrected = buildCorrectionMessages(
    base,
    '{"welcome_message": 42}',
    "- restaurants: campo obrigatório",
  );

  it("keeps the original turns and adds the rejected answer plus the fix", () => {
    expect(corrected.slice(0, base.length)).toEqual(base);
    expect(corrected.map((message) => message.role).slice(base.length)).toEqual(
      ["assistant", "user"],
    );
  });

  it("tells the model what the validator rejected", () => {
    const last = corrected.at(-1)?.content ?? "";

    expect(corrected.at(base.length)?.content).toContain("welcome_message");
    expect(last).toContain("- restaurants: campo obrigatório");
    expect(last).toContain(JSON_CONTRACT);
  });

  it("truncates a runaway answer instead of replaying it whole", () => {
    const flooded = buildCorrectionMessages(base, "x".repeat(9000), "- erro");

    expect(corrected.length).toBe(flooded.length);
    expect(flooded.at(base.length)?.content).toHaveLength(4000);
  });
});

describe("seasonName", () => {
  it("names the southern-hemisphere season both test cities live in", () => {
    expect(seasonName(new Date("2026-01-15T12:00:00Z"))).toBe("verão");
    expect(seasonName(new Date("2026-04-10T12:00:00Z"))).toBe("outono");
    expect(seasonName(new Date("2026-08-19T12:00:00Z"))).toBe("inverno");
    expect(seasonName(new Date("2026-10-05T12:00:00Z"))).toBe("primavera");
  });

  it("switches on the solstice, not the first of the month", () => {
    expect(seasonName(new Date("2026-12-20T12:00:00Z"))).toBe("primavera");
    expect(seasonName(new Date("2026-12-21T12:00:00Z"))).toBe("verão");
  });
});
