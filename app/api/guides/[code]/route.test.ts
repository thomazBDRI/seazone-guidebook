import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fln001 } from "@/test/fixtures/property";

const generateGuide = vi.fn();
const getPropertyByCode = vi.fn();
const getGuideByPropertyId = vi.fn();
const tryAcquireGenerationLock = vi.fn();
const markGuideReady = vi.fn();
const markGuideFailed = vi.fn();
const clearFailedGuide = vi.fn();
const getLocale = vi.fn();

vi.mock("@/lib/ai/guide-pipeline", () => ({
  generateGuide: (...args: unknown[]) => generateGuide(...args),
}));

vi.mock("@/lib/repositories/properties", () => ({
  getPropertyByCode: (...args: unknown[]) => getPropertyByCode(...args),
}));

vi.mock("@/lib/i18n/server", () => ({ getLocale: () => getLocale() }));

vi.mock("@/lib/repositories/guides", () => ({
  getGuideByPropertyId: (...args: unknown[]) => getGuideByPropertyId(...args),
  tryAcquireGenerationLock: (...args: unknown[]) =>
    tryAcquireGenerationLock(...args),
  markGuideReady: (...args: unknown[]) => markGuideReady(...args),
  markGuideFailed: (...args: unknown[]) => markGuideFailed(...args),
  clearFailedGuide: (...args: unknown[]) => clearFailedGuide(...args),
}));

const { GET, POST } = await import("@/app/api/guides/[code]/route");

const request = {} as NextRequest;
const context = (code: string) => ({ params: Promise.resolve({ code }) });

const GUIDE_CONTENT = { welcome_message: "Bem-vindo!" };

async function body(response: Response) {
  return (await response.json()) as { status: string; message?: string };
}

beforeEach(() => {
  vi.clearAllMocks();
  getLocale.mockResolvedValue("pt-BR");
  getPropertyByCode.mockResolvedValue(fln001);
  getGuideByPropertyId.mockResolvedValue(null);
  tryAcquireGenerationLock.mockResolvedValue(true);
  generateGuide.mockResolvedValue({
    content: GUIDE_CONTENT,
    model: "test-model",
  });
});

describe("POST /api/guides/[code]", () => {
  it("generates and persists when no guide exists yet", async () => {
    const response = await POST(request, context("FLN001"));

    expect(await body(response)).toEqual({ status: "ready" });
    expect(generateGuide).toHaveBeenCalledWith(fln001);
    expect(markGuideReady).toHaveBeenCalledWith(
      fln001.id,
      "pt-BR",
      GUIDE_CONTENT,
      "test-model",
    );
  });

  it("never regenerates a ready guide", async () => {
    getGuideByPropertyId.mockResolvedValue({ status: "ready" });

    const response = await POST(request, context("FLN001"));

    expect(await body(response)).toEqual({ status: "ready" });
    expect(tryAcquireGenerationLock).not.toHaveBeenCalled();
    expect(generateGuide).not.toHaveBeenCalled();
  });

  it("reports pending without generating when another caller holds the lock", async () => {
    getGuideByPropertyId.mockResolvedValue({ status: "pending" });
    tryAcquireGenerationLock.mockResolvedValue(false);

    const response = await POST(request, context("FLN001"));

    expect(await body(response)).toEqual({ status: "pending" });
    expect(generateGuide).not.toHaveBeenCalled();
  });

  it("clears a failed guide so the retry can take the lock", async () => {
    getGuideByPropertyId.mockResolvedValue({ status: "failed" });

    const response = await POST(request, context("FLN001"));

    expect(clearFailedGuide).toHaveBeenCalledWith(fln001.id, "pt-BR");
    expect(await body(response)).toEqual({ status: "ready" });
    expect(generateGuide).toHaveBeenCalledTimes(1);
  });

  it("persists the failure and hides the internal reason from the guest", async () => {
    generateGuide.mockRejectedValue(
      new Error("openrouter returned 429: quota exhausted for sk-or-v1-secret"),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request, context("FLN001"));

    expect(response.status).toBe(502);
    expect(await body(response)).toEqual({
      status: "failed",
      message: "guide generation failed",
    });
    expect(markGuideFailed).toHaveBeenCalledWith(
      fln001.id,
      "pt-BR",
      expect.stringContaining("openrouter returned 429"),
    );
  });

  it("keeps each locale as its own guide, lock included", async () => {
    getLocale.mockResolvedValue("en");

    await POST(request, context("FLN001"));

    expect(getGuideByPropertyId).toHaveBeenCalledWith(fln001.id, "en");
    expect(tryAcquireGenerationLock).toHaveBeenCalledWith(fln001.id, "en");
    expect(markGuideReady).toHaveBeenCalledWith(
      fln001.id,
      "en",
      GUIDE_CONTENT,
      "test-model",
    );
  });

  it("404s an unknown property", async () => {
    getPropertyByCode.mockResolvedValue(null);

    const response = await POST(request, context("ZZZ999"));

    expect(response.status).toBe(404);
    expect(await body(response)).toEqual({ status: "not_found" });
  });

  it("404s a malformed code without touching the database", async () => {
    for (const code of [
      "",
      "a",
      "../../etc/passwd",
      "FLN 001",
      "x".repeat(25),
    ]) {
      const response = await POST(request, context(code));

      expect(response.status).toBe(404);
    }
    expect(getPropertyByCode).not.toHaveBeenCalled();
  });
});

describe("GET /api/guides/[code]", () => {
  it("reports the persisted status for polling", async () => {
    for (const status of ["pending", "ready", "failed"]) {
      getGuideByPropertyId.mockResolvedValue({ status });

      expect(await body(await GET(request, context("FLN001")))).toEqual({
        status,
      });
    }
  });

  it("polls the locale the guest is reading in", async () => {
    getLocale.mockResolvedValue("es");

    await GET(request, context("FLN001"));

    expect(getGuideByPropertyId).toHaveBeenCalledWith(fln001.id, "es");
  });

  it("reports absent when there is no row at all", async () => {
    const response = await GET(request, context("FLN001"));

    expect(await body(response)).toEqual({ status: "absent" });
  });

  it("404s an unknown property", async () => {
    getPropertyByCode.mockResolvedValue(null);

    expect((await GET(request, context("ZZZ999"))).status).toBe(404);
  });
});
