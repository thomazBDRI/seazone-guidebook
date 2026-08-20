import { expect, test } from "@playwright/test";

/**
 * Phone-only layout checks. The guide is delivered as a link in a booking
 * confirmation, so the phone is the primary device — the desktop project
 * skips this file.
 */
test.describe("mobile layout", () => {
  test.skip(({ isMobile }) => !isMobile, "runs in the mobile project only");

  test("renders the guide with the section bar and a reachable assistant", async ({
    page,
  }, testInfo) => {
    await page.goto("/FLN001");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Apartamento Beira-Mar Florianópolis",
      }),
    ).toBeVisible();

    // the side rail collapses into a sticky "Seção" bar below 1400px
    const sectionBar = page.getByText("Seção", { exact: true });
    await expect(sectionBar).toBeVisible();
    await sectionBar.tap();
    await expect(
      page.getByRole("link", { name: "Explore a região" }),
    ).toBeVisible();

    const fab = page.getByRole("button", { name: "Abrir assistente virtual" });
    await expect(fab).toBeVisible();
    await fab.tap();
    await expect(
      page.getByPlaceholder("Pergunte sobre o imóvel…"),
    ).toBeVisible();

    await testInfo.attach("guide-mobile-full-page", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
});
