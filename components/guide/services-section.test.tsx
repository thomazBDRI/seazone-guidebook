import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ServicesSection } from "@/components/guide/services-section";
import type { Property } from "@/lib/domain/property";
import { SEAZONE_WHATSAPP } from "@/lib/domain/seazone";
import { fln001, grm001 } from "@/test/fixtures/property";

const render = (property: Property, locale: "pt-BR" | "en" | "es" = "pt-BR") =>
  renderToStaticMarkup(<ServicesSection property={property} locale={locale} />);

describe("ServicesSection", () => {
  it("renders one offer card per service, with the check-in time filled in", () => {
    const html = render(fln001);

    expect(html).toContain('id="servicos"');
    expect(html).toContain("Precisa de algo?");
    expect(html).toContain("Chegue mais cedo");
    expect(html).toContain(
      "Quer entrar antes das 15:00? Fale com Ana Paula — sujeito à disponibilidade.",
    );
    expect(html).toContain("Check-out cedo demais? Pergunte a Ana Paula");
    // not offered by FLN001, so it has no card
    expect(html).not.toContain("Precisa sair mais tarde");
    expect(html).not.toContain("Saia mais tarde");
  });

  it("sends host services to the host with the request already typed", () => {
    const html = render(fln001);

    expect(html).toContain("Falar com Ana");
    expect(html).toContain(
      `https://wa.me/5548991234567?text=${encodeURIComponent(
        "Olá Ana Paula! Estou no Apartamento Beira-Mar Florianópolis (FLN001) e gostaria de saber sobre: Chegue mais cedo.",
      )}`,
    );
  });

  it("sends the stay extension to the seazone team instead", () => {
    const html = render(fln001);

    expect(html).toContain("Falar com a Seazone");
    expect(html).toContain(
      `https://wa.me/${SEAZONE_WHATSAPP}?text=${encodeURIComponent(
        "Olá! Estou no Apartamento Beira-Mar Florianópolis (FLN001) e quero estender minha estadia.",
      )}`,
    );
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

  it("localizes the heading, the offers, the buttons and the emergency row", () => {
    const english = render(fln001, "en");
    expect(english).toContain("Need anything else?");
    expect(english).toContain("Arrive earlier");
    expect(english).toContain("Want to get in before 15:00? Ask Ana Paula");
    expect(english).toContain("Message Ana");
    expect(english).toContain("Message Seazone");
    // the prefill travels url-encoded (the apostrophe is html-escaped too)
    expect(english).toContain(encodeURIComponent("extend my stay."));
    expect(english).toContain("Ambulance 192 · Fire 193 · Police 190");

    const spanish = render(fln001, "es");
    expect(spanish).toContain("¿Necesitas algo más?");
    expect(spanish).toContain("Llega más temprano");
    expect(spanish).toContain("¿Quieres entrar antes de las 15:00?");
    expect(spanish).toContain("Hablar con Ana");
    expect(spanish).toContain("Ambulancia 192 · Bomberos 193 · Policía 190");
  });
});
