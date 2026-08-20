"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/guide/icon";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

type CopyFieldProps = { label: string; value: string; locale: Locale };

/** Labelled credential row with a copy-to-clipboard button (mockup `.cred`). */
export function CopyField({ label, value, locale }: CopyFieldProps) {
  const messages = getMessages(locale).copyField;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard blocked (insecure context / denied permission): the value
      // stays visible on screen, so fall through to the same feedback
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-[5px] text-[10.5px] font-bold uppercase tracking-[.14em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center justify-between gap-2.5 rounded-[11px] border border-border bg-sea-mist px-[13px] py-2.5">
        <span className="text-[15px] font-bold tracking-[.01em] text-foreground [font-variant-ligatures:none]">
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={messages.ariaCopy(label)}
          className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-[7px] text-xs font-semibold text-primary-strong transition-colors hover:border-primary hover:bg-sea-light"
        >
          {copied ? (
            messages.copied
          ) : (
            <>
              <Icon name="copy" className="size-[13px]" />
              {messages.copy}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
