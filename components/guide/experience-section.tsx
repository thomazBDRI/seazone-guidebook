import type { ReactNode } from "react";
import { Icon } from "@/components/guide/icon";
import { essentialTypeLabel } from "@/lib/domain/display";
import type { GuideContent } from "@/lib/domain/guide";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

type ShellProps = {
  neighborhood: string;
  city: string;
  locale: Locale;
  children: ReactNode;
};

/** Dark full-bleed section with the mockup's radial glows. */
export function ExperienceShell({
  neighborhood,
  city,
  locale,
  children,
}: ShellProps) {
  const messages = getMessages(locale).experience;

  return (
    <section
      id="experiencias"
      data-dark-section
      className="relative mt-[clamp(44px,7vw,72px)] overflow-hidden bg-navy text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_340px_at_85%_0%,hsla(220,100%,55%,.25),transparent_65%),radial-gradient(520px_320px_at_0%_100%,hsla(2,97%,66%,.13),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-[1080px] px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,80px)]">
        <h2 className="mb-2.5 max-w-[20ch] font-display text-[clamp(28px,4.4vw,44px)] font-medium leading-[1.1] tracking-[-.01em]">
          {messages.title(neighborhood, city)}
        </h2>
        <p className="max-w-[52ch] text-[15px] text-sea-light/80">
          {messages.subtitle}
        </p>
        {children}
      </div>
    </section>
  );
}

type ExperienceSectionProps = {
  content: GuideContent;
  neighborhood: string;
  city: string;
  /** ISO timestamp of the generation, used for the month and the footer date */
  generatedAt: string | null;
  locale: Locale;
};

export function ExperienceSection({
  content,
  neighborhood,
  city,
  generatedAt,
  locale,
}: ExperienceSectionProps) {
  const messages = getMessages(locale).experience;
  const generated = generatedAt ? new Date(generatedAt) : null;

  return (
    <ExperienceShell neighborhood={neighborhood} city={city} locale={locale}>
      <blockquote className="mb-[42px] mt-[34px] border-l-[3px] border-coral py-1.5 pl-6">
        <p className="max-w-[34ch] font-display text-[clamp(18px,2.4vw,23px)] font-normal italic leading-[1.45] text-sea-light">
          “{content.welcome_message}”
        </p>
      </blockquote>

      {content.restaurants.length > 0 ? (
        <Group
          title={messages.restaurants}
          count={content.restaurants.length}
          locale={locale}
        >
          {content.restaurants.map((place) => (
            <PlaceCard
              key={place.name}
              name={place.name}
              distance={place.distance}
              description={place.description}
              city={city}
              locale={locale}
              withInstagram
            />
          ))}
        </Group>
      ) : null}

      {content.attractions.length > 0 ? (
        <Group
          title={messages.attractions}
          count={content.attractions.length}
          locale={locale}
        >
          {content.attractions.map((place) => (
            <PlaceCard
              key={place.name}
              name={place.name}
              distance={place.distance}
              description={place.description}
              city={city}
              locale={locale}
              withInstagram
            />
          ))}
        </Group>
      ) : null}

      {content.essentials.length > 0 ? (
        <Group title={messages.essentials} locale={locale}>
          {content.essentials.map((place) => (
            <PlaceCard
              key={place.name}
              name={place.name}
              distance={place.distance}
              description={place.description}
              city={city}
              locale={locale}
              tag={essentialTypeLabel(place.type, locale)}
            />
          ))}
        </Group>
      ) : null}

      {content.seasonal_tip ? (
        <div className="mt-[46px] flex items-start gap-[18px] rounded-xl border border-coral/[.35] bg-[linear-gradient(135deg,hsla(2,97%,66%,.16),hsla(18,90%,64%,.08))] px-[26px] py-6">
          <span className="grid size-11 flex-none place-items-center rounded-full bg-gradient-warm text-white">
            <Icon name="sun" className="size-[21px]" />
          </span>
          <div>
            <h4 className="mb-1.5 text-xs font-bold uppercase tracking-[.15em] text-coral">
              {messages.seasonalTip}
              {generated ? ` · ${monthName(generated, locale)}` : ""}
            </h4>
            <p className="max-w-[64ch] text-[15px] leading-[1.55] text-sea-light">
              {content.seasonal_tip}
            </p>
          </div>
        </div>
      ) : null}

      <p className="mt-9 flex items-center gap-2 text-xs text-sea-light/60">
        <Icon name="sparkles" className="size-[13px]" />
        {messages.aiNotice}
        {generated
          ? ` · ${messages.generatedOn(shortDate(generated, locale))}`
          : ""}
      </p>
    </ExperienceShell>
  );
}

/** "IA gerando" state: pulsing orb banner over shimmering placeholder cards. */
export function ExperienceSkeleton({
  neighborhood,
  city,
  locale,
}: {
  neighborhood: string;
  city: string;
  locale: Locale;
}) {
  const messages = getMessages(locale).experience;

  return (
    <ExperienceShell neighborhood={neighborhood} city={city} locale={locale}>
      <div className="my-[34px] flex items-center gap-4 rounded-xl border border-[hsla(220,100%,65%,.3)] bg-[hsla(220,60%,50%,.12)] px-6 py-5">
        <span className="grid size-11 flex-none animate-orbpulse place-items-center rounded-full bg-gradient-sea text-white">
          <Icon name="sparkles" className="size-5 animate-sparkle" />
        </span>
        <div>
          <h4 className="text-[15.5px] font-bold">{messages.skeleton.title}</h4>
          <p className="text-[13px] text-sea-light/75">
            {messages.skeleton.body(neighborhood)}
          </p>
        </div>
      </div>
      <Group title={messages.restaurants} locale={locale}>
        <SkeletonCard widths={[45, 92, 70]} />
        <SkeletonCard widths={[55, 88, 62]} />
        <SkeletonCard widths={[40, 95, 75]} />
        <SkeletonCard widths={[50, 85, 58]} />
      </Group>
      <Group title={messages.attractions} locale={locale}>
        <SkeletonCard widths={[48, 90]} />
        <SkeletonCard widths={[42, 80]} />
      </Group>
    </ExperienceShell>
  );
}

function Group({
  title,
  count,
  locale,
  children,
}: {
  title: string;
  count?: number;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className="mt-10">
      <div className="mb-[18px] flex items-baseline gap-3.5">
        <h3 className="text-[19px] font-bold tracking-[-.01em]">{title}</h3>
        {count ? (
          <span className="text-[12.5px] font-semibold text-sea-light/65">
            {getMessages(locale).experience.suggestions(count)}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 max-[880px]:grid-cols-1">
        {children}
      </div>
    </div>
  );
}

function PlaceCard({
  name,
  distance,
  description,
  city,
  locale,
  tag,
  withInstagram,
}: {
  name: string;
  distance: string;
  description: string;
  city: string;
  locale: Locale;
  tag?: string;
  withInstagram?: boolean;
}) {
  const messages = getMessages(locale).experience;
  const query = encodeURIComponent(`${name} ${city}`);

  return (
    <div className="rounded-lg border border-sea-light/[.18] bg-[hsla(220,60%,55%,.14)] px-5 py-[18px] transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-sea-light/[.28] hover:bg-[hsla(220,60%,55%,.16)]">
      {tag ? (
        <span className="mb-1.5 inline-block text-[10.5px] font-bold uppercase tracking-[.1em] text-coral">
          {tag}
        </span>
      ) : null}
      <div className="mb-1.5 flex items-center justify-between gap-2.5">
        <h4 className="text-[15.5px] font-bold tracking-[-.01em]">{name}</h4>
        <span className="flex-none whitespace-nowrap rounded-full border border-white bg-white px-[11px] py-[3px] text-[11.5px] font-bold text-navy">
          {distanceLabel(distance)}
        </span>
      </div>
      <p className="text-[13.5px] leading-[1.5] text-sea-light/[.84]">
        {description}
      </p>
      <div className="mt-[13px] flex flex-wrap gap-2">
        <PlaceLink
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          icon="map-pin"
        >
          {messages.mapLink}
        </PlaceLink>
        {withInstagram ? (
          <PlaceLink
            href={`https://www.google.com/search?q=${query}%20instagram`}
            icon="instagram"
          >
            {messages.instagram}
          </PlaceLink>
        ) : null}
      </div>
    </div>
  );
}

function PlaceLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-[13px] py-1.5 text-xs font-semibold text-navy transition-colors hover:border-sea-light hover:bg-sea-light"
    >
      <Icon name={icon} className="size-[13px]" />
      {children}
    </a>
  );
}

function SkeletonCard({ widths }: { widths: number[] }) {
  return (
    <div className="rounded-lg border border-sea-light/[.09] bg-[hsla(220,60%,50%,.05)] px-5 py-[18px]">
      {widths.map((width, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholder bars have no identity
          key={index}
          style={{ width: `${width}%` }}
          className="relative mb-2.5 h-3 overflow-hidden rounded-[10px] bg-sea-light/[.08] last:mb-0 after:absolute after:inset-0 after:animate-shimmer after:bg-[linear-gradient(90deg,transparent,hsla(225,70%,95%,.09),transparent)] after:content-['']"
        />
      ))}
    </div>
  );
}

/** The mockup prefixes distances with "≈"; keep it once. */
function distanceLabel(distance: string): string {
  return distance.startsWith("≈") ? distance : `≈ ${distance}`;
}

function monthName(date: Date, locale: Locale): string {
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  return month.charAt(0).toUpperCase() + month.slice(1);
}

function shortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
