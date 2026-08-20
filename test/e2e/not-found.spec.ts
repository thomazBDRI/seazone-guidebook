import { expect, test } from "@playwright/test";

test("unknown code answers 404 with a way back", async ({ page }) => {
  const response = await page.goto("/XYZ999");

  // the status matters as much as the page: a soft 404 would be indexed
  expect(response?.status()).toBe(404);
  await expect(page.getByText("navegou para longe")).toBeVisible();
  await expect(page.locator('a[href="/FLN001"]')).toBeVisible();
});
