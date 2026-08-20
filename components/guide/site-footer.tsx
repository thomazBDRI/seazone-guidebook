import { WaveLogoCompact } from "@/components/guide/brand";

/**
 * Fixed on purpose: reading the clock while rendering makes the page
 * unprerenderable under cacheComponents, and a guest guide has no reason to
 * be dynamic over a copyright line.
 */
export const COPYRIGHT = "© 2026 Seazone Serviços Ltda. · Guia do Hóspede";

export function SiteFooter() {
  return (
    <footer
      data-dark-section
      className="mt-[clamp(48px,8vw,84px)] bg-sea-deep px-[clamp(16px,4vw,40px)] pb-[calc(36px+env(safe-area-inset-bottom))] pt-9 text-sea-light/60"
    >
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-[18px]">
        <div>
          <div className="flex items-center gap-[9px] text-white">
            <WaveLogoCompact />
            <b className="text-base tracking-[-.02em]">seazone</b>
          </div>
          <div className="text-[13px]">
            Gestão inteligente de imóveis por temporada
          </div>
        </div>
        <div className="text-xs opacity-70">{COPYRIGHT}</div>
      </div>
    </footer>
  );
}
