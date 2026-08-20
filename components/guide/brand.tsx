import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

/** Seazone wave mark (from the approved mockup). */
export function WaveLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-[26px]", className)}
    >
      <path
        d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
      <path d="M12 4l3.5 6h-7L12 4z" fill="currentColor" />
    </svg>
  );
}

/** Footer variant: single wave + sail, as in the mockup. */
export function WaveLogoCompact({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-5", className)}
    >
      <path
        d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 4l3.5 6h-7L12 4z" fill="currentColor" />
    </svg>
  );
}

/** WhatsApp glyph — not part of lucide, copied from the mockup. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-4", className)}
    >
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.2 2.4 1.5 2.7 1.7.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4 0 .1 0 .7-.2 1.3z" />
    </svg>
  );
}

/** Brand lockup used in the topbar and on the 404 page. */
export function BrandLockup({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <WaveLogo />
      <span>
        <span className="text-[19px] font-bold tracking-[-.03em]">seazone</span>
        <span className="-mt-[3px] block text-[11px] font-medium uppercase tracking-[.14em] opacity-[.72]">
          {getMessages(locale).brand.tagline}
        </span>
      </span>
    </span>
  );
}
