/**
 * Incremental parser for OpenRouter's SSE stream. Pure (no network, no env) so
 * the wire contract is unit-testable: network chunks split lines at arbitrary
 * points, so the trailing partial line is held back until its newline arrives.
 */

export type StreamEvent =
  | { kind: "delta"; text: string }
  | { kind: "error"; message: string };

const DATA_PREFIX = "data:";
const DONE_PAYLOAD = "[DONE]";

export type SseDeltaParser = {
  /** Content deltas (and upstream errors) contained in this chunk. */
  push(chunk: string): StreamEvent[];
};

export function createSseDeltaParser(): SseDeltaParser {
  let pending = "";

  return {
    push(chunk) {
      const lines = (pending + chunk).split("\n");
      // last element is "" when the chunk ended on a newline, a partial line
      // otherwise — either way it is not ready to be parsed yet
      pending = lines.pop() ?? "";

      const events: StreamEvent[] = [];
      for (const line of lines) {
        const event = parseLine(line);
        if (event) events.push(event);
      }
      return events;
    },
  };
}

function parseLine(line: string): StreamEvent | null {
  const trimmed = line.trim();
  // blank separators and SSE comments (OpenRouter sends ": OPENROUTER
  // PROCESSING" keep-alives while the model warms up)
  if (!trimmed || trimmed.startsWith(":")) return null;
  if (!trimmed.startsWith(DATA_PREFIX)) return null;

  const payload = trimmed.slice(DATA_PREFIX.length).trim();
  if (!payload || payload === DONE_PAYLOAD) return null;

  let parsed: StreamPayload;
  try {
    parsed = JSON.parse(payload) as StreamPayload;
  } catch {
    // a malformed frame is not worth killing a good answer over
    return null;
  }

  if (parsed.error) {
    return {
      kind: "error",
      message: parsed.error.message ?? "unknown upstream error",
    };
  }

  const text = parsed.choices?.[0]?.delta?.content;
  return text ? { kind: "delta", text } : null;
}

type StreamPayload = {
  error?: { message?: string; code?: number | string };
  choices?: { delta?: { content?: string | null } }[];
};
