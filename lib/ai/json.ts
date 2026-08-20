/**
 * Defensive JSON recovery for LLM output. Free models wrap objects in markdown
 * fences or prepend prose even when the prompt and `response_format` both ask
 * for a bare object, so the happy path is never assumed.
 *
 * Pure and dependency-free: usable without the server-only OpenRouter client.
 */

export class JsonRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonRecoveryError";
  }
}

/** Returns the first parseable JSON object found in the text. */
export function parseJsonObject(text: string): unknown {
  const candidates = [text.trim(), stripFences(text), extractBraces(text)];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // fall through to the next, more aggressive, recovery
    }
  }
  throw new JsonRecoveryError("model output is not parseable as json");
}

function stripFences(text: string): string | null {
  const match = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  return match ? match[1].trim() : null;
}

/** Outermost {...} span, for output with prose or reasoning around it. */
function extractBraces(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : null;
}
