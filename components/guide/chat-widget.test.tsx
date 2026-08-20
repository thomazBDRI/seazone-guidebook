import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChatWidget } from "@/components/guide/chat-widget";

const html = renderToStaticMarkup(
  <ChatWidget
    code="FLN001"
    propertyName="Apartamento Beira-Mar Florianópolis"
    hostName="Ana Paula"
    hostPhoneDigits="5548991234567"
  />,
);

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
});
