"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OPEN_CHAT_EVENT } from "@/components/guide/chat-events";
import { Icon } from "@/components/guide/icon";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

/**
 * Guest assistant: streams the answer from /api/chat and paints it as it
 * arrives. Model text is rendered as plain text — never as HTML — so a prompt
 * injection cannot turn an answer into markup.
 */

/** Mirrors the caps enforced by the route's zod schema. */
const MAX_HISTORY = 12;
const MAX_CONTENT = 1000;

type Turn = {
  role: "user" | "assistant" | "error";
  content: string;
};

type ChatWidgetProps = {
  code: string;
  propertyName: string;
  hostName: string;
  /** Digits only, ready for a wa.me link. */
  hostPhoneDigits: string;
  locale: Locale;
};

export function ChatWidget({
  code,
  propertyName,
  hostName,
  hostPhoneDigits,
  locale,
}: ChatWidgetProps) {
  const messages = getMessages(locale).chat;
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onExternalOpen = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, onExternalOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onExternalOpen);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // follow the answer while it streams in
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || turns.length === 0) return;
    body.scrollTop = body.scrollHeight;
  }, [turns]);

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || busy) return;

      setBusy(true);
      setInput("");
      const asked: Turn[] = [...turns, { role: "user", content: question }];
      setTurns([...asked, { role: "assistant", content: "" }]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, messages: payloadFrom(asked) }),
        });
        if (!response.ok || !response.body) {
          throw new Error(`chat request failed with ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let answered = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          answered = true;
          setTurns((current) => appendToAnswer(current, chunk));
        }
        if (!answered) throw new Error("chat stream was empty");
      } catch (cause) {
        console.error(cause);
        setTurns((current) => [
          ...current.filter(
            (turn) => turn.role !== "assistant" || turn.content !== "",
          ),
          { role: "error", content: "" },
        ]);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, code, turns],
  );

  return (
    <>
      <div
        role="dialog"
        aria-label={messages.dialogLabel}
        aria-hidden={!open}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={cn(
          "fixed bottom-[92px] right-5 z-[60] flex h-[min(560px,calc(100dvh-120px))] w-[min(392px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_70px_-18px_hsla(220,100%,20%,.45)] transition-[transform,opacity] duration-[250ms] [transition-timing-function:cubic-bezier(.32,.72,.35,1.1)]",
          !open && "pointer-events-none translate-y-5 scale-75 opacity-0",
        )}
      >
        <header className="flex flex-none items-center gap-3 bg-navy px-[18px] py-4 text-white">
          <span className="grid size-[38px] flex-none place-items-center rounded-full bg-gradient-sea text-white">
            <Icon name="sparkles" className="size-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[14.5px]">{messages.title}</b>
            <span className="flex items-center gap-[5px] text-[11.5px] text-[hsl(152_70%_65%)] before:size-1.5 before:rounded-full before:bg-[hsl(152_70%_55%)] before:content-['']">
              {messages.online(code)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={messages.close}
            className="p-1.5 text-white/70 transition-colors hover:text-white"
          >
            <Icon name="x" className="size-[18px]" />
          </button>
        </header>

        <div
          ref={bodyRef}
          aria-live="polite"
          className="flex flex-1 flex-col gap-3 overflow-y-auto bg-sea-mist px-4 py-[18px]"
        >
          <Bubble kind="assistant">
            {messages.greetingLead} <b>{propertyName}</b>
            {messages.greetingTail}
          </Bubble>

          {turns.map((turn, index) => {
            const key = `${index}-${turn.role}`;
            if (turn.role === "error") {
              return (
                <Bubble key={key} kind="error">
                  {messages.errorLead(hostName)}{" "}
                  <a
                    className="font-semibold text-primary-strong underline"
                    href={`https://wa.me/${hostPhoneDigits}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {messages.errorLink}
                  </a>
                  .
                </Bubble>
              );
            }
            return (
              <Bubble key={key} kind={turn.role}>
                {turn.content === "" ? (
                  <TypingDots label={messages.typing} />
                ) : (
                  <span className="whitespace-pre-wrap">{turn.content}</span>
                )}
              </Bubble>
            );
          })}
        </div>

        <div className="flex flex-none flex-wrap gap-[7px] bg-sea-mist px-4 pb-2.5">
          {messages.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={busy}
              onClick={() => void send(suggestion)}
              className="rounded-full border border-border bg-white px-[13px] py-[7px] text-xs font-semibold text-primary-strong transition-[background-color,border-color] hover:border-primary hover:bg-sea-light disabled:opacity-60"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          className="flex flex-none gap-[9px] border-t border-border bg-white px-3.5 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={MAX_CONTENT}
            autoComplete="off"
            aria-label={messages.inputLabel}
            placeholder={messages.inputPlaceholder}
            className="flex-1 rounded-full border border-border px-[18px] py-[11px] text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_hsla(220,100%,50%,.14)]"
          />
          <button
            type="submit"
            disabled={busy || input.trim() === ""}
            aria-label={messages.send}
            className="grid size-11 flex-none place-items-center rounded-full bg-gradient-sea text-white transition-transform hover:scale-[1.07] disabled:opacity-60 disabled:hover:scale-100"
          >
            <Icon name="send" className="size-[17px]" />
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? messages.closeLauncher : messages.openLauncher}
        className="fixed bottom-5 right-5 z-[60] grid size-[60px] place-items-center rounded-full bg-gradient-warm text-white shadow-[0_10px_30px_-6px_hsla(2,80%,50%,.6)] transition-transform hover:scale-[1.06]"
      >
        <Icon name={open ? "x" : "message-circle"} className="size-[26px]" />
        {open ? null : (
          <span className="absolute right-0.5 top-0.5 size-[14px] rounded-full border-[2.5px] border-white bg-navy" />
        )}
      </button>
    </>
  );
}

function Bubble({
  kind,
  children,
}: {
  kind: Turn["role"];
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-[82%] animate-msgin px-[15px] py-[11px] text-sm leading-normal",
        kind === "user"
          ? "self-end rounded-[16px_16px_5px_16px] bg-gradient-sea text-white"
          : "self-start rounded-[16px_16px_16px_5px] border bg-white shadow-soft",
        kind === "assistant" && "border-border text-foreground",
        kind === "error" && "border-coral/40 text-foreground",
      )}
    >
      {children}
    </div>
  );
}

function TypingDots({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-0.5 py-1">
      <span className="sr-only">{label}</span>
      <i className="size-1.5 animate-blink rounded-full bg-[hsl(220_20%_70%)]" />
      <i className="size-1.5 animate-blink rounded-full bg-[hsl(220_20%_70%)] [animation-delay:.18s]" />
      <i className="size-1.5 animate-blink rounded-full bg-[hsl(220_20%_70%)] [animation-delay:.36s]" />
    </span>
  );
}

/** Streamed chunk lands on the answer being written, which is always last. */
function appendToAnswer(turns: Turn[], chunk: string): Turn[] {
  const last = turns.at(-1);
  if (last?.role !== "assistant") return turns;
  return [...turns.slice(0, -1), { ...last, content: last.content + chunk }];
}

/**
 * Request history: only real turns, newest kept, each within the route's
 * per-message cap (a long answer would otherwise be rejected on the next turn).
 */
function payloadFrom(turns: Turn[]): { role: string; content: string }[] {
  return turns
    .filter((turn) => turn.role !== "error" && turn.content.trim() !== "")
    .slice(-MAX_HISTORY)
    .map((turn) => ({
      role: turn.role,
      content: turn.content.slice(0, MAX_CONTENT),
    }));
}
