import type { NextRequest } from "next/server";
import { z } from "zod";
import { buildChatMessages } from "@/lib/ai/chat-prompt";
import { streamCompletion } from "@/lib/ai/openrouter";
import { GuideContentSchema } from "@/lib/domain/guide";
import { env } from "@/lib/env";
import { getLocale } from "@/lib/i18n/server";
import { getGuideByPropertyId } from "@/lib/repositories/guides";
import { getPropertyByCode } from "@/lib/repositories/properties";

/**
 * Streaming chat endpoint. The client sends only `{ code, messages }`: the
 * property data and the guide are assembled into the system prompt server-side,
 * so the browser can neither see nor tamper with the grounding context.
 *
 * The response body is a plain UTF-8 text stream of content deltas — the
 * simplest contract the widget can consume, and it keeps SSE framing (an
 * OpenRouter implementation detail) off the wire to the browser.
 */
export const maxDuration = 60;

/** Public codes are short alphanumerics ("FLN001"); anything else is a 404. */
const CodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(24)
  .regex(/^[A-Za-z0-9-]+$/);

/** Caps keep a hostile client from turning the context window into a payload. */
const MAX_HISTORY = 12;
const MAX_CONTENT = 1000;

const RequestSchema = z.object({
  code: CodeSchema,
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_CONTENT),
      }),
    )
    .min(1)
    .max(MAX_HISTORY)
    .refine((messages) => messages.at(-1)?.role === "user", {
      message: "the last message must come from the guest",
    }),
});

const APOLOGY =
  "\n\n(Desculpe, minha resposta foi interrompida. Pode perguntar de novo?)";

export async function POST(request: NextRequest) {
  const payload = RequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!payload.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const property = await getPropertyByCode(payload.data.code);
  if (!property) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const guide = await getGuideByPropertyId(property.id);
  // an unreadable payload is treated as "no guide yet": the assistant still
  // answers everything that comes from the property row
  const parsed =
    guide?.status === "ready"
      ? GuideContentSchema.safeParse(guide.content)
      : null;

  // server-side, never a body field: the locale decides what the assistant
  // says, so a client must not be able to set it per request
  const locale = await getLocale();

  const messages = buildChatMessages({
    property,
    guideContent: parsed?.success ? parsed.data : null,
    history: payload.data.messages,
    locale,
  });

  let first: IteratorResult<string>;
  let deltas: AsyncGenerator<string>;
  try {
    const stream = await streamCompletion({
      messages,
      model: env.OPENROUTER_CHAT_MODEL,
    });
    deltas = stream.deltas;
    // the first token is awaited before the response is committed, so an
    // upstream refusal (or a model that answers nothing at all) is still a
    // clean 502 instead of an empty 200 body
    first = await deltas.next();
  } catch (cause) {
    console.error(`chat failed for ${property.code}:`, cause);
    return upstreamFailure();
  }

  if (first.done) {
    console.error(`chat produced no tokens for ${property.code}`);
    return upstreamFailure();
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(first.value));
      try {
        for await (const delta of deltas) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch (cause) {
        // the answer is already on screen: close it with an apology rather
        // than an error the guest cannot act on
        console.error(`chat stream broke for ${property.code}:`, cause);
        controller.enqueue(encoder.encode(APOLOGY));
      }
      controller.close();
    },
    cancel() {
      void deltas.return(undefined);
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // keeps proxies from buffering the answer into a single chunk
      "X-Accel-Buffering": "no",
    },
  });
}

function upstreamFailure() {
  return Response.json({ error: "assistant_unavailable" }, { status: 502 });
}
