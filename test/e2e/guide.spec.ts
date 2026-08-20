import { expect, test } from "@playwright/test";
import { openGuide } from "./helpers";

/**
 * Guide page against the live seeded database (read-only): every value
 * asserted here comes from a `properties` row, so a page that hardcoded its
 * content would still pass the unit tests but fail this file.
 */
test.describe("FLN001", () => {
  test.beforeEach(async ({ page }) => {
    await openGuide(page, "/FLN001");
  });

  test("renders the property identity and arrival data", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Apartamento Beira-Mar Florianópolis",
      }),
    ).toBeVisible();
    await expect(page.getByText("IMÓVEL FLN001")).toBeVisible();

    // Wi-Fi credentials come from the row, not from the markup
    await expect(page.getByText("SeaHome_FLN001")).toBeVisible();
    await expect(page.getByText("floripa2024")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "QR code para conectar ao Wi-Fi" }),
    ).toBeVisible();

    // check-in appears in the hero strip and again in the rules card
    await expect(page.getByText("15:00").first()).toBeVisible();
    await expect(page.getByText("Máximo de 4 hóspedes")).toBeVisible();
    await expect(page.getByText("Vaga 12", { exact: false })).toBeVisible();
    await expect(
      page.getByText("Use o código 4521 na fechadura eletrônica"),
    ).toBeVisible();
  });

  test("renders the services the property offers on request", async ({
    page,
  }) => {
    const services = page.locator("#servicos");
    await expect(
      services.getByRole("heading", { name: "Precisa de algo?" }),
    ).toBeVisible();

    // the sentence is composed from the row: services jsonb + check_in_time +
    // host_name, none of them written in the markup
    await expect(
      services.getByText(
        "Quer entrar antes das 15:00? Fale com Ana Paula — sujeito à disponibilidade.",
      ),
    ).toBeVisible();
    await expect(
      services.getByText("SAMU 192 · Bombeiros 193 · Polícia 190"),
    ).toBeVisible();
  });

  test("renders the persisted experiences guide", async ({ page }) => {
    const experiences = page.locator("#experiencias");
    await expect(experiences).toBeVisible();
    await expect(
      experiences.getByRole("heading", { name: /Explore Trindade e/ }),
    ).toBeVisible();

    // one h4 per curated place (plus the seasonal tip): a guide that failed to
    // generate would render the skeleton instead, which has none
    await expect
      .poll(() => experiences.locator("h4").count())
      .toBeGreaterThanOrEqual(8);
    await expect(
      experiences.getByText("Conteúdo gerado por IA", { exact: false }),
    ).toBeVisible();
  });

  test("links the guest to the host on whatsapp", async ({ page }) => {
    const whatsapp = page.locator('a[href="https://wa.me/5548991234567"]');
    await expect(whatsapp.first()).toBeVisible();
    // scoped to the contact card: the host name also appears in the services
    // sentences ("Fale com Ana Paula"), which is not what this test is about
    await expect(
      page.locator("#contato").getByText("Ana Paula", { exact: true }),
    ).toBeVisible();
  });
});

test.describe("GRM001", () => {
  test("serves a lowercase code and its own data", async ({ page }) => {
    const response = await page.goto("/grm001");
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { level: 1, name: "Chalé Serra Gramado" }),
    ).toBeVisible();
    await expect(
      page.getByText("A chave está no cofre na entrada. Código: 1983"),
    ).toBeVisible();
    await expect(
      page.getByText("Animais de estimação são bem-vindos"),
    ).toBeVisible();
    await expect(page.getByText("ChaletSerra_GRM")).toBeVisible();
  });
});
