"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { getMessages } from "@/lib/i18n";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

/**
 * "PT · EN · ES" from the mockup, made real: the pick is persisted in the
 * locale cookie by POST /api/locale, then the route is refreshed so every
 * server component re-renders in the new language (including the AI content,
 * which is generated per locale).
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const messages = getMessages(locale);
  const [busy, setBusy] = useState(false);

  async function pick(next: Locale) {
    if (next === locale || busy) return;

    setBusy(true);
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      if (!response.ok) {
        throw new Error(`locale switch failed with ${response.status}`);
      }
      router.refresh();
    } catch (cause) {
      // the guide stays readable in the current language, so there is nothing
      // to tell the guest here
      console.error(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    // a navigation landmark, not a form control: each button leads to the same
    // guide in another language
    <nav
      aria-label={messages.language.label}
      className="flex items-center gap-1.5 text-[12.5px] font-semibold tracking-[.04em] text-white"
    >
      {LOCALES.map((option, index) => (
        <Fragment key={option}>
          {index > 0 ? (
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void pick(option)}
            aria-current={option === locale}
            aria-label={messages.language.switchTo(LOCALE_LABELS[option].name)}
            className={cn(
              "transition-opacity",
              option === locale
                ? "opacity-90"
                : "font-normal opacity-50 hover:opacity-90",
              busy && "cursor-wait",
            )}
          >
            {LOCALE_LABELS[option].short}
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
