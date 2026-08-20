import { Icon } from "@/components/guide/icon";
import { GuideSection } from "@/components/guide/section";
import { ActionLink } from "@/components/ui/action-link";
import { Card } from "@/components/ui/card";
import { CopyField } from "@/components/ui/copy-field";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  accessTypeDisplay,
  addressLine,
  locationLine,
  mapAddress,
} from "@/lib/domain/display";
import type { Property } from "@/lib/domain/property";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

type ArrivalSectionProps = {
  property: Property;
  locale: Locale;
  /** Wi-Fi join QR as a data URL, rendered server-side (null when there is no password) */
  wifiQr: string | null;
};

export function ArrivalSection({
  property,
  locale,
  wifiQr,
}: ArrivalSectionProps) {
  const messages = getMessages(locale);
  const query = encodeURIComponent(mapAddress(property));
  const access = accessTypeDisplay(property.property_access_type, locale);

  return (
    <GuideSection id="acesso">
      <SectionHeading
        eyebrow={messages.arrival.eyebrow}
        title={messages.arrival.title}
        description={messages.arrival.description}
      />
      <div className="grid grid-cols-[1.05fr_1fr] gap-4 max-[880px]:grid-cols-1">
        <Card className="row-span-3 flex flex-col overflow-hidden p-0 shadow-soft max-[880px]:row-auto">
          <iframe
            src={`https://www.google.com/maps?q=${query}&z=16&output=embed`}
            title={messages.arrival.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block min-h-[250px] w-full flex-1 border-0"
          />
          <div className="flex flex-col gap-4 px-[22px] pb-[22px] pt-5">
            <address className="text-sm not-italic leading-relaxed text-muted-foreground">
              <b className="mb-0.5 block text-base tracking-[-.01em] text-foreground">
                {addressLine(property)}
              </b>
              {locationLine(property)} ·{" "}
              {messages.arrival.postalCode(property.postal_code)}
            </address>
            <div className="flex flex-wrap gap-2.5">
              <ActionLink
                variant="uber"
                href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${query}`}
                target="_blank"
                rel="noopener"
              >
                <Icon name="car-front" />
                {messages.arrival.uber}
              </ActionLink>
              <ActionLink
                variant="sea"
                href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                target="_blank"
                rel="noopener"
              >
                <Icon name="map-pin" />
                {messages.arrival.maps}
              </ActionLink>
            </div>
          </div>
        </Card>

        <InfoCard icon={access.icon} title={messages.arrival.howToEnter}>
          {property.property_access_instructions ? (
            <p className="text-sm text-muted-foreground">
              {property.property_access_instructions}
            </p>
          ) : null}
          {property.property_password ? (
            <span className="mt-2 inline-block rounded-lg bg-sea-light px-3 py-1 text-sm font-bold text-navy">
              {messages.arrival.accessCode(property.property_password)}
            </span>
          ) : null}
          {property.is_self_checkin ? (
            <span className="mt-2.5 flex w-fit items-center gap-1.5 rounded-full bg-ok-bg px-3 py-1 text-xs font-bold text-ok">
              <Icon name="check" className="size-3" />
              {messages.arrival.selfCheckinBadge}
            </span>
          ) : null}
        </InfoCard>

        {property.has_parking_spot ? (
          <InfoCard icon="car" title={messages.arrival.parking}>
            {property.parking_spot_instructions ? (
              <p className="text-sm text-muted-foreground">
                {property.parking_spot_instructions}
              </p>
            ) : null}
            {property.parking_spot_identifier ? (
              <span className="mt-2 inline-block rounded-lg bg-sea-light px-3 py-1 text-sm font-bold text-navy">
                {property.parking_spot_identifier}
              </span>
            ) : null}
          </InfoCard>
        ) : null}

        {property.wifi_network ? (
          <Card className="p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-[13px]">
              <IconBox name="wifi" />
              <div>
                <h3 className="text-base font-bold tracking-[-.01em]">
                  {messages.arrival.wifi.title}
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  {messages.arrival.wifi.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <CopyField
                  label={messages.arrival.wifi.network}
                  value={property.wifi_network}
                  locale={locale}
                />
                {property.wifi_password ? (
                  <CopyField
                    label={messages.arrival.wifi.password}
                    value={property.wifi_password}
                    locale={locale}
                  />
                ) : null}
              </div>
              {wifiQr ? (
                <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-sea-mist px-4 py-5">
                  {/* biome-ignore lint/performance/noImgElement: inline data URL generated server-side, nothing for the image optimizer to do */}
                  <img
                    src={wifiQr}
                    alt={messages.arrival.wifi.qrAlt}
                    width={144}
                    height={144}
                    className="size-36 rounded-lg"
                  />
                  <span className="max-w-[26ch] text-center text-xs font-semibold leading-snug text-muted-foreground">
                    {messages.arrival.wifi.qrCaption}
                  </span>
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}
      </div>
    </GuideSection>
  );
}

function IconBox({ name }: { name: string }) {
  return (
    <span className="grid size-[46px] flex-none place-items-center rounded-[13px] bg-sea-light text-primary">
      <Icon name={name} className="size-[22px]" />
    </span>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex items-start gap-4 p-6 shadow-soft">
      <IconBox name={icon} />
      <div>
        <h3 className="mb-1 text-base font-bold tracking-[-.01em]">{title}</h3>
        {children}
      </div>
    </Card>
  );
}
