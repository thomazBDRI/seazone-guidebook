import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PropertyCard } from "@/components/home/property-card";
import type { PropertySummary } from "@/lib/domain/property";

const fln001: PropertySummary = {
  code: "FLN001",
  name: "Apartamento Beira-Mar Florianópolis",
  property_type: "Apartamento",
  city: "Florianópolis",
  state: "SC",
  bedroom_quantity: 2,
  bathroom_quantity: 1,
  guest_capacity: 4,
  image: "https://example.test/cover.jpg",
};

describe("PropertyCard", () => {
  it("links the whole card to the guide and renders the property data", () => {
    const html = renderToStaticMarkup(
      <PropertyCard property={fln001} locale="pt-BR" />,
    );

    expect(html).toContain('href="/FLN001"');
    expect(html).toContain("Apartamento Beira-Mar Florianópolis");
    expect(html).toContain("Florianópolis");
    expect(html).toContain("SC");
    expect(html).toContain("2 quartos");
    expect(html).toContain("1 banheiro");
    expect(html).toContain("4 hóspedes");
    expect(html).toContain("https://example.test/cover.jpg");
  });

  it("localizes the labels around the data", () => {
    const html = renderToStaticMarkup(
      <PropertyCard property={fln001} locale="en" />,
    );

    expect(html).toContain("Open the guide");
    expect(html).toContain("4 guests");
    expect(html).not.toContain("Abrir o guia");
  });

  it("falls back to the wave mark when the property has no photo", () => {
    const html = renderToStaticMarkup(
      <PropertyCard property={{ ...fln001, image: null }} locale="pt-BR" />,
    );

    expect(html).not.toContain("<img");
  });
});
