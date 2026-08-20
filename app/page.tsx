import { BrandLockup } from "@/components/guide/brand";
import { Icon } from "@/components/guide/icon";
import { LanguageSwitcher } from "@/components/guide/language-switcher";
import { SiteFooter } from "@/components/guide/site-footer";
import { PropertyCard } from "@/components/home/property-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMessages } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { listProperties } from "@/lib/repositories/properties";

/** Shown in the notice when the database has no property to point at. */
const EXAMPLE_CODE = "FLN001";

/**
 * Index of every seeded property — a test-only page. A guest reaches their
 * guide through a direct /CODE link from the booking confirmation and never
 * lists properties, which is what the notice on this page says out loud.
 */
export default async function Home() {
  const [locale, properties] = await Promise.all([
    getLocale(),
    listProperties(),
  ]);
  const messages = getMessages(locale);
  const exampleCode = properties[0]?.code ?? EXAMPLE_CODE;

  return (
    <div className="flex min-h-screen flex-col bg-sea-mist">
      <header className="relative overflow-hidden bg-sea-deep text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_360px_at_82%_0%,hsla(220,100%,55%,.28),transparent_66%),radial-gradient(520px_320px_at_5%_100%,hsla(2,97%,66%,.14),transparent_64%)]"
        />
        <div className="relative mx-auto flex max-w-[1080px] items-center justify-between px-[clamp(16px,4vw,40px)] py-[18px]">
          <BrandLockup locale={locale} />
          <LanguageSwitcher locale={locale} />
        </div>
        <div className="relative mx-auto max-w-[1080px] px-[clamp(16px,4vw,40px)] pb-[clamp(48px,7vw,76px)] pt-[clamp(28px,5vw,48px)]">
          <p className="flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[.18em] text-[hsl(225_90%_78%)] before:h-0.5 before:w-[26px] before:rounded-sm before:bg-[hsl(225_90%_78%)] before:content-['']">
            {messages.home.eyebrow}
          </p>
          <h1 className="mt-3 max-w-[20ch] animate-rise font-display text-[clamp(32px,5.6vw,52px)] font-medium leading-[1.06] tracking-[-.015em]">
            {messages.home.titleLead}{" "}
            <em className="italic text-[hsl(225_90%_78%)]">
              {messages.home.titleEmphasis}
            </em>
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(15px,1.7vw,17px)] leading-relaxed text-sea-light/[.72]">
            {messages.home.subtitle}
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-[clamp(16px,4vw,40px)] pt-[clamp(32px,5vw,52px)]">
        <div className="flex items-start gap-3.5 rounded-xl border border-dashed border-border bg-white/70 px-5 py-[18px]">
          <Icon
            name="clipboard-check"
            className="mt-0.5 size-[19px] flex-none text-muted-foreground"
          />
          <div>
            <b className="text-sm font-semibold">
              {messages.home.notice.title}
            </b>
            <p className="mt-1 max-w-[80ch] text-[13.5px] leading-relaxed text-muted-foreground">
              {messages.home.notice.body(`/${exampleCode}`)}
            </p>
          </div>
        </div>

        <div className="pt-[clamp(36px,6vw,60px)]">
          <SectionHeading
            eyebrow={messages.home.list.eyebrow}
            title={messages.home.list.title}
            description={messages.home.list.description}
          />
          {properties.length > 0 ? (
            <div className="grid gap-[22px] min-[560px]:grid-cols-2 min-[1000px]:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.code}
                  property={property}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-border bg-white px-5 py-6 text-sm text-muted-foreground">
              {messages.home.empty}
            </p>
          )}
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
