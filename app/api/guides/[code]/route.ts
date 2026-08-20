import type { NextRequest } from "next/server";
import { z } from "zod";
import { generateGuide } from "@/lib/ai/guide-pipeline";
import { getLocale } from "@/lib/i18n/server";
import {
  clearFailedGuide,
  getGuideByPropertyId,
  markGuideFailed,
  markGuideReady,
  tryAcquireGenerationLock,
} from "@/lib/repositories/guides";
import { getPropertyByCode } from "@/lib/repositories/properties";

/**
 * Guide generation endpoint. The guide is generated once per property and
 * persisted, so this is idempotent: the `pending` row is the lock, and callers
 * that lose the race just poll GET until the winner finishes.
 */
export const maxDuration = 60;

/** Public codes are short alphanumerics ("FLN001"); anything else is a 404. */
const CodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(24)
  .regex(/^[A-Za-z0-9-]+$/);

/** Spelled out rather than using the generated `RouteContext`, which only
 * exists after a `next typegen` and would break a standalone `tsc --noEmit`. */
type Context = { params: Promise<{ code: string }> };

export async function POST(_request: NextRequest, context: Context) {
  const code = CodeSchema.safeParse((await context.params).code);
  if (!code.success) return notFound();

  const property = await getPropertyByCode(code.data);
  if (!property) return notFound();

  // the guide is written in the language the guest is reading the page in;
  // taken from the cookie server-side, never from the request body
  const locale = await getLocale();

  const existing = await getGuideByPropertyId(property.id, locale);
  if (existing?.status === "ready") {
    return Response.json({ status: "ready" });
  }
  if (existing?.status === "failed") {
    // let the guest retry a failed generation
    await clearFailedGuide(property.id, locale);
  }

  const acquired = await tryAcquireGenerationLock(property.id, locale);
  if (!acquired) {
    return Response.json({ status: "pending" });
  }

  try {
    const { content, model } = await generateGuide(property);
    await markGuideReady(property.id, locale, content, model);
    return Response.json({ status: "ready" });
  } catch (cause) {
    const message = (cause as Error).message ?? "unknown error";
    console.error(
      `guide generation failed for ${property.code} (${locale}):`,
      cause,
    );
    await markGuideFailed(property.id, locale, message.slice(0, 1000));
    // the internal reason stays in the logs and the failed row
    return Response.json(
      { status: "failed", message: "guide generation failed" },
      { status: 502 },
    );
  }
}

/** Polling endpoint for callers waiting on someone else's generation. */
export async function GET(_request: NextRequest, context: Context) {
  const code = CodeSchema.safeParse((await context.params).code);
  if (!code.success) return notFound();

  const property = await getPropertyByCode(code.data);
  if (!property) return notFound();

  const guide = await getGuideByPropertyId(property.id, await getLocale());
  return Response.json({ status: guide?.status ?? "absent" });
}

function notFound() {
  return Response.json({ status: "not_found" }, { status: 404 });
}
