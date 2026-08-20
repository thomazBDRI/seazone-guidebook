import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { cache } from "react";
import { AmenitiesSection } from "@/components/guide/amenities-section";
import { ArrivalSection } from "@/components/guide/arrival-section";
import { Hero } from "@/components/guide/hero";
import { RulesSection } from "@/components/guide/rules-section";
import { SiteFooter } from "@/components/guide/site-footer";
import { TopBar } from "@/components/guide/top-bar";
import {
  accessTypeDisplay,
  formatTime,
  locationLine,
  phoneDigits,
} from "@/lib/domain/display";
import { wifiQrPayload } from "@/lib/domain/wifi";
import { getPropertyByCode } from "@/lib/repositories/properties";

/** Deduplicates the lookup between generateMetadata and the page render. */
const loadProperty = cache(getPropertyByCode);

type PageProps = { params: Promise<{ code: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  const property = await loadProperty(code);
  if (!property) {
    return { title: "Imóvel não encontrado · Guia do Hóspede — Seazone" };
  }
  return {
    title: `${property.name} · Guia do Hóspede — Seazone`,
    description: `Guia da hospedagem ${property.code}: chegada, acesso, Wi-Fi, regras da estadia e dicas em ${property.city}.`,
  };
}

/**
 * Every part of the page comes from the property row, so there is no static
 * shell worth streaming — and a partially prerendered shell would flush a 200
 * before `notFound()` runs, which would answer unknown codes with the wrong
 * status. Blocking keeps the response honest.
 */
export const instant = false;

export default async function GuidePage({ params }: PageProps) {
  const { code } = await params;
  const property = await loadProperty(code);
  if (!property) notFound();

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
      <TopBar hostPhoneDigits={phoneDigits(property.host_phone)} />
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
            ? "Self check-in"
            : accessTypeDisplay(property.property_access_type).label
        }
      />
      <main>
        <ArrivalSection property={property} wifiQr={wifiQr} />
        <RulesSection property={property} />
        <AmenitiesSection property={property} />
      </main>
      <SiteFooter />
    </>
  );
}
