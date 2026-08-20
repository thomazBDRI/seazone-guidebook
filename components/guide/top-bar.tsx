"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLockup, WhatsAppIcon } from "@/components/guide/brand";
import { cn } from "@/lib/utils";

type TopBarProps = {
  /** wa.me target (digits only) */
  hostPhoneDigits: string;
};

export function TopBar({ hostPhoneDigits }: TopBarProps) {
  const bar = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    // the sticky "nesta página" bar docks right below the topbar
    const publishHeight = () => {
      const height = bar.current?.offsetHeight;
      if (height) {
        document.documentElement.style.setProperty("--topbar-h", `${height}px`);
      }
    };

    onScroll();
    publishHeight();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", publishHeight);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", publishHeight);
    };
  }, []);

  return (
    <header
      ref={bar}
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[clamp(16px,4vw,40px)] py-3.5 text-white transition-[background-color,box-shadow] duration-300",
        scrolled &&
          "bg-navy/[.86] shadow-[0_1px_0_hsla(0,0%,100%,.08)] backdrop-blur-[14px]",
      )}
    >
      <BrandLockup />
      <a
        className="inline-flex items-center gap-2 rounded-full border border-white/[.25] bg-white/[.12] px-[11px] py-[9px] text-[13.5px] font-semibold text-white backdrop-blur-[8px] transition-colors hover:bg-white/[.22] sm:px-4"
        href={`https://wa.me/${hostPhoneDigits}`}
        target="_blank"
        rel="noopener"
      >
        <WhatsAppIcon className="size-[15px]" />
        <span className="hidden sm:inline">Falar com anfitrião</span>
      </a>
    </header>
  );
}
