import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Opens the chat widget and returns its dialog.
 *
 * The guide page is server-rendered, so the button exists before React has
 * hydrated and an early click is silently dropped. Clicking inside `toPass`
 * retries until the widget actually opens — the dialog only takes the `dialog`
 * role while open (it is aria-hidden otherwise).
 */
export async function openChat(page: Page): Promise<Locator> {
  const dialog = page.getByRole("dialog", { name: "Assistente virtual" });

  await expect(async () => {
    await page
      .getByRole("button", { name: "Abrir assistente virtual" })
      .click({ timeout: 2_000 });
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });

  return dialog;
}
