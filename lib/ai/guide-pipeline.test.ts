import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyPois, type NearbyPois } from "@/lib/ai/geo";
import { fln001 } from "@/test/fixtures/property";

const geocodeAddress = vi.fn();
const fetchNearbyPois = vi.fn();
const createCompletion = vi.fn();

// only the network edges are faked; grouping/formatting helpers stay real
vi.mock("@/lib/ai/geo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/geo")>()),
  geocodeAddress: (...args: unknown[]) => geocodeAddress(...args),
  fetchNearbyPois: (...args: unknown[]) => fetchNearbyPois(...args),
}));

vi.mock("@/lib/ai/openrouter", () => ({
  createCompletion: (...args: unknown[]) => createCompletion(...args),
}));

const { GenerationError, generateGuide } = await import(
  "@/lib/ai/guide-pipeline"
);

const POINT = { lat: -27.5865, lon: -48.5249 };

function poisFixture(): NearbyPois {
  return {
    ...emptyPois(),
    restaurants: [{ name: "Box 32", distance: "≈ 1,2 km", meters: 1200 }],
    attractions: [
      { name: "Morro da Cruz", distance: "≈ 2,1 km", meters: 2100 },
    ],
    pharmacies: [{ name: "Farmácia Panvel", distance: "≈ 300 m", meters: 300 }],
  };
}

const VALID_GUIDE = {
  welcome_message: "Bem-vindo ao seu apartamento na Trindade.",
  restaurants: [
    {
      name: "Box 32",
      distance: "≈ 1,2 km",
      description: "Boteco do Mercado Público.",
    },
  ],
  attractions: [
    {
      name: "Morro da Cruz",
      distance: "≈ 2,1 km",
      description: "Mirante com vista da ilha.",
    },
  ],
  essentials: [
    {
      name: "Farmácia Panvel",
      type: "farmácia",
      distance: "≈ 300 m",
      description: "Aberta até tarde.",
    },
  ],
  seasonal_tip: "Agosto é mês de baleias no litoral catarinense.",
};

/** The text of every message sent to the model, across all calls. */
function sentPrompts(): string {
  return createCompletion.mock.calls
    .flatMap((call) => call[0].messages)
    .map((message: { content: string }) => message.content)
    .join("\n");
}

beforeEach(() => {
  vi.clearAllMocks();
  geocodeAddress.mockResolvedValue(POINT);
  fetchNearbyPois.mockResolvedValue(poisFixture());
  createCompletion.mockResolvedValue({
    text: JSON.stringify(VALID_GUIDE),
    model: "test-model",
  });
});

describe("generateGuide", () => {
  it("grounds on OSM and returns the validated content with its model", async () => {
    const result = await generateGuide(fln001);

    expect(result.content).toEqual(VALID_GUIDE);
    expect(result.model).toBe("test-model");
    expect(geocodeAddress).toHaveBeenCalledWith(
      "Rua Lauro Linhares, 589, Trindade, Florianópolis - SC",
    );
    expect(fetchNearbyPois).toHaveBeenCalledWith(POINT.lat, POINT.lon);
    expect(createCompletion).toHaveBeenCalledTimes(1);
  });

  it("asks for json mode and feeds the candidates into the prompt", async () => {
    await generateGuide(fln001);

    expect(createCompletion.mock.calls[0][0].json).toBe(true);
    expect(sentPrompts()).toContain("- Box 32 | ≈ 1,2 km");
  });

  it("recovers content wrapped in a markdown fence", async () => {
    createCompletion.mockResolvedValue({
      text: `Claro! Segue o guia:\n\`\`\`json\n${JSON.stringify(VALID_GUIDE)}\n\`\`\``,
      model: "chatty-model",
    });

    const result = await generateGuide(fln001);

    expect(result.content).toEqual(VALID_GUIDE);
    expect(createCompletion).toHaveBeenCalledTimes(1);
  });

  it("retries once with the validation errors and accepts the second answer", async () => {
    createCompletion
      .mockResolvedValueOnce({ text: "desculpe, não entendi", model: "m" })
      .mockResolvedValueOnce({
        text: JSON.stringify(VALID_GUIDE),
        model: "m",
      });

    const result = await generateGuide(fln001);

    expect(result.content).toEqual(VALID_GUIDE);
    expect(createCompletion).toHaveBeenCalledTimes(2);

    const retryMessages = createCompletion.mock.calls[1][0].messages;
    expect(retryMessages.at(-2)).toEqual({
      role: "assistant",
      content: "desculpe, não entendi",
    });
    expect(retryMessages.at(-1).content).toContain("não respeitou o contrato");
  });

  it("tells the model which fields the validator rejected", async () => {
    createCompletion
      .mockResolvedValueOnce({
        text: JSON.stringify({ ...VALID_GUIDE, restaurants: undefined }),
        model: "m",
      })
      .mockResolvedValueOnce({
        text: JSON.stringify(VALID_GUIDE),
        model: "m",
      });

    await generateGuide(fln001);

    expect(createCompletion.mock.calls[1][0].messages.at(-1).content).toContain(
      "restaurants",
    );
  });

  it("gives up after the correction turn also fails validation", async () => {
    createCompletion.mockResolvedValue({ text: "{}", model: "m" });

    await expect(generateGuide(fln001)).rejects.toThrow(GenerationError);
    await expect(generateGuide(fln001)).rejects.toMatchObject({
      stage: "validation",
    });
    // one correction turn per call, never a third pass
    expect(createCompletion).toHaveBeenCalledTimes(4);
  });

  it("retries an empty response, which free endpoints return under load", async () => {
    createCompletion
      .mockRejectedValueOnce(
        Object.assign(new Error("model returned no content"), {
          kind: "empty",
        }),
      )
      .mockResolvedValueOnce({
        text: JSON.stringify(VALID_GUIDE),
        model: "m",
      });

    const result = await generateGuide(fln001);

    expect(result.content).toEqual(VALID_GUIDE);
    expect(createCompletion).toHaveBeenCalledTimes(2);
    // the same prompt is replayed, not a correction turn
    expect(createCompletion.mock.calls[1][0].messages).toEqual(
      createCompletion.mock.calls[0][0].messages,
    );
  });

  it("retries a rate limit and a timeout too", async () => {
    for (const transient of [
      Object.assign(new Error("429"), { kind: "http", status: 429 }),
      Object.assign(new Error("502"), { kind: "http", status: 502 }),
      Object.assign(new Error("timed out"), { kind: "timeout" }),
      Object.assign(new Error("fetch failed"), { kind: "network" }),
    ]) {
      vi.clearAllMocks();
      createCompletion.mockRejectedValueOnce(transient).mockResolvedValueOnce({
        text: JSON.stringify(VALID_GUIDE),
        model: "m",
      });

      await expect(generateGuide(fln001)).resolves.toMatchObject({
        content: VALID_GUIDE,
      });
      expect(createCompletion).toHaveBeenCalledTimes(2);
    }
  });

  it("stops after the attempt ceiling when the failure never clears", async () => {
    createCompletion.mockRejectedValue(
      Object.assign(new Error("model returned no content"), { kind: "empty" }),
    );

    await expect(generateGuide(fln001)).rejects.toMatchObject({
      name: "GenerationError",
      stage: "llm",
    });
    expect(createCompletion).toHaveBeenCalledTimes(3);
  });

  it("does not retry a failure another identical call cannot fix", async () => {
    createCompletion.mockRejectedValue(
      Object.assign(new Error("openrouter returned 401: invalid key"), {
        kind: "http",
        status: 401,
      }),
    );

    await expect(generateGuide(fln001)).rejects.toMatchObject({
      name: "GenerationError",
      stage: "llm",
      message: "openrouter returned 401: invalid key",
    });
    expect(createCompletion).toHaveBeenCalledTimes(1);
  });

  describe("OSM degradation", () => {
    it("falls back to the city when the street cannot be geocoded", async () => {
      geocodeAddress.mockResolvedValueOnce(null).mockResolvedValueOnce(POINT);

      await generateGuide(fln001);

      expect(geocodeAddress).toHaveBeenLastCalledWith(
        "Florianópolis, SC, Brasil",
      );
      expect(sentPrompts()).toContain("- Box 32 | ≈ 1,2 km");
    });

    it("uses the knowledge-only prompt when geocoding fails entirely", async () => {
      geocodeAddress.mockResolvedValue(null);

      const result = await generateGuide(fln001);

      expect(result.content).toEqual(VALID_GUIDE);
      expect(fetchNearbyPois).not.toHaveBeenCalled();
      expect(sentPrompts()).toContain("Não há lista de lugares mapeados");
      expect(sentPrompts()).toContain(
        "FAMOSOS e consolidados de Florianópolis",
      );
    });

    it("uses the knowledge-only prompt when Overpass returns nothing", async () => {
      fetchNearbyPois.mockResolvedValue(emptyPois());

      await generateGuide(fln001);

      expect(sentPrompts()).toContain("Não há lista de lugares mapeados");
      expect(sentPrompts()).not.toContain("Lugares reais mapeados");
    });
  });
});
