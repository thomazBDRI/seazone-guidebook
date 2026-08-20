import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChatWidget } from "@/components/guide/chat-widget";
import type { Locale } from "@/lib/i18n/locales";

function render(locale: Locale): string {
  return renderToStaticMarkup(
    <ChatWidget
      code="FLN001"
      propertyName="Apartamento Beira-Mar Florianópolis"
      hostName="Ana Paula"
      hostPhoneDigits="5548991234567"
      locale={locale}
    />,
  );
}

const html = render("pt-BR");

describe("ChatWidget", () => {
  it("greets from property data and says which unit it knows", () => {
    expect(html).toContain("Apartamento Beira-Mar Florianópolis");
    expect(html).toContain("conhece o ");
    expect(html).toContain("FLN001");
  });

  it("offers the canonical questions as chips", () => {
    expect(html).toContain("Qual a senha do WiFi?");
    expect(html).toContain("Posso trazer meu cachorro?");
    expect(html).toContain("A que horas posso fazer check-in?");
    expect(html).toContain("Que restaurantes tem perto?");
  });

  it("starts closed, with the panel out of reach", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("pointer-events-none");
  });

  it("greets and suggests in the active locale", () => {
    const english = render("en");
    expect(english).toContain("I am the assistant for");
    expect(english).toContain("What is the Wi-Fi password?");
    expect(english).toContain("Ask about the property…");
    expect(english).not.toContain("Pergunte sobre o imóvel");

    const spanish = render("es");
    expect(spanish).toContain("Soy el asistente de");
    expect(spanish).toContain("¿Puedo traer a mi perro?");
  });
});
