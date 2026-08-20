import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ExperienceSection,
  ExperienceSkeleton,
} from "@/components/guide/experience-section";
import { GuideContentSchema } from "@/lib/domain/guide";

const content = GuideContentSchema.parse({
  welcome_message: "Seu apartamento fica no coração da Trindade.",
  restaurants: [
    {
      name: "Box 32",
      distance: "1,2 km",
      description: "Boteco tradicional no Mercado Público.",
    },
    {
      name: "Armazém Vieira",
      distance: "≈ 2,5 km",
      description: "Frutos do mar desde 1958.",
    },
  ],
  attractions: [
    {
      name: "Lagoa da Conceição",
      distance: "10 km",
      description: "Cartão-postal da ilha.",
    },
  ],
  essentials: [
    {
      name: "Farmácia Catarinense",
      type: "Farmácia",
      distance: "300 m",
      description: "Farmácia 24h na Av. Madre Benvenuta.",
    },
  ],
  seasonal_tip: "Agosto é inverno em Floripa: leve um agasalho.",
});

function render(node: React.ReactElement): string {
  return renderToStaticMarkup(node);
}

describe("ExperienceSection", () => {
  const html = render(
    <ExperienceSection
      content={content}
      neighborhood="Trindade"
      city="Florianópolis"
      generatedAt="2026-08-19T12:00:00.000Z"
      locale="pt-BR"
    />,
  );

  it("renders the generated content", () => {
    expect(html).toContain("Explore Trindade e Florianópolis");
    expect(html).toContain("Seu apartamento fica no coração da Trindade.");
    expect(html).toContain("Box 32");
    expect(html).toContain("Agosto é inverno em Floripa");
  });

  it("counts the suggestions per group", () => {
    expect(html).toContain("2 sugestões");
    expect(html).toContain("1 sugestão");
  });

  it("prefixes distances once", () => {
    expect(html).toContain("≈ 1,2 km");
    expect(html).toContain("≈ 2,5 km");
    expect(html).not.toContain("≈ ≈");
  });

  it("links places to maps, and only places with an instagram chip", () => {
    expect(html).toContain(
      "https://www.google.com/maps/search/?api=1&amp;query=Box%2032%20Florian%C3%B3polis",
    );
    expect(html).toContain("Box%2032%20Florian%C3%B3polis%20instagram");
    // essentials get the type tag instead of an instagram search
    expect(html).toContain("Farmácia");
    expect(html).not.toContain(
      "Farm%C3%A1cia%20Catarinense%20Florian%C3%B3polis%20instagram",
    );
  });

  it("stamps the generation month and date in pt-BR", () => {
    expect(html).toContain("Dica da estação · Agosto");
    expect(html).toContain("gerado em 19/08/2026");
  });

  it("omits the date when the row has none", () => {
    const undated = render(
      <ExperienceSection
        content={content}
        neighborhood="Trindade"
        city="Florianópolis"
        generatedAt={null}
        locale="pt-BR"
      />,
    );
    expect(undated).toContain("Dica da estação");
    expect(undated).not.toContain("gerado em");
  });
});

describe("ExperienceSkeleton", () => {
  it("shows the generating banner and shimmering placeholders", () => {
    const html = render(
      <ExperienceSkeleton
        neighborhood="Planalto"
        city="Gramado"
        locale="pt-BR"
      />,
    );
    expect(html).toContain("Preparando seu guia personalizado…");
    expect(html).toContain("Nossa IA está explorando Planalto");
    expect(html).toContain("animate-shimmer");
    expect(html).not.toContain("sugestões");
  });
});
