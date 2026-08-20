/**
 * Stand-in for OpenRouter used by the E2E suite.
 *
 * The app talks to a single OpenAI-compatible endpoint (see
 * lib/ai/openrouter.ts), so pointing OPENROUTER_BASE_URL at this server makes
 * every AI feature deterministic: no network, no rate limits, no free-model
 * flakiness. Answers are canned, and the streaming path emits real SSE frames
 * spaced far enough apart that a test can observe the answer growing.
 *
 * Usage: PORT=3201 bun run test/e2e/stub-openrouter.ts
 */
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3201);
/** Wide enough for Playwright to catch a partial answer between polls. */
const DELTA_DELAY_MS = 80;

/**
 * Canned answers, keyed by a word in the guest's question. The Wi-Fi one is
 * the answer the streaming test asserts on; the rest exist so the other
 * suggestion chips do not all reply about Wi-Fi.
 */
const ANSWERS: { match: RegExp; deltas: string[] }[] = [
  {
    match: /wi-?fi|senha|internet/i,
    deltas: ["A senha do Wi-Fi é ", "floripa2024", "."],
  },
  {
    match: /cachorro|pet|animal/i,
    deltas: [
      "Neste imóvel ",
      "não é permitido animais de estimação",
      ". Fale com a anfitriã se precisar de ajuda.",
    ],
  },
  {
    match: /check-?in|hor[áa]rio/i,
    deltas: ["O check-in ", "começa às 15:00", " e o check-out é às 11:00."],
  },
  {
    match: /restaurante|comer|jantar/i,
    deltas: [
      "Perto do imóvel ",
      "você encontra o Ostradamus e o Bar do Arante",
      ", ambos a poucos minutos.",
    ],
  },
];

const FALLBACK_DELTAS = [
  "Sobre isso ",
  "posso ajudar com Wi-Fi, regras e horários",
  ". Para o resto, fale com a anfitriã no WhatsApp.",
];

/** Valid GuideContent (lib/domain/guide.ts) for the generation pipeline. */
const CANNED_GUIDE = {
  welcome_message:
    "Bem-vindo! Preparamos um guia da região para a sua estadia.",
  restaurants: [
    {
      name: "Restaurante Stub 1",
      distance: "300 m",
      description: "Cozinha local em um ambiente tranquilo.",
    },
    {
      name: "Restaurante Stub 2",
      distance: "700 m",
      description: "Frutos do mar frescos e atendimento rápido.",
    },
  ],
  attractions: [
    {
      name: "Atração Stub",
      distance: "1,2 km",
      description: "Mirante com vista para o mar, ótimo no fim da tarde.",
    },
  ],
  essentials: [
    {
      name: "Farmácia Stub",
      type: "Farmácia",
      distance: "250 m",
      description: "Aberta todos os dias até as 22h.",
    },
  ],
  seasonal_tip: "Leve protetor solar: os dias andam longos e quentes.",
};

type CompletionRequest = {
  model?: string;
  stream?: boolean;
  response_format?: { type?: string };
  messages?: { role: string; content: string }[];
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);

  // readiness probe for Playwright's webServer
  if (request.method === "GET" && url.pathname === "/health") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("ok");
    return;
  }

  if (request.method !== "POST" || url.pathname !== "/chat/completions") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: { message: "not found" } }));
    return;
  }

  const payload = await readJson(request);
  const model = payload?.model ?? "stub/model";

  if (payload?.stream) {
    streamAnswer(response, model, deltasFor(payload));
    return;
  }

  const wantsJson = payload?.response_format?.type === "json_object";
  const content = wantsJson
    ? JSON.stringify(CANNED_GUIDE)
    : deltasFor(payload).join("");

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      id: "stub-completion",
      model,
      choices: [
        { finish_reason: "stop", message: { role: "assistant", content } },
      ],
      usage: { completion_tokens: content.length },
    }),
  );
});

function deltasFor(payload: CompletionRequest | null): string[] {
  const question = payload?.messages?.at(-1)?.content ?? "";
  return (
    ANSWERS.find((answer) => answer.match.test(question))?.deltas ??
    FALLBACK_DELTAS
  );
}

/** Same wire format as OpenRouter: `data:` frames, one delta each, then [DONE]. */
function streamAnswer(
  response: import("node:http").ServerResponse,
  model: string,
  deltas: string[],
): void {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let index = 0;
  const timer = setInterval(() => {
    if (index >= deltas.length) {
      clearInterval(timer);
      response.write("data: [DONE]\n\n");
      response.end();
      return;
    }
    const frame = {
      id: "stub-stream",
      model,
      choices: [{ delta: { content: deltas[index] } }],
    };
    response.write(`data: ${JSON.stringify(frame)}\n\n`);
    index += 1;
  }, DELTA_DELAY_MS);

  response.on("close", () => clearInterval(timer));
}

async function readJson(
  request: import("node:http").IncomingMessage,
): Promise<CompletionRequest | null> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

server.listen(PORT, () => {
  console.log(`openrouter stub listening on http://localhost:${PORT}`);
});
