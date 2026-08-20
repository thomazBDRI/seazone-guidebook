import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LOCALES } from "@/lib/i18n/locales";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/server";

/**
 * Language switch. The locale lives in a cookie rather than in the URL: a
 * guest receives one link (/FLN001) and it has to keep working whatever
 * language they read the guide in.
 *
 * Only the three supported locales are accepted — an unvalidated value would
 * end up in `<html lang>` and in a catalog lookup.
 */
const RequestSchema = z.object({ locale: z.enum(LOCALES) });

export async function POST(request: NextRequest) {
  const payload = RequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!payload.success) {
    return Response.json({ error: "invalid_locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale: payload.data.locale });
  response.cookies.set({
    name: LOCALE_COOKIE,
    value: payload.data.locale,
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    // a display preference, not a credential: nothing here is worth hiding
    // from the page, and it is only ever read server-side
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
