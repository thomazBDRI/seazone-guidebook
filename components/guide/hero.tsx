"use client";

import { useEffect, useState } from "react";
import { requestOpenChat } from "@/components/guide/chat-events";
import { Icon } from "@/components/guide/icon";
import { cn } from "@/lib/utils";

const SLIDE_MS = 2800;

type HeroProps = {
  code: string;
  name: string;
  propertyType: string;
  /** "Trindade, Florianópolis — SC" */
  location: string;
  images: string[];
  checkIn: string;
  checkOut: string;
  /** "Self check-in" or the access-type label */
  entry: string;
};

export function Hero({
  code,
  name,
  propertyType,
  location,
  images,
  checkIn,
  checkOut,
  entry,
}: HeroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(
      () => setCurrent((index) => (index + 1) % images.length),
      SLIDE_MS,
    );
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[78vh] items-end overflow-hidden bg-navy text-white sm:min-h-[min(88vh,720px)]"
    >
      <div className="absolute inset-0">
        {images.map((src, index) => (
          // biome-ignore lint/performance/noImgElement: photo hosts come from the database, so next/image would need a wildcard remote allowlist
          <img
            key={src}
            src={src}
            alt={index === 0 ? name : ""}
            className={cn(
              "absolute inset-0 size-full object-cover opacity-0 transition-opacity ease-out [transition-duration:900ms]",
              index === current && "opacity-100",
            )}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-hero-overlay" />

      <div className="relative mx-auto w-full max-w-[1080px] px-[clamp(16px,4vw,40px)] pb-[clamp(64px,8vh,96px)] pt-[120px]">
        <span className="inline-flex animate-rise items-center gap-[7px] rounded-full border border-white/30 bg-white/[.14] px-3.5 py-1.5 text-xs font-bold tracking-[.16em] backdrop-blur-[6px] [animation-delay:.05s] before:size-[7px] before:rounded-full before:bg-[hsl(152_70%_55%)] before:shadow-[0_0_8px_hsl(152_70%_55%)] before:content-['']">
          IMÓVEL {code}
        </span>
        <h1 className="my-3 max-w-[14ch] animate-rise font-display text-[clamp(34px,6.2vw,64px)] font-medium leading-[1.04] tracking-[-.015em] [animation-delay:.15s] mt-[18px]">
          {name}
        </h1>
        <div className="flex animate-rise flex-wrap items-center gap-2.5 text-[clamp(15px,1.8vw,18px)] font-medium text-sea-light/[.92] [animation-delay:.25s]">
          <span>{propertyType}</span>
          <span className="size-1 rounded-full bg-white/50" />
          <span>{location}</span>
        </div>

        <div className="mt-7 flex animate-rise flex-wrap gap-3 [animation-delay:.38s]">
          <button
            type="button"
            onClick={requestOpenChat}
            className="inline-flex items-center gap-[9px] rounded-full bg-gradient-warm px-[22px] py-3.5 text-[14.5px] font-bold text-white shadow-[0_10px_32px_-6px_hsla(2,80%,50%,.65)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-6px_hsla(2,80%,50%,.75)] sm:px-7 sm:py-[15px] sm:text-[15.5px]"
          >
            <Icon name="sparkles" className="size-[19px] animate-sparkle" />
            Tire dúvidas com a IA
          </button>
          <a
            className="inline-flex items-center gap-[9px] rounded-full border border-white/[.32] bg-white/10 px-[18px] py-3 text-[13.5px] font-semibold text-white backdrop-blur-[10px] transition-colors hover:bg-white/20 sm:px-6 sm:py-[13px] sm:text-[14.5px]"
            href="#acesso"
          >
            <Icon name="arrow-down" className="size-[17px]" />
            Guia da hospedagem
          </a>
        </div>

        <dl className="mt-[30px] grid max-w-[620px] animate-rise grid-cols-3 rounded-[18px] border border-white/[.32] bg-white/10 backdrop-blur-[10px] [animation-delay:.5s]">
          <Essential label="Check-in" value={checkIn} hint="em diante" />
          <Essential label="Check-out" value={checkOut} hint="no máximo" />
          <Essential label="Entrada" value={entry} />
        </dl>
      </div>
    </section>
  );
}

function Essential({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="relative flex flex-col items-center gap-0.5 px-2 py-[15px] text-center first:before:hidden sm:px-3.5 sm:py-4 before:absolute before:left-0 before:top-1/2 before:h-[58%] before:w-px before:-translate-y-1/2 before:bg-white/[.28] before:content-['']">
      <dt className="text-[9.5px] font-bold uppercase tracking-[.16em] text-white/[.62] sm:text-[10.5px]">
        {label}
      </dt>
      <dd className="text-[14.5px] font-bold tracking-[-.01em] text-white sm:text-[16.5px]">
        {value}
        {hint ? (
          <small className="ml-1 hidden text-xs font-medium text-white/60 sm:inline">
            {hint}
          </small>
        ) : null}
      </dd>
    </div>
  );
}
