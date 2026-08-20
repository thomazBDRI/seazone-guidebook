import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/locale/route";
import { LOCALES } from "@/lib/i18n/locales";

function request(body: unknown): NextRequest {
  return new Request("http://localhost/api/locale", {
    method: "POST",
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/locale", () => {
  it("persists every supported locale in the cookie", async () => {
    for (const locale of LOCALES) {
      const response = await POST(request({ locale }));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ locale });

      const cookie = response.cookies.get("locale");
      expect(cookie?.value).toBe(locale);
      expect(cookie?.path).toBe("/");
      // the guest keeps the language for the whole stay
      expect(cookie?.maxAge).toBe(60 * 60 * 24 * 365);
    }
  });

  it("rejects anything that is not a supported locale, cookie untouched", async () => {
    const payloads: unknown[] = [
      null,
      {},
      { locale: "" },
      { locale: "de" },
      { locale: "pt" },
      { locale: "en-US" },
      { locale: ["en"] },
      { locale: "<script>alert(1)</script>" },
    ];

    for (const payload of payloads) {
      const response = await POST(request(payload));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "invalid_locale" });
    }
  });
});
