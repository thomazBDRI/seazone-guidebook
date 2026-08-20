"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/guide/icon";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

/** Ids double as the anchor targets, so they stay Portuguese in every locale. */
const SECTIONS = [
  { id: "acesso", icon: "key-round" },
  { id: "regras", icon: "clipboard-check" },
  { id: "comodidades", icon: "sofa" },
  { id: "experiencias", icon: "sparkles" },
  { id: "contato", icon: "phone" },
] as const;

/** Distance kept between the rail and a dark section edge. */
const PAD = 22;

export function TocNav({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const label = (id: (typeof SECTIONS)[number]["id"]) =>
    messages.toc.sections[id];
  const rail = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [shift, setShift] = useState(0);
  const [overDark, setOverDark] = useState(false);

  /**
   * The rail shows up only once the hero has cleared its band, and slides
   * below the bottom edge of a dark section instead of straddling it —
   * otherwise half the labels would be unreadable.
   */
  useEffect(() => {
    const hero = document.getElementById("hero");
    const darkSections = Array.from(
      document.querySelectorAll("[data-dark-section]"),
    );
    const targets = SECTIONS.map(({ id }) =>
      document.getElementById(id),
    ).filter((element): element is HTMLElement => element !== null);

    const update = () => {
      // scroll spy: last section whose top passed the reading line wins; a
      // short final section can never reach it, so page bottom forces it
      const spyLine = window.innerHeight * 0.35;
      let current = targets[0]?.id ?? SECTIONS[0].id;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= spyLine) current = target.id;
      }
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 90;
      const lastTarget = targets.at(-1);
      if (atBottom && lastTarget) current = lastTarget.id;
      setActive(current);
      const railHeight = rail.current?.offsetHeight || 200;
      const railTop = window.innerHeight / 2 - railHeight / 2;
      const railBottom = railTop + railHeight;

      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      setVisible(heroBottom < railTop - PAD);

      let nextShift = 0;
      for (const section of darkSections) {
        const bottom = section.getBoundingClientRect().bottom;
        if (bottom > railTop - PAD && bottom < railBottom + PAD) {
          nextShift = bottom + PAD - railTop;
        }
      }
      nextShift = Math.min(nextShift, window.innerHeight - railBottom - 16);
      setShift(nextShift);

      const middle = window.innerHeight / 2 + nextShift;
      setOverDark(
        darkSections.some((section) => {
          const box = section.getBoundingClientRect();
          return box.top < middle && box.bottom > middle;
        }),
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const currentSection =
    SECTIONS.find((section) => section.id === active) ?? SECTIONS[0];

  return (
    <>
      <nav
        ref={rail}
        aria-label={messages.toc.label}
        style={{ transform: `translateY(calc(-50% + ${shift}px))` }}
        className={cn(
          "pointer-events-none fixed left-[clamp(22px,2.5vw,44px)] top-1/2 z-30 hidden max-w-[180px] flex-col gap-0.5 opacity-0 transition-[opacity,transform] duration-[400ms] min-[1400px]:flex",
          visible && "pointer-events-auto opacity-100",
        )}
      >
        <span
          className={cn(
            "mb-2 text-[10px] font-bold uppercase tracking-[.18em] transition-colors duration-[400ms]",
            overDark ? "text-sea-light/50" : "text-muted-foreground/75",
          )}
        >
          {messages.toc.label}
        </span>
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "flex items-center gap-2.5 py-1.5 text-[12.5px] font-semibold transition-colors before:h-0.5 before:w-4 before:flex-none before:rounded-sm before:transition-[width,background-color] before:content-['']",
                overDark
                  ? "text-sea-light/60 before:bg-sea-light/20 hover:text-white"
                  : "text-muted-foreground before:bg-border hover:text-primary",
                isActive &&
                  (overDark
                    ? "text-white before:w-[26px] before:bg-[hsl(225_90%_74%)]"
                    : "text-primary-strong before:w-[26px] before:bg-primary"),
              )}
            >
              {label(section.id)}
            </a>
          );
        })}
      </nav>

      <nav
        aria-label={messages.toc.label}
        className="sticky top-[var(--topbar-h,62px)] z-40 border-b border-border bg-sea-mist/[.92] backdrop-blur-[14px] min-[1400px]:hidden"
      >
        <button
          type="button"
          onClick={() => setOpen((isOpen) => !isOpen)}
          aria-expanded={open}
          className="mx-auto flex w-full max-w-[1080px] items-center gap-2.5 px-[clamp(16px,4vw,40px)] py-3 text-left"
        >
          <span className="flex-none text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
            {messages.toc.current}
          </span>
          <span className="flex-1 truncate text-[13.5px] font-bold text-primary-strong">
            {label(currentSection.id)}
          </span>
          <Icon
            name="chevron-down"
            className={cn(
              "size-4 flex-none text-muted-foreground transition-transform duration-[250ms]",
              open && "rotate-180",
            )}
          />
        </button>
        {open ? (
          <div className="border-t border-border bg-[hsla(225,70%,99%,.98)]">
            <div className="mx-auto flex max-w-[1080px] flex-col px-[clamp(16px,4vw,40px)] pb-3.5 pt-2">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-[11px] border-b border-[hsl(220_28%_94%)] px-1 py-[11px] text-sm font-semibold last:border-b-0",
                    section.id === active
                      ? "text-primary-strong"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon name={section.icon} className="size-4 flex-none" />
                  {label(section.id)}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </>
  );
}
