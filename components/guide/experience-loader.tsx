"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExperienceShell,
  ExperienceSkeleton,
} from "@/components/guide/experience-section";
import { Icon } from "@/components/guide/icon";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Drives the on-first-access generation of the experiences guide: kicks off
 * POST /api/guides/[code], polls while another request holds the lock, and
 * refreshes the route so the server component re-renders from the persisted
 * row (the generated content never travels through client state).
 */

const POLL_INTERVAL_MS = 2500;
/** Generation is capped at 60s server-side; give it some slack, then give up. */
const MAX_WAIT_MS = 90_000;
/**
 * "absent" right after the POST just means the lock row has not landed yet;
 * a few in a row means nobody is generating and we should stop waiting.
 */
const MAX_ABSENT_POLLS = 3;

type LoaderState = "generating" | "failed";

type ExperienceLoaderProps = {
  code: string;
  neighborhood: string;
  city: string;
  locale: Locale;
};

export function ExperienceLoader({
  code,
  neighborhood,
  city,
  locale,
}: ExperienceLoaderProps) {
  const router = useRouter();
  const [state, setState] = useState<LoaderState>("generating");
  const [attempt, setAttempt] = useState(0);
  /**
   * Last attempt that already fired its POST — exactly one per attempt. The
   * request is deliberately not aborted on cleanup: StrictMode's
   * mount/unmount/mount cycle would otherwise cancel the generation it just
   * asked for, so the remount polls the running one instead.
   */
  const postedAttempt = useRef(-1);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let absentPolls = 0;
    const deadline = Date.now() + MAX_WAIT_MS;

    const settle = (status: unknown) => {
      if (cancelled) return;

      if (status === "ready") {
        // re-render the RSC tree; the section reads the persisted guide
        router.refresh();
        return;
      }
      if (Date.now() > deadline) {
        setState("failed");
        return;
      }
      if (status === "pending") {
        absentPolls = 0;
      } else if (status === "absent" && absentPolls < MAX_ABSENT_POLLS) {
        absentPolls += 1;
      } else {
        setState("failed");
        return;
      }
      pollTimer = setTimeout(() => void request("GET"), POLL_INTERVAL_MS);
    };

    const request = async (method: "GET" | "POST") => {
      try {
        const response = await fetch(`/api/guides/${code}`, {
          method,
          cache: "no-store",
        });
        const body = await response.json().catch(() => null);
        settle(response.ok ? body?.status : "error");
      } catch {
        if (!cancelled) setState("failed");
      }
    };

    const method = postedAttempt.current === attempt ? "GET" : "POST";
    postedAttempt.current = attempt;
    void request(method);

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [code, router, attempt]);

  const retry = useCallback(() => {
    setState("generating");
    setAttempt((current) => current + 1);
  }, []);

  if (state === "failed") {
    return (
      <ExperienceShell neighborhood={neighborhood} city={city} locale={locale}>
        <GenerationFailure onRetry={retry} locale={locale} />
      </ExperienceShell>
    );
  }
  return (
    <ExperienceSkeleton
      neighborhood={neighborhood}
      city={city}
      locale={locale}
    />
  );
}

/** Friendly dead end: the rest of the guide still works without this section. */
function GenerationFailure({
  onRetry,
  locale,
}: {
  onRetry: () => void;
  locale: Locale;
}) {
  const messages = getMessages(locale).experience.failure;

  return (
    <div className="my-[34px] flex flex-col items-start gap-4 rounded-xl border border-coral/[.35] bg-[linear-gradient(135deg,hsla(2,97%,66%,.16),hsla(18,90%,64%,.08))] px-6 py-6 sm:flex-row sm:items-center">
      <span className="grid size-11 flex-none place-items-center rounded-full bg-gradient-warm text-white">
        <Icon name="circle-alert" className="size-[21px]" />
      </span>
      <div className="flex-1">
        <h4 className="text-[15.5px] font-bold">{messages.title}</h4>
        <p className="max-w-[56ch] text-[13px] text-sea-light/75">
          {messages.body}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex flex-none items-center gap-2 rounded-full border border-white/[.38] bg-white/10 px-[15px] py-2 text-[13px] font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-navy"
      >
        <Icon name="rotate-cw" className="size-[14px]" />
        {messages.retry}
      </button>
    </div>
  );
}
