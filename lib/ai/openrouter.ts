import "server-only";

import { createSseDeltaParser } from "@/lib/ai/stream";
import { env } from "@/lib/env";

const ENDPOINT = `${env.OPENROUTER_BASE_URL.replace(/\/+$/, "")}/chat/completions`;
const DEFAULT_TIMEOUT_MS = 45_000;
/** Stays under the chat route's 60s maxDuration. */
const DEFAULT_STREAM_TIMEOUT_MS = 50_000;
/**
 * Free models sometimes accept a request and then go quiet mid-answer. Waiting
 * for the hard timeout would leave the guest staring at half a sentence for
 * most of a minute, so a silent stream is given up on much sooner.
 */
const STREAM_IDLE_TIMEOUT_MS = 15_000;

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
    throw asAbortOrNetworkError(cause, timeoutMs);
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

  // the body is read as text first: OpenRouter pads long-running requests
  // with whitespace to hold the connection open, and reading can time out
  // well after the headers arrived — json() would report that as a parse
  // failure and hide a plainly retryable timeout
  let raw: string;
  try {
    raw = await response.text();
  } catch (cause) {
    throw asAbortOrNetworkError(cause, timeoutMs);
  }

  let payload: ChatCompletionPayload;
  try {
    payload = JSON.parse(raw) as ChatCompletionPayload;
  } catch {
    throw new OpenRouterError(
      "empty",
      `openrouter sent an unparseable body: ${raw.trim().slice(0, 200)}`,
    );
  }

  // errors also arrive inside a 200 body, where response.ok says nothing
  if (payload.error) {
    const status = payload.error.code ?? response.status;
    throw new OpenRouterError(
      "http",
      `openrouter returned an error payload: ${payload.error.message ?? "unknown"}`,
      typeof status === "number" ? status : undefined,
    );
  }

  const choice = payload.choices?.[0];
  const text = choice?.message?.content?.trim();

  if (!text) {
    // reasoning models can spend the whole token budget thinking and return
    // an empty message, so the diagnosis goes in the message: without it the
    // failed row says only "no content" for several different causes
    throw new OpenRouterError(
      "empty",
      `model ${model} returned no content (finish_reason=${choice?.finish_reason ?? "none"}, reasoning_chars=${choice?.message?.reasoning?.length ?? 0}, completion_tokens=${payload.usage?.completion_tokens ?? 0})`,
    );
  }
  return { text, model: payload.model ?? model };
}

export type StreamOptions = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

export type StreamResult = {
  model: string;
  /** Content deltas in arrival order; throws OpenRouterError mid-stream. */
  deltas: AsyncGenerator<string>;
};

/**
 * Streaming sibling of createCompletion. It resolves as soon as the upstream
 * accepted the request, so a caller can still answer with an error status
 * before committing to a streamed response body; everything that goes wrong
 * after that surfaces while iterating `deltas`.
 */
export async function streamCompletion({
  messages,
  model = env.OPENROUTER_GUIDE_MODEL,
  temperature = 0.4,
  maxTokens = 800,
  timeoutMs = DEFAULT_STREAM_TIMEOUT_MS,
}: StreamOptions): Promise<StreamResult> {
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
        stream: true,
        // a little thinking, none of it on screen: with reasoning switched off
        // entirely the free models start obeying injected instructions, and
        // with it merely enabled the guest watches the deliberation stream by
        reasoning: { effort: "low", exclude: true },
        messages,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw asAbortOrNetworkError(cause, timeoutMs);
  }

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 500);
    throw new OpenRouterError(
      "http",
      `openrouter returned ${response.status}: ${detail}`,
      response.status,
    );
  }
  if (!response.body) {
    throw new OpenRouterError("empty", `model ${model} sent no response body`);
  }

  return { model, deltas: readDeltas(response.body, timeoutMs) };
}

async function* readDeltas(
  body: ReadableStream<Uint8Array>,
  timeoutMs: number,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const parser = createSseDeltaParser();

  try {
    while (true) {
      const { done, value } = await readWithin(reader, STREAM_IDLE_TIMEOUT_MS);
      if (done) break;

      for (const event of parser.push(
        decoder.decode(value, { stream: true }),
      )) {
        if (event.kind === "error") {
          // errors also arrive inside a 200 SSE frame, long after the headers
          throw new OpenRouterError(
            "http",
            `openrouter stream failed: ${event.message}`,
          );
        }
        yield event.text;
      }
    }
  } catch (cause) {
    if (cause instanceof OpenRouterError) throw cause;
    throw asAbortOrNetworkError(cause, timeoutMs);
  } finally {
    await reader.cancel().catch(() => {});
  }
}

/** One read, bounded by the silence we are willing to tolerate. */
async function readWithin(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  idleMs: number,
): Promise<ReadableStreamReadResult<Uint8Array>> {
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) => {
        idleTimer = setTimeout(
          () =>
            reject(
              new OpenRouterError(
                "timeout",
                `openrouter stream went silent for ${idleMs}ms`,
              ),
            ),
          idleMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(idleTimer);
  }
}

function asAbortOrNetworkError(
  cause: unknown,
  timeoutMs: number,
): OpenRouterError {
  const timedOut =
    cause instanceof Error &&
    (cause.name === "TimeoutError" || cause.name === "AbortError");

  return new OpenRouterError(
    timedOut ? "timeout" : "network",
    timedOut
      ? `openrouter timed out after ${timeoutMs}ms`
      : `openrouter request failed: ${(cause as Error).message}`,
  );
}

type ChatCompletionPayload = {
  model?: string;
  usage?: { completion_tokens?: number };
  error?: { message?: string; code?: number | string };
  choices?: {
    finish_reason?: string;
    message?: { content?: string | null; reasoning?: string | null };
  }[];
};

export { parseJsonObject } from "@/lib/ai/json";
