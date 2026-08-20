import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/guide/hero";

const base = {
  code: "FLN001",
  name: "Apartamento Beira-Mar Florianópolis",
  propertyType: "Apartamento",
  location: "Trindade, Florianópolis — SC",
  checkIn: "15:00",
  checkOut: "11:00",
  entry: "Self check-in",
  locale: "pt-BR",
} as const;

describe("Hero", () => {
  it("renders the code chip, name and essentials from data", () => {
    const html = renderToStaticMarkup(
      <Hero {...base} images={["https://example.test/a.jpg"]} />,
    );
    expect(html).toContain("IMÓVEL");
    expect(html).toContain("FLN001");
    expect(html).toContain("Apartamento Beira-Mar Florianópolis");
    expect(html).toContain("15:00");
    expect(html).toContain("Self check-in");
  });

  it("stacks every photo and shows only the first one", () => {
    const html = renderToStaticMarkup(
      <Hero
        {...base}
        images={[
          "https://example.test/a.jpg",
          "https://example.test/b.jpg",
          "https://example.test/c.jpg",
        ]}
      />,
    );
    expect(html.match(/<img/g)).toHaveLength(3);
    expect(html.match(/opacity-100/g)).toHaveLength(1);
  });
});
