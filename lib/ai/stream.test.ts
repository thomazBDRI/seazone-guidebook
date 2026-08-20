import { describe, expect, it } from "vitest";
import { createSseDeltaParser } from "@/lib/ai/stream";

function frame(content: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

function textOf(
  parser: ReturnType<typeof createSseDeltaParser>,
  chunk: string,
) {
  return parser
    .push(chunk)
    .map((event) =>
      event.kind === "delta" ? event.text : `!${event.message}`,
    );
}

describe("createSseDeltaParser", () => {
  it("extracts content deltas in order", () => {
    const parser = createSseDeltaParser();

    expect(textOf(parser, frame("A ") + frame("senha ") + frame("é"))).toEqual([
      "A ",
      "senha ",
      "é",
    ]);
  });

  it("holds a line back until the rest of it arrives", () => {
    const parser = createSseDeltaParser();
    const whole = frame("floripa2024");
    const cut = whole.slice(0, 24);

    expect(textOf(parser, cut)).toEqual([]);
    expect(textOf(parser, whole.slice(24))).toEqual(["floripa2024"]);
  });

  it("reassembles a delta split across three chunks", () => {
    const parser = createSseDeltaParser();
    const whole = frame("check-in às 15h");

    const collected = [
      ...textOf(parser, whole.slice(0, 10)),
      ...textOf(parser, whole.slice(10, 30)),
      ...textOf(parser, whole.slice(30)),
    ];

    expect(collected).toEqual(["check-in às 15h"]);
  });

  it("ignores keep-alive comments, blank lines and [DONE]", () => {
    const parser = createSseDeltaParser();

    expect(
      textOf(
        parser,
        `: OPENROUTER PROCESSING\n\n${frame("oi")}\ndata: [DONE]\n\n`,
      ),
    ).toEqual(["oi"]);
  });

  it("ignores frames without content, including role-only openers", () => {
    const parser = createSseDeltaParser();

    expect(
      textOf(
        parser,
        'data: {"choices":[{"delta":{"role":"assistant"}}]}\n' +
          'data: {"choices":[{"delta":{"content":null}}]}\n' +
          'data: {"choices":[{"delta":{"content":""}}]}\n' +
          "data: not json at all\n",
      ),
    ).toEqual([]);
  });

  it("surfaces an error frame that arrives inside a 200 stream", () => {
    const parser = createSseDeltaParser();

    expect(
      textOf(
        parser,
        `${frame("oi")}data: {"error":{"message":"rate limited","code":429}}\n`,
      ),
    ).toEqual(["oi", "!rate limited"]);
  });

  it("handles crlf line endings", () => {
    const parser = createSseDeltaParser();

    expect(textOf(parser, frame("ok").replace(/\n/g, "\r\n"))).toEqual(["ok"]);
  });
});
