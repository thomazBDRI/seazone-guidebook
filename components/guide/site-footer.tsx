import { SeazoneWordmark } from "@/components/guide/brand";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

/**
 * The copyright year is fixed on purpose: reading the clock while rendering
 * makes the page unprerenderable under cacheComponents, and a guest guide has
 * no reason to be dynamic over a copyright line.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);

  return (
    <footer
      data-dark-section
      className="mt-[clamp(48px,8vw,84px)] bg-sea-deep px-[clamp(16px,4vw,40px)] pb-[calc(36px+env(safe-area-inset-bottom))] pt-9 text-sea-light/60"
    >
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-[18px]">
        <div>
          <div className="flex items-center text-white">
            <SeazoneWordmark className="h-[17px]" label={messages.brand.name} />
          </div>
          <div className="text-[13px]">{messages.footer.tagline}</div>
        </div>
        <div className="text-xs opacity-70">{messages.footer.copyright}</div>
      </div>
    </footer>
  );
}
