import { defineConfig, devices } from "@playwright/test";

/**
 * E2E ("instrumented") suite. It runs against a production build served on
 * 3200 and reads the real seeded database, so the assertions cover the actual
 * data path; only the LLM is replaced, by the stub on 3201 (see
 * test/e2e/stub-openrouter.ts) — a live free model would make streaming
 * assertions flaky and cost a call per run.
 *
 * Prerequisite: `bun run build`. Then `bun run test:e2e`.
 */
const APP_PORT = 3200;
const STUB_PORT = 3201;
const BASE_URL = `http://localhost:${APP_PORT}`;

/** Never a real credential here: the stub does not check it, and the app's env schema requires one. */
const STUB_API_KEY = "sk-or-e2e-stub";

export default defineConfig({
  testDir: "./test/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // the suite reads a live Supabase project, which occasionally rejects a
  // request with a clock-skew error ("JWT issued at future"); a real failure
  // still fails every attempt
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    // machine-readable sibling of the HTML report, read by scripts/ai-review.ts
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // iPhone-sized viewport on chromium — the only browser the suite installs
      name: "mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
  webServer: [
    {
      command: `bun run test/e2e/stub-openrouter.ts`,
      url: `http://localhost:${STUB_PORT}/health`,
      env: { PORT: String(STUB_PORT) },
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
    },
    {
      command: "bun run start",
      url: BASE_URL,
      env: {
        PORT: String(APP_PORT),
        OPENROUTER_BASE_URL: `http://localhost:${STUB_PORT}`,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? STUB_API_KEY,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
    },
  ],
});
