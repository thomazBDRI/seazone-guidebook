/**
 * CI reviewer: sends the pushed diff (plus the E2E outcome) to a free
 * OpenRouter model and posts the answer as a commit comment.
 *
 * It is advisory only, so every failure is swallowed and reported on stdout —
 * a flaky free model or a rate limit must never turn a build red. A non-zero
 * exit would mean this script itself is broken.
 *
 * Usage (see .github/workflows/ci.yml): bun run scripts/ai-review.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

/** Free, fast and specific on a probe diff; override with OPENROUTER_REVIEW_MODEL. */
const DEFAULT_MODEL = "z-ai/glm-5.2:free";
/**
 * Free models are rate-limited upstream without warning, so the first choice
 * is not the only one. Both fallbacks caught the planted bugs of the probe
 * diff too, just less tersely.
 */
const FALLBACK_MODELS = [
  "poolside/laguna-s-2.1:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];
/** Roughly 15k tokens of diff — well inside the model's window, and enough for one push. */
const MAX_DIFF_CHARS = 60_000;
const REQUEST_TIMEOUT_MS = 180_000;
const MAX_WORDS = 500;

/** Where the e2e artifact lands when the job downloads it. */
const REPORT_CANDIDATES = [
  "artifacts/playwright-report/results.json",
  "playwright-report/results.json",
];

const SYSTEM_PROMPT = `You are a senior engineer reviewing one push to a Next.js 16 + TypeScript app (Bun, Biome, Supabase, OpenRouter, Playwright).

Report only concrete findings you can point at in the diff, in this order: bugs, security or data-exposure risks, risky/fragile changes, missing test coverage. Reference file paths and, when the hunk shows them, line numbers.

Rules:
- English, GitHub markdown, at most ${MAX_WORDS} words.
- Terse bullets. No praise, no restating what the diff does, no style nits already handled by Biome.
- Distinguish certain findings from suspicions; say which.
- If nothing meaningful is wrong, reply with a single line saying so.`;

await main();

async function main(): Promise<void> {
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;
  const githubToken = process.env.GITHUB_TOKEN;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const models = [
    process.env.OPENROUTER_REVIEW_MODEL || DEFAULT_MODEL,
    ...FALLBACK_MODELS,
  ].filter((model, index, all) => all.indexOf(model) === index);

  if (!repo || !sha || !githubToken || !apiKey) {
    console.log(
      "ai-review: skipped (missing GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_TOKEN or OPENROUTER_API_KEY)",
    );
    return;
  }

  const diff = collectDiff(sha);
  if (!diff) {
    console.log("ai-review: skipped (no diff to review)");
    return;
  }

  await reviewAndComment({ repo, sha, githubToken, apiKey, models, diff });
}

type ReviewInput = {
  repo: string;
  sha: string;
  githubToken: string;
  apiKey: string;
  /** Tried in order until one answers. */
  models: string[];
  diff: string;
};

async function reviewAndComment(input: ReviewInput): Promise<void> {
  const prompt = buildPrompt(input.diff);

  let answered: { model: string; review: string } | null = null;
  for (const model of input.models) {
    const review = await requestReview(input.apiKey, model, prompt);
    if (review) {
      answered = { model, review };
      break;
    }
    console.log(`ai-review: falling back from ${model}`);
  }
  if (!answered) {
    console.log("ai-review: no model answered — nothing posted");
    return;
  }

  const body = [
    `### AI review · \`${answered.model}\``,
    "",
    answered.review,
    "",
    `_Automated, non-blocking review of ${input.sha.slice(0, 7)} by \`${answered.model}\` via OpenRouter. It can be wrong — treat it as a second pair of eyes, not a gate._`,
  ].join("\n");

  // also in the job log, so the review survives even if commenting fails
  console.log(body);
  await postCommitComment(input, body);
}

/** The push range, falling back to the single commit when the range is unusable. */
function collectDiff(sha: string): string {
  const before = process.env.DIFF_BASE;
  const usableBase =
    before && !/^0+$/.test(before) && revisionExists(before) ? before : null;

  const diff = usableBase
    ? git(["diff", "--unified=3", `${usableBase}..${sha}`])
    : git(["show", "--unified=3", "--format=%s%n", sha]);

  if (!diff) return "";
  return diff.length > MAX_DIFF_CHARS
    ? `${diff.slice(0, MAX_DIFF_CHARS)}\n\n[diff truncated at ${MAX_DIFF_CHARS} characters]`
    : diff;
}

function revisionExists(revision: string): boolean {
  return git(["cat-file", "-e", `${revision}^{commit}`]) !== null;
}

/** Returns null instead of throwing: a missing revision is expected, not fatal. */
function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (cause) {
    console.log(`ai-review: git ${args.join(" ")} failed: ${asMessage(cause)}`);
    return null;
  }
}

/** One line of test context, so the reviewer knows whether the suite agreed with it. */
function testContext(): string {
  const outcome = process.env.E2E_OUTCOME ?? "unknown";
  const report = readReport();
  if (!report) return `E2E job outcome: ${outcome} (no report available).`;

  const { expected = 0, unexpected = 0, flaky = 0, skipped = 0 } = report.stats;
  const failures = failureTitles(report);
  return [
    `E2E job outcome: ${outcome} — ${expected} passed, ${unexpected} failed, ${flaky} flaky, ${skipped} skipped.`,
    failures.length > 0 ? `Failing tests:\n- ${failures.join("\n- ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

type PlaywrightReport = {
  stats: {
    expected?: number;
    unexpected?: number;
    flaky?: number;
    skipped?: number;
  };
  suites?: ReportSuite[];
};

type ReportSuite = {
  title?: string;
  suites?: ReportSuite[];
  specs?: {
    title?: string;
    ok?: boolean;
    file?: string;
    line?: number;
  }[];
};

function readReport(): PlaywrightReport | null {
  const path = REPORT_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!path) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as PlaywrightReport;
    return parsed.stats ? parsed : null;
  } catch (cause) {
    console.log(`ai-review: unreadable report at ${path}: ${asMessage(cause)}`);
    return null;
  }
}

function failureTitles(report: PlaywrightReport): string[] {
  const titles: string[] = [];
  const walk = (suites: ReportSuite[] | undefined): void => {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        if (spec.ok === false) {
          titles.push(`${spec.file}:${spec.line} — ${spec.title}`);
        }
      }
      walk(suite.suites);
    }
  };
  walk(report.suites);
  return titles.slice(0, 20);
}

function buildPrompt(diff: string): string {
  return [
    testContext(),
    "",
    "Diff under review:",
    "",
    "```diff",
    diff,
    "```",
  ].join("\n");
}

async function requestReview(
  apiKey: string,
  model: string,
  userPrompt: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 1200,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    const raw = await response.text();
    if (!response.ok) {
      console.log(
        `ai-review: model call returned ${response.status}: ${raw.slice(0, 300)}`,
      );
      return null;
    }

    // errors also arrive inside a 200 body
    const payload = JSON.parse(raw) as {
      error?: { message?: string };
      choices?: { message?: { content?: string | null } }[];
    };
    if (payload.error) {
      console.log(`ai-review: model error: ${payload.error.message}`);
      return null;
    }

    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) {
      console.log("ai-review: model returned no content");
      return null;
    }
    return text;
  } catch (cause) {
    console.log(`ai-review: model call failed: ${asMessage(cause)}`);
    return null;
  }
}

async function postCommitComment(
  { repo, sha, githubToken }: ReviewInput,
  body: string,
): Promise<void> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/commits/${sha}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 300);
      console.log(`ai-review: comment failed (${response.status}): ${detail}`);
      return;
    }
    console.log(`ai-review: posted commit comment on ${sha.slice(0, 7)}`);
  } catch (cause) {
    console.log(`ai-review: comment failed: ${asMessage(cause)}`);
  }
}

function asMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
