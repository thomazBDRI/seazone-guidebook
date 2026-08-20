import { expect, test } from "@playwright/test";
import { openChat, openGuide } from "./helpers";

/** The three deltas the stub streams for a Wi-Fi question, concatenated. */
const FULL_ANSWER = "A senha do Wi-Fi é floripa2024.";
/** Generous ceiling for the whole stubbed answer (3 deltas × 80ms). */
const STREAM_BUDGET_MS = 15_000;
/** Screen-reader label of the typing dots, shown before the first delta. */
const TYPING = "Digitando…";

declare global {
  interface Window {
    /** Every distinct text the answer bubble held, in order. */
    __answerStates?: string[];
  }
}

test("streams the assistant answer through the app's own endpoint", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));

  await openGuide(page, "/FLN001");
  await openChat(page);

  // Polling innerText from the test would race the stream on a loaded machine,
  // so the intermediate states are recorded in the page instead: every paint
  // of the answer bubble is captured, whatever the timing.
  await page.evaluate(() => {
    const transcript = document.querySelector('[aria-live="polite"]');
    if (!transcript) throw new Error("chat transcript not found");
    const states: string[] = [];
    window.__answerStates = states;
    new MutationObserver(() => {
      const text = transcript.lastElementChild?.textContent?.trim() ?? "";
      if (text && states.at(-1) !== text) states.push(text);
    }).observe(transcript, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });

  await page.getByRole("button", { name: "Qual a senha do WiFi?" }).click();

  const answer = page.locator('[aria-live="polite"] > div').last();
  await expect(answer).toHaveText(FULL_ANSWER, { timeout: STREAM_BUDGET_MS });

  const states = (
    await page.evaluate(() => window.__answerStates ?? [])
  ).filter((state) => state !== TYPING);

  // real streaming: the answer was painted more than once, each state a prefix
  // of the next, and the guest saw text before the password arrived
  expect(states.at(-1)).toBe(FULL_ANSWER);
  const partials = states.slice(0, -1);
  expect(partials.length).toBeGreaterThan(0);
  for (const partial of partials) {
    expect(FULL_ANSWER.startsWith(partial)).toBe(true);
  }
  expect(partials.some((partial) => !partial.includes("floripa2024"))).toBe(
    true,
  );

  // the browser only ever talks to our own route — the model host stays server-side
  expect(requested.filter((url) => url.includes("/api/chat"))).toHaveLength(1);
  expect(
    requested.filter(
      (url) => url.includes("openrouter") || url.includes(":3201"),
    ),
  ).toHaveLength(0);
});

test("keeps the question and the answer in the transcript", async ({
  page,
}) => {
  await openGuide(page, "/FLN001");
  await openChat(page);
  await page
    .getByRole("button", { name: "A que horas posso fazer check-in?" })
    .click();

  const transcript = page.locator('[aria-live="polite"]');
  await expect(transcript).toContainText("A que horas posso fazer check-in?");
  await expect(transcript).toContainText("começa às 15:00", {
    timeout: STREAM_BUDGET_MS,
  });
});
