import { afterEach, expect, it, vi } from "vitest";

/**
 * The base URL override lives in its own file because the endpoint is built
 * once at module load: a second env mock in the main suite would not take
 * effect. This is the path the E2E stub depends on.
 */
vi.mock("@/lib/env", () => ({
  env: {
    OPENROUTER_API_KEY: "test-key",
    // trailing slash on purpose — an env value copied from a browser has one
    OPENROUTER_BASE_URL: "http://localhost:3201/",
    OPENROUTER_GUIDE_MODEL: "test/default-model:free",
  },
}));

const { createCompletion } = await import("@/lib/ai/openrouter");

afterEach(() => {
  vi.unstubAllGlobals();
});

it("sends completions to the configured base url", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
  });
  vi.stubGlobal("fetch", fetchMock);

  await createCompletion({ messages: [{ role: "user", content: "oi" }] });

  expect(fetchMock.mock.calls[0][0]).toBe(
    "http://localhost:3201/chat/completions",
  );
});
