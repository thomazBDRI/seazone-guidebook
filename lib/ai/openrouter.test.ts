import { afterEach, describe, expect, it, vi } from "vitest";

// the real module reads Supabase/OpenRouter credentials at import time
vi.mock("@/lib/env", () => ({
  env: {
    OPENROUTER_API_KEY: "test-key",
    OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1",
    OPENROUTER_GUIDE_MODEL: "test/default-model:free",
  },
}));

const { createCompletion, OpenRouterError, streamCompletion } = await import(
  "@/lib/ai/openrouter"
);

const MESSAGES = [{ role: "user" as const, content: "oi" }];

function respondWith(body: string, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function completion(content: string, extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    model: "test/answering-model:free",
    choices: [{ finish_reason: "stop", message: { content } }],
    ...extra,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createCompletion", () => {
  it("returns the message text and the model that answered", async () => {
    respondWith(completion("bom dia"));

    await expect(createCompletion({ messages: MESSAGES })).resolves.toEqual({
      text: "bom dia",
      model: "test/answering-model:free",
    });
  });

  it("authenticates and defaults to the configured model", async () => {
    const fetchMock = respondWith(completion("ok"));
    await createCompletion({ messages: MESSAGES });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer test-key");

    const body = JSON.parse(init.body);
    expect(body.model).toBe("test/default-model:free");
    expect(body.messages).toEqual(MESSAGES);
    expect(body.response_format).toBeUndefined();
  });

  it("asks for a json object only when requested", async () => {
    const fetchMock = respondWith(completion("{}"));
    await createCompletion({ messages: MESSAGES, json: true });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("tolerates the whitespace padding sent to hold long requests open", async () => {
    respondWith(`\n   \n   \n${completion("demorou mas chegou")}`);

    await expect(
      createCompletion({ messages: MESSAGES }),
    ).resolves.toMatchObject({ text: "demorou mas chegou" });
  });

  it("reports an error delivered inside a 200 body, with its code", async () => {
    respondWith(
      JSON.stringify({
        error: { message: "rate limited upstream", code: 429 },
      }),
    );

    await expect(
      createCompletion({ messages: MESSAGES }),
    ).rejects.toMatchObject({
      name: "OpenRouterError",
      kind: "http",
      status: 429,
      message: expect.stringContaining("rate limited upstream"),
    });
  });

  it("reports a non-2xx response with its status", async () => {
    respondWith("upstream exploded", 503);

    await expect(
      createCompletion({ messages: MESSAGES }),
    ).rejects.toMatchObject({ kind: "http", status: 503 });
  });

  it("diagnoses an answer that carries no content", async () => {
    respondWith(
      JSON.stringify({
        choices: [
          {
            finish_reason: "length",
            message: { content: "", reasoning: "pensando".repeat(10) },
          },
        ],
        usage: { completion_tokens: 4000 },
      }),
    );

    await expect(
      createCompletion({ messages: MESSAGES }),
    ).rejects.toMatchObject({
      kind: "empty",
      message: expect.stringContaining("finish_reason=length"),
    });
  });

  it("reports an unparseable body instead of guessing", async () => {
    respondWith("<html>502 Bad Gateway</html>");

    await expect(
      createCompletion({ messages: MESSAGES }),
    ).rejects.toMatchObject({
      kind: "empty",
      message: expect.stringContaining("502 Bad Gateway"),
    });
  });

  it("classifies a timeout as a timeout, not as an empty answer", async () => {
    // the abort can land while the padded body is still streaming, long
    // after the headers arrived
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => {
          throw Object.assign(new Error("aborted"), { name: "TimeoutError" });
        },
      }),
    );

    await expect(
      createCompletion({ messages: MESSAGES, timeoutMs: 1234 }),
    ).rejects.toMatchObject({
      kind: "timeout",
      message: expect.stringContaining("1234ms"),
    });
  });

  it("classifies a connection failure as a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));

    await expect(
      createCompletion({ messages: MESSAGES }),
    ).rejects.toMatchObject({ kind: "network" });
  });

  it("exposes its error type for callers that branch on it", async () => {
    respondWith("not json");

    await expect(
      createCompletion({ messages: MESSAGES }),
    ).rejects.toBeInstanceOf(OpenRouterError);
  });
});

/** Serves the given SSE chunks as a streamed body. */
function streamWith(chunks: string[], status = 200) {
  const encoder = new TextEncoder();
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => chunks.join(""),
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function frame(content: string) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

async function collect(deltas: AsyncGenerator<string>) {
  const received: string[] = [];
  for await (const delta of deltas) received.push(delta);
  return received;
}

describe("streamCompletion", () => {
  it("yields the content deltas as they arrive", async () => {
    streamWith([
      frame("A senha "),
      frame("é floripa2024."),
      "data: [DONE]\n\n",
    ]);

    const { deltas } = await streamCompletion({ messages: MESSAGES });

    await expect(collect(deltas)).resolves.toEqual([
      "A senha ",
      "é floripa2024.",
    ]);
  });

  it("asks for a stream, and for reasoning it never shows the guest", async () => {
    const fetchMock = streamWith([frame("ok")]);

    await streamCompletion({ messages: MESSAGES, model: "test/chat:free" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.stream).toBe(true);
    expect(body.model).toBe("test/chat:free");
    expect(body.reasoning).toEqual({ effort: "low", exclude: true });
    expect(body.messages).toEqual(MESSAGES);
  });

  it("fails before any token when the upstream rejects the request", async () => {
    streamWith(["quota exhausted"], 429);

    await expect(
      streamCompletion({ messages: MESSAGES }),
    ).rejects.toMatchObject({ kind: "http", status: 429 });
  });

  it("fails mid-stream when an error frame arrives inside a 200", async () => {
    streamWith([
      frame("A senha "),
      'data: {"error":{"message":"provider dropped"}}\n\n',
    ]);

    const { deltas } = await streamCompletion({ messages: MESSAGES });

    await expect(collect(deltas)).rejects.toMatchObject({
      kind: "http",
      message: expect.stringContaining("provider dropped"),
    });
  });

  it("ends without deltas when the model answers nothing", async () => {
    streamWith(["data: [DONE]\n\n"]);

    const { deltas } = await streamCompletion({ messages: MESSAGES });

    await expect(collect(deltas)).resolves.toEqual([]);
  });
});
