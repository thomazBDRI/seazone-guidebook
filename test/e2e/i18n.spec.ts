import { expect, test } from "@playwright/test";
import { openGuide } from "./helpers";

/**
 * Language switching end to end, against the built app and the live seeded
 * database. The rest of the suite asserts the pt-BR default, so this file only
 * has to prove the switch reaches the server render — including the strings
 * that come from the domain dictionaries, not just the static copy.
 */
test.describe("language switcher", () => {
  test("serves the guide in pt-BR by default", async ({ page }) => {
    await openGuide(page, "/FLN001");

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Tire dúvidas com a IA" }),
    ).toBeVisible();
    await expect(page.getByText("Chegada & acesso").first()).toBeVisible();
    await expect(
      page.getByText("Não é permitido animais de estimação"),
    ).toBeVisible();
  });

  test("switches the whole page to english and back", async ({ page }) => {
    await openGuide(page, "/FLN001");

    // the switcher is a client component: retry the click until React has
    // hydrated, like the chat helper does
    await expect(async () => {
      await page
        .getByRole("button", { name: "Ver o guia em English" })
        .click({ timeout: 2_000 });
      await expect(page.locator("html")).toHaveAttribute("lang", "en", {
        timeout: 3_000,
      });
    }).toPass({ timeout: 20_000 });

    // static copy, section headings and the rule sentences all follow
    await expect(
      page.getByRole("button", { name: "Ask the AI assistant" }),
    ).toBeVisible();
    await expect(page.getByText("Arrival & access").first()).toBeVisible();
    await expect(page.getByText("During your stay")).toBeVisible();
    await expect(page.getByText("Pets are not allowed")).toBeVisible();
    await expect(
      page.getByText("Não é permitido animais de estimação"),
    ).toHaveCount(0);

    // property data is not translated, only the chrome around it
    await expect(page.getByText("SeaHome_FLN001")).toBeVisible();
    await expect(page.getByText("floripa2024")).toBeVisible();

    await page
      .getByRole("button", { name: "View the guide in Português" })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("button", { name: "Tire dúvidas com a IA" }),
    ).toBeVisible();
  });

  test("keeps the language across a reload and on the 404 page", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "locale", value: "es", domain: "localhost", path: "/" },
    ]);

    await openGuide(page, "/FLN001");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByText("Llegada y acceso").first()).toBeVisible();
    await expect(page.getByText("No se admiten mascotas")).toBeVisible();

    const response = await page.goto("/XYZ999");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("se fue navegando")).toBeVisible();
  });
});
