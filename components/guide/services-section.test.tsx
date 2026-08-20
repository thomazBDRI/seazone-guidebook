import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ServicesSection } from "@/components/guide/services-section";
import type { Property } from "@/lib/domain/property";
import { fln001, grm001 } from "@/test/fixtures/property";

const render = (property: Property, locale: "pt-BR" | "en" | "es" = "pt-BR") =>
  renderToStaticMarkup(<ServicesSection property={property} locale={locale} />);

describe("ServicesSection", () => {
  it("renders one row per offered service, with the check-in time filled in", () => {
    const html = render(fln001);

    expect(html).toContain('id="servicos"');
    expect(html).toContain("Precisa de algo?");
    expect(html).toContain(
      "Quer entrar antes das 15:00? Fale com Ana Paula — sujeito à disponibilidade.",
    );
    expect(html).toContain("Check-out cedo demais? Pergunte a Ana Paula");
    // not offered by FLN001, so it has no row
    expect(html).not.toContain("Precisa sair mais tarde");
  });

  it("shows the host-authored note under the sentence", () => {
    const html = render(grm001);

    expect(html).toContain("Transfer do aeroporto: consulte Carlos Eduardo");
    expect(html).toContain(
      "Transfer particular até Canela e Gramado centro — combine com Carlos",
    );
  });

  it("closes with the emergency numbers and who to call about the property", () => {
    const html = render(fln001);

    expect(html).toContain("SAMU 192 · Bombeiros 193 · Polícia 190");
    expect(html).toContain("fale primeiro com Ana Paula");
  });

  it("localizes the heading, the sentences and the emergency row", () => {
    const english = render(fln001, "en");
    expect(english).toContain("Need anything else?");
    expect(english).toContain("Want to get in before 15:00? Ask Ana Paula");
    expect(english).toContain("Ambulance 192 · Fire 193 · Police 190");

    const spanish = render(fln001, "es");
    expect(spanish).toContain("¿Necesitas algo más?");
    expect(spanish).toContain("¿Quieres entrar antes de las 15:00?");
    expect(spanish).toContain("Ambulancia 192 · Bomberos 193 · Policía 190");
  });
});
