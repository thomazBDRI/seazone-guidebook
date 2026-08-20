import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { cache } from "react";
import { AmenitiesSection } from "@/components/guide/amenities-section";
import { ArrivalSection } from "@/components/guide/arrival-section";
import { ChatWidget } from "@/components/guide/chat-widget";
import { ExperienceLoader } from "@/components/guide/experience-loader";
import { ExperienceSection } from "@/components/guide/experience-section";
import { Hero } from "@/components/guide/hero";
import { HostSection } from "@/components/guide/host-section";
import { RulesSection } from "@/components/guide/rules-section";
import { SiteFooter } from "@/components/guide/site-footer";
import { TocNav } from "@/components/guide/toc-nav";
import { TopBar } from "@/components/guide/top-bar";
import {
  accessTypeDisplay,
  formatTime,
  locationLine,
  phoneDigits,
} from "@/lib/domain/display";
import { GuideContentSchema } from "@/lib/domain/guide";
import { wifiQrPayload } from "@/lib/domain/wifi";
import { getMessages } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { getGuideByPropertyId } from "@/lib/repositories/guides";
import { getPropertyByCode } from "@/lib/repositories/properties";

/** Deduplicates the lookup between generateMetadata and the page render. */
const loadProperty = cache(getPropertyByCode);

type PageProps = { params: Promise<{ code: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  const [property, messages] = await Promise.all([
    loadProperty(code),
    getLocale().then(getMessages),
  ]);
  if (!property) {
    return { title: messages.metadata.notFoundTitle };
  }
  return {
    title: messages.metadata.propertyTitle(property.name),
    description: messages.metadata.propertyDescription(
      property.code,
      property.city,
    ),
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { code } = await params;
  const [property, locale] = await Promise.all([
    loadProperty(code),
    getLocale(),
  ]);
  if (!property) notFound();

  const messages = getMessages(locale);
  const guide = await getGuideByPropertyId(property.id);
  // an unreadable payload is treated as "not generated yet" rather than
  // crashing the whole guide over one bad column
  const parsedContent =
    guide?.status === "ready"
      ? GuideContentSchema.safeParse(guide.content)
      : null;
  const guideContent = parsedContent?.success ? parsedContent.data : null;

  // generated here (not in the browser) so the password never travels twice
  const wifiQr =
    property.wifi_network && property.wifi_password
      ? await QRCode.toDataURL(
          wifiQrPayload(property.wifi_network, property.wifi_password),
          { margin: 1, width: 192 },
        )
      : null;

  return (
    <>
      <TopBar
        hostPhoneDigits={phoneDigits(property.host_phone)}
        locale={locale}
      />
      <Hero
        code={property.code}
        name={property.name}
        propertyType={property.property_type}
        location={locationLine(property)}
        images={property.images}
        checkIn={formatTime(property.check_in_time)}
        checkOut={formatTime(property.check_out_time)}
        entry={
          property.is_self_checkin
            ? messages.hero.selfCheckin
            : accessTypeDisplay(property.property_access_type, locale).label
        }
        locale={locale}
      />
      <TocNav locale={locale} />
      <main>
        <ArrivalSection property={property} locale={locale} wifiQr={wifiQr} />
        <RulesSection property={property} locale={locale} />
        <AmenitiesSection property={property} locale={locale} />
        {guideContent ? (
          <ExperienceSection
            content={guideContent}
            neighborhood={property.neighborhood}
            city={property.city}
            generatedAt={guide?.generated_at ?? null}
            locale={locale}
          />
        ) : (
          <ExperienceLoader
            code={property.code}
            neighborhood={property.neighborhood}
            city={property.city}
            locale={locale}
          />
        )}
        <HostSection
          hostName={property.host_name}
          hostPhone={property.host_phone}
          locale={locale}
        />
      </main>
      <SiteFooter locale={locale} />
      <ChatWidget
        code={property.code}
        propertyName={property.name}
        hostName={property.host_name}
        hostPhoneDigits={phoneDigits(property.host_phone)}
      />
    </>
  );
}
