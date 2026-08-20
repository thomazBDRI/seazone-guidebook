import "server-only";

import type { z } from "zod";
import type { NearbyPois } from "@/lib/ai/geo";
import { fetchNearbyPois, geocodeAddress, hasPois } from "@/lib/ai/geo";
import {
  buildCorrectionMessages,
  buildGuideMessages,
} from "@/lib/ai/guide-prompt";
import { parseJsonObject } from "@/lib/ai/json";
import { createCompletion } from "@/lib/ai/openrouter";
import { mapAddress } from "@/lib/domain/display";
import { type GuideContent, GuideContentSchema } from "@/lib/domain/guide";
import type { Property } from "@/lib/domain/property";

/**
 * Guide generation: ground on OpenStreetMap when possible, let the LLM curate
 * and write, then validate. Nothing unvalidated is ever persisted.
 */

export type GenerationStage = "llm" | "validation";

export class GenerationError extends Error {
  readonly stage: GenerationStage;

  constructor(stage: GenerationStage, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GenerationError";
    this.stage = stage;
  }
}

export type GeneratedGuide = { content: GuideContent; model: string };

/** Hard ceiling on model calls, whatever mix of failures we hit. */
const MAX_ATTEMPTS = 3;
/**
 * Stop starting new attempts past this point. The route handler has 60s and
 * grounding has already spent some of it, so a late retry would be killed
 * mid-flight and persist nothing.
 */
const ATTEMPT_BUDGET_MS = 40_000;

export async function generateGuide(
  property: Property,
): Promise<GeneratedGuide> {
  const pois = await groundOnOsm(property);
  let messages = buildGuideMessages({ property, pois });

  const deadline = Date.now() + ATTEMPT_BUDGET_MS;
  let corrected = false;
  let lastError: GenerationError | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const hasBudget = attempt < MAX_ATTEMPTS && Date.now() < deadline;

    let completion: Awaited<ReturnType<typeof createCompletion>>;
    try {
      completion = await createCompletion({ messages, json: true });
    } catch (cause) {
      lastError = new GenerationError("llm", (cause as Error).message, {
        cause,
      });
      // free endpoints drop requests and return empty bodies under load
      if (isTransient(cause) && hasBudget) continue;
      throw lastError;
    }

    const parsed = validate(completion.text);
    if (parsed.success) {
      return { content: parsed.data, model: completion.model };
    }

    lastError = new GenerationError(
      "validation",
      `model output failed validation: ${parsed.issues}`,
    );
    // one correction turn only; a model that misses the contract twice is
    // not going to find it on a third pass
    if (corrected || !hasBudget) throw lastError;

    messages = buildCorrectionMessages(
      messages,
      completion.text,
      parsed.issues,
    );
    corrected = true;
  }

  throw lastError ?? new GenerationError("llm", "generation made no attempt");
}

/**
 * Whether another identical call is worth making. Deliberately duck-typed
 * rather than an `instanceof OpenRouterError`, so an error that crossed a
 * module or serialization boundary still classifies correctly.
 */
function isTransient(error: unknown): boolean {
  const { kind, status } = (error ?? {}) as {
    kind?: string;
    status?: number;
  };

  if (kind === "empty" || kind === "timeout" || kind === "network") return true;
  return status === 429 || (status !== undefined && status >= 500);
}

/**
 * Best-effort grounding. Returns null when the address cannot be located or
 * Overpass yields nothing, which switches the prompt to model knowledge only.
 */
async function groundOnOsm(property: Property): Promise<NearbyPois | null> {
  const point =
    (await geocodeAddress(mapAddress(property))) ??
    // a street that OSM does not know still narrows down to the city
    (await geocodeAddress(`${property.city}, ${property.state}, Brasil`));
  if (!point) return null;

  const pois = await fetchNearbyPois(point.lat, point.lon);
  return hasPois(pois) ? pois : null;
}

type ValidationOutcome =
  | { success: true; data: GuideContent }
  | { success: false; issues: string };

function validate(text: string): ValidationOutcome {
  let json: unknown;
  try {
    json = parseJsonObject(text);
  } catch {
    return { success: false, issues: "- a resposta não é um JSON válido" };
  }

  const result = GuideContentSchema.safeParse(json);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, issues: describeIssues(result.error) };
}

/** Zod issues as prompt-friendly bullets the model can act on. */
function describeIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 10)
    .map((issue) => {
      const path = issue.path.join(".");
      return `- ${path ? `${path}: ` : ""}${issue.message}`;
    })
    .join("\n");
}
