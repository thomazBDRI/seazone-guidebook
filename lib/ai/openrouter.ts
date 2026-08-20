import "server-only";

import { env } from "@/lib/env";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 45_000;

export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

/** Thrown for every OpenRouter failure so callers can branch on `kind`. */
export class OpenRouterError extends Error {
  readonly kind: "http" | "network" | "timeout" | "empty";
  readonly status?: number;

  constructor(kind: OpenRouterError["kind"], message: string, status?: number) {
    super(message);
    this.name = "OpenRouterError";
    this.kind = kind;
    this.status = status;
  }
}

export type CompletionOptions = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Asks for a JSON object response. Free models honour this inconsistently,
   * so it is a hint only — always parse the text defensively.
   */
  json?: boolean;
  timeoutMs?: number;
};

export type CompletionResult = { text: string; model: string };

export async function createCompletion({
  messages,
  model = env.OPENROUTER_GUIDE_MODEL,
  temperature = 0.7,
  maxTokens = 4000,
  json = false,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: CompletionOptions): Promise<CompletionResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    const timedOut =
      cause instanceof Error &&
      (cause.name === "TimeoutError" || cause.name === "AbortError");
    throw new OpenRouterError(
      timedOut ? "timeout" : "network",
      timedOut
        ? `openrouter timed out after ${timeoutMs}ms`
        : `openrouter request failed: ${(cause as Error).message}`,
    );
  }

  if (!response.ok) {
    // body is read for the server log only — never surfaced to the guest
    const detail = (await response.text().catch(() => "")).slice(0, 500);
    throw new OpenRouterError(
      "http",
      `openrouter returned ${response.status}: ${detail}`,
      response.status,
    );
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ChatCompletionPayload | null;
  const text = payload?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new OpenRouterError("empty", `model ${model} returned no content`);
  }
  return { text, model: payload?.model ?? model };
}

type ChatCompletionPayload = {
  model?: string;
  choices?: { message?: { content?: string | null } }[];
};

export { parseJsonObject } from "@/lib/ai/json";
