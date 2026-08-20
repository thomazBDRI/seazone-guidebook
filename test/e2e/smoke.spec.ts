import { expect, test } from "@playwright/test";

/**
 * Verifies the harness itself: the built app is being served and its AI calls
 * land on the stub instead of OpenRouter. If this file fails, no other E2E
 * result means anything.
 */
test.describe("harness", () => {
  test("serves the built guide page", async ({ page }) => {
    const response = await page.goto("/FLN001");
    expect(response?.status()).toBe(200);
  });

  test("routes model calls to the local stub", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        code: "FLN001",
        messages: [{ role: "user", content: "Qual a senha do WiFi?" }],
      },
    });

    expect(response.status()).toBe(200);
    // the canned stub answer — a live model would never reply verbatim
    expect(await response.text()).toBe("A senha do Wi-Fi é floripa2024.");
  });
});
