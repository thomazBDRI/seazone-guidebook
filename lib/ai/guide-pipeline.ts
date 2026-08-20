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

export async function generateGuide(
  property: Property,
): Promise<GeneratedGuide> {
  const pois = await groundOnOsm(property);
  const messages = buildGuideMessages({ property, pois });

  const first = await complete(messages);
  const parsed = validate(first.text);
  if (parsed.success) {
    return { content: parsed.data, model: first.model };
  }

  // one retry: free models routinely miss the contract on the first pass
  const retry = await complete(
    buildCorrectionMessages(messages, first.text, parsed.issues),
  );
  const retried = validate(retry.text);
  if (retried.success) {
    return { content: retried.data, model: retry.model };
  }

  throw new GenerationError(
    "validation",
    `model output failed validation twice: ${retried.issues}`,
  );
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

async function complete(
  messages: Parameters<typeof createCompletion>[0]["messages"],
) {
  try {
    return await createCompletion({ messages, json: true });
  } catch (cause) {
    throw new GenerationError("llm", (cause as Error).message, { cause });
  }
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
