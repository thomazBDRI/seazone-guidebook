import { describe, expect, it } from "vitest";
import { JsonRecoveryError, parseJsonObject } from "@/lib/ai/json";

describe("parseJsonObject", () => {
  it("parses a bare object", () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseJsonObject('\n\n  {"a":1}\n')).toEqual({ a: 1 });
  });

  it("strips a markdown fence", () => {
    expect(parseJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJsonObject('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("extracts the object from surrounding prose", () => {
    expect(
      parseJsonObject('Claro! Segue: {"a":1} Espero ter ajudado.'),
    ).toEqual({ a: 1 });
  });

  it("keeps nested braces intact", () => {
    expect(parseJsonObject('texto {"a":{"b":[1,2]}} fim')).toEqual({
      a: { b: [1, 2] },
    });
  });

  it("throws when there is no object to recover", () => {
    expect(() => parseJsonObject("desculpe, não entendi")).toThrow(
      JsonRecoveryError,
    );
    expect(() => parseJsonObject("")).toThrow(JsonRecoveryError);
  });
});
